import { and, eq, gt, isNull } from "drizzle-orm";
import { SignJWT, jwtVerify } from "jose";

import { db } from "./db";
import { adminSessions, adminUsers } from "./schema";
import type { AdminUser } from "./schema";

const COOKIE_NAME = process.env.AUTH_COOKIE_NAME ?? "zw_rac_admin";
const SESSION_TTL_HOURS = Number(process.env.AUTH_SESSION_TTL_HOURS ?? "12");

const encodedSecret = (() => {
  const raw = process.env.AUTH_SECRET;
  if (!raw) {
    throw new Error("AUTH_SECRET is not set. Add it to .env.local.");
  }
  return new TextEncoder().encode(raw);
})();

const JWT_ALG = "HS256";
const JWT_ISSUER = "zw-rac-survey";
const JWT_AUDIENCE = "admin";

export type SessionPayload = {
  sub: string;
  sid: string;
  role: AdminUser["role"];
};

export async function hashPassword(password: string): Promise<string> {
  const bcrypt = await import("bcryptjs");
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  const bcrypt = await import("bcryptjs");
  return bcrypt.compare(password, hash);
}

export async function signSessionToken(payload: SessionPayload): Promise<string> {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_HOURS * 3600;
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: JWT_ALG })
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(encodedSecret);
}

export async function verifySessionToken(
  token: string,
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, encodedSecret, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });
    if (
      typeof payload.sub !== "string" ||
      typeof payload.sid !== "string" ||
      typeof payload.role !== "string"
    ) {
      return null;
    }
    return {
      sub: payload.sub,
      sid: payload.sid,
      role: payload.role as AdminUser["role"],
    };
  } catch {
    return null;
  }
}

export async function createSession(args: {
  adminUserId: string;
  ipAddress: string | null;
  userAgent: string | null;
}): Promise<{
  token: string;
  expiresAt: Date;
  cookieName: string;
}> {
  const expiresAt = new Date(Date.now() + SESSION_TTL_HOURS * 3600 * 1000);

  const [session] = await db
    .insert(adminSessions)
    .values({
      adminUserId: args.adminUserId,
      expiresAt,
      ipAddress: args.ipAddress,
      userAgent: args.userAgent,
    })
    .returning();

  if (!session) {
    throw new Error("Failed to create admin session.");
  }

  const [user] = await db
    .select({ role: adminUsers.role })
    .from(adminUsers)
    .where(eq(adminUsers.id, args.adminUserId))
    .limit(1);

  if (!user) {
    throw new Error("Admin user not found while creating session.");
  }

  const token = await signSessionToken({
    sub: args.adminUserId,
    sid: session.id,
    role: user.role,
  });

  return { token, expiresAt, cookieName: COOKIE_NAME };
}

export async function loadActiveSession(token: string): Promise<{
  user: AdminUser;
  sessionId: string;
} | null> {
  const payload = await verifySessionToken(token);
  if (!payload) return null;

  const [row] = await db
    .select({
      session: adminSessions,
      user: adminUsers,
    })
    .from(adminSessions)
    .innerJoin(adminUsers, eq(adminSessions.adminUserId, adminUsers.id))
    .where(
      and(
        eq(adminSessions.id, payload.sid),
        eq(adminUsers.id, payload.sub),
        eq(adminUsers.isActive, true),
        isNull(adminSessions.revokedAt),
        gt(adminSessions.expiresAt, new Date()),
      ),
    )
    .limit(1);

  if (!row) return null;
  return { user: row.user, sessionId: row.session.id };
}

export async function revokeSession(sessionId: string): Promise<void> {
  await db
    .update(adminSessions)
    .set({ revokedAt: new Date() })
    .where(eq(adminSessions.id, sessionId));
}

export async function revokeAllSessionsForUser(
  adminUserId: string,
): Promise<void> {
  await db
    .update(adminSessions)
    .set({ revokedAt: new Date() })
    .where(
      and(
        eq(adminSessions.adminUserId, adminUserId),
        isNull(adminSessions.revokedAt),
      ),
    );
}

export const AUTH_COOKIE_NAME = COOKIE_NAME;
export const AUTH_SESSION_TTL_HOURS = SESSION_TTL_HOURS;
