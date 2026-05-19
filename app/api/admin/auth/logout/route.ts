import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";

import { AUTH_COOKIE_NAME, revokeSession, verifySessionToken } from "@/lib/auth";
import { db } from "@/lib/db";
import { adminUsers } from "@/lib/schema";
import { logSystemEvent } from "@/lib/admin/system-events";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  let actorId: string | null = null;

  if (token) {
    const payload = await verifySessionToken(token);
    if (payload) {
      actorId = payload.sub;
      await revokeSession(payload.sid);
    }
  }

  // Log the logout event (fire-and-forget; errors must never prevent cookie clearing)
  try {
    let email = "unknown";
    if (actorId) {
      const [user] = await db
        .select({ email: adminUsers.email })
        .from(adminUsers)
        .where(eq(adminUsers.id, actorId))
        .limit(1);
      if (user) email = user.email;
    }

    logSystemEvent({
      actorAdminUserId: actorId,
      eventType: "admin.logout",
      description: `Admin logout: ${email}`,
      ipAddress: req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip"),
    });
  } catch {
    // Non-fatal — don't let logging failures prevent sign-out
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.delete(AUTH_COOKIE_NAME);
  return res;
}
