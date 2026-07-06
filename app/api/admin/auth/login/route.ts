import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import {
  AUTH_COOKIE_NAME,
  AUTH_SESSION_TTL_HOURS,
  createSession,
  verifyPassword,
} from "@/lib/auth";
import { db } from "@/lib/db";
import { adminUsers } from "@/lib/schema";
import { logSystemEvent } from "@/lib/admin/system-events";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

const loginSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
  password: z.string().min(1),
});

// ─── POST handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // Rate-limit by IP
  const ip = getClientIp(req);
  const { allowed, retryAfter } = await checkRateLimit(`login:${ip}`);

  if (!allowed) {
    return NextResponse.json(
      { error: `Too many attempts. Try again in ${retryAfter} seconds.` },
      {
        status: 429,
        headers: { "Retry-After": String(retryAfter) },
      },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Email and password are required." },
      { status: 422 },
    );
  }

  const [user] = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.email, parsed.data.email))
    .limit(1);

  if (!user || !user.isActive) {
    return NextResponse.json(
      { error: "Invalid email or password." },
      { status: 401 },
    );
  }

  const ok = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!ok) {
    return NextResponse.json(
      { error: "Invalid email or password." },
      { status: 401 },
    );
  }

  const session = await createSession({
    adminUserId: user.id,
    ipAddress: ip,
    userAgent: req.headers.get("user-agent"),
  });

  await db
    .update(adminUsers)
    .set({ lastLoginAt: new Date() })
    .where(eq(adminUsers.id, user.id));

  // Log the login event (fire-and-forget)
  logSystemEvent({
    actorAdminUserId: user.id,
    eventType: "admin.login",
    description: `Admin login: ${user.email}`,
    ipAddress: ip,
  }).catch((err) => console.error("[login] logSystemEvent failed:", err));

  const res = NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  });

  res.cookies.set(AUTH_COOKIE_NAME, session.token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: session.expiresAt,
    maxAge: AUTH_SESSION_TTL_HOURS * 3600,
  });

  return res;
}
