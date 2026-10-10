import "server-only";

import { and, desc, eq, gt, lt, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { rateLimitEntries } from "@/lib/schema";

export type RateLimitResult = {
  allowed: boolean;
  retryAfter: number;
};

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 10;

/**
 * DB-backed rate limiter.
 *
 * Uses a PostgreSQL transaction-level advisory lock so the limit is shared
 * across instances and concurrent requests cannot lose increments.
 *
 * @param key — Unique identifier for the client (e.g. `login:<ip>`)
 * @param maxAttempts — Max allowed attempts in the window (default 10)
 * @param windowMs — Time window in ms (default 15 min)
 */
export async function checkRateLimit(
  key: string,
  maxAttempts: number = MAX_ATTEMPTS,
  windowMs: number = WINDOW_MS,
): Promise<RateLimitResult> {
  const now = new Date();

  // Opportunistically clean up expired entries (roughly 1% of calls)
  try {
    if (Math.random() < 0.01) {
      await db
        .delete(rateLimitEntries)
        .where(lt(rateLimitEntries.resetAt, now));
    }
  } catch {
    // Cleanup is best-effort
  }

  try {
    return await db.transaction(async (tx) => {
      await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${key}))`);

      const [existing] = await tx
        .select({ id: rateLimitEntries.id, count: rateLimitEntries.count, resetAt: rateLimitEntries.resetAt })
        .from(rateLimitEntries)
        .where(and(eq(rateLimitEntries.key, key), gt(rateLimitEntries.resetAt, now)))
        .orderBy(desc(rateLimitEntries.resetAt))
        .limit(1);

      if (!existing) {
        await tx.delete(rateLimitEntries).where(eq(rateLimitEntries.key, key));
        await tx.insert(rateLimitEntries).values({
          key,
          count: 1,
          resetAt: new Date(now.getTime() + windowMs),
        });
        return { allowed: true, retryAfter: 0 };
      }

      if (existing.count >= maxAttempts) {
        return {
          allowed: false,
          retryAfter: Math.max(1, Math.ceil((existing.resetAt.getTime() - now.getTime()) / 1000)),
        };
      }

      await tx.update(rateLimitEntries)
        .set({ count: existing.count + 1, resetAt: existing.resetAt })
        .where(eq(rateLimitEntries.key, key));
      return { allowed: true, retryAfter: 0 };
    });
  } catch {
    // Fail closed: an unavailable limiter must never silently disable a guard.
    return { allowed: false, retryAfter: 60 };
  }
}

/**
 * Extract a client IP from a NextRequest, with a reasonable fallback.
 */
export function getClientIp(req: {
  headers: { get(name: string): string | null };
}): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}
