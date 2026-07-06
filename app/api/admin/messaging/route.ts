import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { and, eq, isNotNull } from "drizzle-orm";

import { getCurrentAdmin } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { adminUsers, techniciansSurvey } from "@/lib/schema";
import { sendBroadcastEmail } from "@/lib/admin/email";

export const runtime = "nodejs";

const broadcastSchema = z.object({
  subject: z.string().trim().min(1, "Subject is required.").max(200),
  message: z.string().trim().min(1, "Message is required.").max(10000),
  recipientType: z
    .enum(["technicians", "admins"])
    .optional()
    .default("technicians"),
  filterStatus: z
    .enum(["all", "verified", "pending", "flagged", "duplicate"])
    .optional()
    .default("all"),
});

export async function POST(request: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Only super admins can send broadcasts
  if (admin.user.role !== "super_admin") {
    return NextResponse.json(
      { error: "Only super admins can send broadcast messages." },
      { status: 403 },
    );
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json(
      { error: "Email service is not configured. Set the RESEND_API_KEY environment variable." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = broadcastSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const { subject, message, recipientType, filterStatus } = parsed.data;

  try {
    const recipients: string[] = [];

    if (recipientType === "admins") {
      // Fetch all active admin users
      const admins = await db
        .select({ email: adminUsers.email, name: adminUsers.name })
        .from(adminUsers)
        .where(eq(adminUsers.isActive, true));

      for (const a of admins) {
        if (a.email) recipients.push(a.email);
      }
    } else {
      // Fetch technicians with email addresses
      const conditions = [isNotNull(techniciansSurvey.email)];

      if (filterStatus !== "all") {
        conditions.push(eq(techniciansSurvey.status, filterStatus));
      }

      const technicians = await db
        .select({
          id: techniciansSurvey.id,
          firstName: techniciansSurvey.firstName,
          surname: techniciansSurvey.surname,
          email: techniciansSurvey.email,
          status: techniciansSurvey.status,
        })
        .from(techniciansSurvey)
        .where(conditions.length === 1 ? conditions[0] : and(...conditions));

      // Filter out null emails and deduplicate
      const emailSet = new Set<string>();
      for (const t of technicians) {
        if (t.email && !emailSet.has(t.email)) {
          emailSet.add(t.email);
          recipients.push(t.email);
        }
      }
    }

    if (recipients.length === 0) {
      return NextResponse.json(
        { error: "No recipients found matching the criteria." },
        { status: 404 },
      );
    }

    // Convert message plain text to simple HTML paragraphs
    const messageHtml = message
      .split("\n")
      .filter((line) => line.trim())
      .map((line) => `<p style="margin:0 0 12px;font-size:15px;color:#334155;line-height:1.7;">${escapeHtml(line.trim())}</p>`)
      .join("");

    const result = await sendBroadcastEmail(recipients, subject, messageHtml);

    return NextResponse.json({
      sent: result.success,
      failed: result.failed,
      total: recipients.length,
      errors: result.errors.length > 0 ? result.errors : undefined,
    });
  } catch (err) {
    console.error("[POST /api/admin/messaging]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/** Simple HTML escaping to prevent injection in generated emails. */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
