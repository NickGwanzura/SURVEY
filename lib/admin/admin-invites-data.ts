import "server-only";

import { SignJWT, jwtVerify } from "jose";

const INVITE_SECRET = (() => {
  // Re-use the AUTH_SECRET for invite tokens
  const raw = process.env.AUTH_SECRET;
  if (!raw) {
    throw new Error("AUTH_SECRET is not set. Add it to .env.local.");
  }
  return new TextEncoder().encode(raw);
})();

const INVITE_JWT_ALG = "HS256";
const INVITE_ISSUER = "zw-rac-survey";
const INVITE_AUDIENCE = "admin-invite";
const INVITE_TTL_HOURS = 72; // 3 days

export type InvitePayload = {
  email: string;
  name: string;
  role: "admin" | "super_admin";
};

/**
 * Generate a signed JWT invite token for a new admin user.
 * The token encodes the email, name, and role so no DB table is needed.
 */
export async function createInviteToken(
  payload: InvitePayload,
): Promise<string> {
  const expiresAt = Math.floor(Date.now() / 1000) + INVITE_TTL_HOURS * 3600;
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: INVITE_JWT_ALG })
    .setIssuer(INVITE_ISSUER)
    .setAudience(INVITE_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(INVITE_SECRET);
}

/**
 * Verify and decode an invite token. Returns null if invalid/expired.
 */
export async function verifyInviteToken(
  token: string,
): Promise<InvitePayload | null> {
  try {
    const { payload } = await jwtVerify(token, INVITE_SECRET, {
      issuer: INVITE_ISSUER,
      audience: INVITE_AUDIENCE,
    });
    if (
      typeof payload.email !== "string" ||
      typeof payload.name !== "string" ||
      typeof payload.role !== "string"
    ) {
      return null;
    }
    if (payload.role !== "admin" && payload.role !== "super_admin") {
      return null;
    }
    return {
      email: payload.email,
      name: payload.name,
      role: payload.role,
    };
  } catch {
    return null;
  }
}

/** Create the invite URL from a token */
export function buildInviteUrl(token: string): string {
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.VERCEL_URL ??
    "http://localhost:3000";
  return `${origin}/admin/setup?token=${token}`;
}
