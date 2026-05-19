import "server-only";

import { randomUUID } from "crypto";
import { and, eq, gt, isNull, lt } from "drizzle-orm";
import { SignJWT, jwtVerify } from "jose";

import { db } from "@/lib/db";
import { adminUsers, passwordResetTokens } from "@/lib/schema";
import { hashPassword } from "@/lib/auth";

const RESET_EXPIRY_HOURS = 2;

const encodedSecret = (() => {
  const raw = process.env.AUTH_SECRET;
  if (!raw) throw new Error("AUTH_SECRET is not set.");
  return new TextEncoder().encode(raw);
})();

/** Create a reset token for the given admin user and return the signed JWT. */
export async function createResetToken(
  adminUserId: string,
): Promise<{ token: string; expiresAt: Date }> {
  const expiresAt = new Date(Date.now() + RESET_EXPIRY_HOURS * 3600 * 1000);
  const jti = randomUUID();

  // Store the JTI hash in the DB so each token can be used at most once
  const encoder = new TextEncoder();
  const hashData = await crypto.subtle.digest(
    "SHA-256",
    encoder.encode(jti),
  );
  const tokenHash = Array.from(new Uint8Array(hashData))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  await db.insert(passwordResetTokens).values({
    adminUserId,
    tokenHash,
    expiresAt,
  });

  const token = await new SignJWT({ jti, sub: adminUserId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer("zw-rac-survey")
    .setAudience("password-reset")
    .setExpirationTime(Math.floor(expiresAt.getTime() / 1000))
    .setIssuedAt()
    .sign(encodedSecret);

  return { token, expiresAt };
}

/** Validate a reset token and return the admin user ID if valid. */
export async function validateResetToken(
  token: string,
): Promise<{ adminUserId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, encodedSecret, {
      issuer: "zw-rac-survey",
      audience: "password-reset",
    });

    if (!payload.jti || typeof payload.jti !== "string" || !payload.sub) {
      return null;
    }

    // Hash the JTI to look up the DB record
    const encoder = new TextEncoder();
    const hashData = await crypto.subtle.digest(
      "SHA-256",
      encoder.encode(payload.jti),
    );
    const tokenHash = Array.from(new Uint8Array(hashData))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const [record] = await db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.tokenHash, tokenHash),
          eq(passwordResetTokens.adminUserId, payload.sub),
          isNull(passwordResetTokens.usedAt),
          gt(passwordResetTokens.expiresAt, new Date()),
        ),
      )
      .limit(1);

    if (!record) return null;

    return { adminUserId: record.adminUserId };
  } catch {
    return null;
  }
}

/** Mark a reset token as used (after a successful password change). */
export async function consumeResetToken(token: string): Promise<void> {
  try {
    const { payload } = await jwtVerify(token, encodedSecret, {
      issuer: "zw-rac-survey",
      audience: "password-reset",
    });

    if (!payload.jti || typeof payload.jti !== "string") return;

    const encoder = new TextEncoder();
    const hashData = await crypto.subtle.digest(
      "SHA-256",
      encoder.encode(payload.jti),
    );
    const tokenHash = Array.from(new Uint8Array(hashData))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    await db
      .update(passwordResetTokens)
      .set({ usedAt: new Date() })
      .where(eq(passwordResetTokens.tokenHash, tokenHash));
  } catch {
    // Silently fail — token will expire eventually
  }
}

/** Clean up expired tokens (call periodically or inline). */
export async function cleanExpiredTokens(): Promise<void> {
  await db
    .delete(passwordResetTokens)
    .where(lt(passwordResetTokens.expiresAt, new Date()));
}
