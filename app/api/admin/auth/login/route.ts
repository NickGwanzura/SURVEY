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

export const runtime = "nodejs";

const loginSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
  password: z.string().min(1),
});

// ─── In-memory rate limiter ──────────────────────────────────────────────────
// Note: in serverless environments each instance has its own map, so this is
// defense-in-depth rather than a hard guarantee. For stricter enforcement add
// an external store (Upstash Redis, etc.).

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX_ATTEMPTS = 10;

const attemptStore = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(key: string): { allowed: boolean; retryAfter: number } {
  const now = Date.now();
  const entry = attemptStore.get(key);

  if (!entry || now > entry.resetAt) {
    attemptStore.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, retryAfter: 0 };
  }

  entry.count += 1;

  if (entry.count > RATE_LIMIT_MAX_ATTEMPTS) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, retryAfter };
  }

  return { allowed: true, retryAfter: 0 };
}

// ─── IP helpers ──────────────────────────────────────────────────────────────

function getClientIp(req: NextRequest): string | null {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip");
}

// ─── POST handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // Rate-limit by IP
  const ip = getClientIp(req) ?? "unknown";
  const { allowed, retryAfter } = checkRateLimit(ip);

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
