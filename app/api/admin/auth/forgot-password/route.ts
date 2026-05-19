import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { adminUsers } from "@/lib/schema";
import { createResetToken } from "@/lib/admin/password-reset";
import { sendPasswordResetEmail } from "@/lib/admin/email";
import { logSystemEvent } from "@/lib/admin/system-events";

export const runtime = "nodejs";

const forgotSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
});

export async function POST(req: NextRequest) {
  // Always return 200 to prevent email enumeration
  const okResponse = NextResponse.json({
    message:
      "If an account with that email exists, a password reset link has been sent.",
  });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return okResponse;
  }

  const parsed = forgotSchema.safeParse(body);
  if (!parsed.success) {
    return okResponse;
  }

  const { email } = parsed.data;

  const [user] = await db
    .select({ id: adminUsers.id, name: adminUsers.name, isActive: adminUsers.isActive })
    .from(adminUsers)
    .where(eq(adminUsers.email, email))
    .limit(1);

  if (!user || !user.isActive) {
    return okResponse;
  }

  try {
    const { token, expiresAt } = await createResetToken(user.id);

    const protocol = req.headers.get("x-forwarded-proto") ?? "https";
    const host = req.headers.get("host") ?? "localhost:3000";
    const resetUrl = `${protocol}://${host}/admin/reset-password?token=${token}`;

    await sendPasswordResetEmail(email, user.name, resetUrl);

    await logSystemEvent({
      actorAdminUserId: user.id,
      eventType: "admin.password_reset",
      description: `Password reset requested for ${email}`,
      metadata: { expiresAt: expiresAt.toISOString() },
      ipAddress: req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip"),
    });
  } catch (err) {
    console.error("[forgot-password] Failed to send reset email:", err);
  }

  return okResponse;
}
