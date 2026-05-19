import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { adminUsers } from "@/lib/schema";
import { hashPassword, revokeAllSessionsForUser } from "@/lib/auth";
import { validateResetToken, consumeResetToken } from "@/lib/admin/password-reset";
import { logSystemEvent } from "@/lib/admin/system-events";

export const runtime = "nodejs";

const resetSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = resetSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Validation failed." },
      { status: 422 },
    );
  }

  const { token, password } = parsed.data;

  const userInfo = await validateResetToken(token);
  if (!userInfo) {
    return NextResponse.json(
      { error: "Invalid or expired reset token." },
      { status: 400 },
    );
  }

  const passwordHash = await hashPassword(password);

  await db
    .update(adminUsers)
    .set({ passwordHash, updatedAt: new Date() })
    .where(eq(adminUsers.id, userInfo.adminUserId));

  await consumeResetToken(token);

  // Revoke all existing sessions to force re-login
  await revokeAllSessionsForUser(userInfo.adminUserId);

  await logSystemEvent({
    actorAdminUserId: userInfo.adminUserId,
    eventType: "admin.password_changed",
    description: "Password changed via reset link",
    ipAddress: req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip"),
  });

  return NextResponse.json({ message: "Password has been reset successfully." });
}
