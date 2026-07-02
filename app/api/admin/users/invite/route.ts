import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";

import { getCurrentAdmin } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { adminUsers } from "@/lib/schema";
import { createInviteToken } from "@/lib/admin/admin-invites-data";
import { sendAdminInviteEmail } from "@/lib/admin/email";

const inviteSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
  name: z.string().trim().min(1).max(200),
  role: z.enum(["admin", "super_admin"]).default("admin"),
});

export async function POST(request: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Only super_admins can invite new admins
  if (admin.user.role !== "super_admin") {
    return NextResponse.json(
      { error: "Only super administrators can invite new admins." },
      { status: 403 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = inviteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const { email, name, role } = parsed.data;

  // Check if user already exists
  const existing = await db
    .select({ id: adminUsers.id })
    .from(adminUsers)
    .where(eq(adminUsers.email, email))
    .limit(1);

  if (existing.length > 0) {
    return NextResponse.json(
      { error: "An admin account with this email already exists." },
      { status: 409 },
    );
  }

  if (!process.env.AUTH_SECRET) {
    return NextResponse.json(
      { error: "Server configuration error: AUTH_SECRET is not set." },
      { status: 500 },
    );
  }

  try {
    const token = await createInviteToken({ email, name, role });

    // Derive the origin from the request to guarantee the invite link works
    const protocol = request.headers.get("x-forwarded-proto") ?? "https";
    const host = request.headers.get("host") ?? "localhost:3000";
    const inviteUrl = `${protocol}://${host}/admin/setup?token=${token}`;

    // Send the invite email (fire-and-forget)
    const emailResult = await sendAdminInviteEmail(email, admin.user.name, inviteUrl);

    if (!emailResult.ok) {
      return NextResponse.json(
        { error: `Failed to send invite email: ${emailResult.error}` },
        { status: 502 },
      );
    }

    return NextResponse.json({
      invited: true,
      email,
      name,
      role,
    });
  } catch (err) {
    console.error("[POST /api/admin/users/invite]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
