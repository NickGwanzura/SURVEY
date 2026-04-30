import "server-only";

import { cookies } from "next/headers";

import { loadActiveSession } from "./auth";
import { AUTH_COOKIE_NAME } from "./auth-edge";
import type { AdminUser } from "./schema";

export type CurrentAdmin = {
  user: AdminUser;
  sessionId: string;
};

export async function getCurrentAdmin(): Promise<CurrentAdmin | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;
  return loadActiveSession(token);
}

export async function requireAdmin(): Promise<CurrentAdmin> {
  const admin = await getCurrentAdmin();
  if (!admin) {
    throw new Error("Unauthorized");
  }
  return admin;
}
