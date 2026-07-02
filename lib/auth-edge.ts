// Edge-runtime safe auth helpers — JWT verify only, no DB or bcrypt imports.
// Used by middleware which runs in the Edge Runtime.

import { jwtVerify } from "jose";

const JWT_ALG = "HS256";
const JWT_ISSUER = "zw-rac-survey";
const JWT_AUDIENCE = "admin";

export const AUTH_COOKIE_NAME =
  process.env.AUTH_COOKIE_NAME ?? "zw_rac_admin";

let encodedSecret: Uint8Array | null = null;
function getEncodedSecret(): Uint8Array {
  if (encodedSecret) return encodedSecret;
  const raw = process.env.AUTH_SECRET;
  if (!raw) {
    throw new Error("AUTH_SECRET is not set.");
  }
  encodedSecret = new TextEncoder().encode(raw);
  return encodedSecret;
}

export type EdgeSessionPayload = {
  sub: string;
  sid: string;
  role: "admin" | "super_admin";
};

export async function verifySessionTokenEdge(
  token: string,
): Promise<EdgeSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getEncodedSecret(), {
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
      role: payload.role as EdgeSessionPayload["role"],
    };
  } catch {
    return null;
  }
}
