import "server-only";

import { and, eq, gt, lt, sql } from "drizzle-orm";

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
 * Uses the `rate_limit_entries` table so the limit is shared across all
 * serverless instances. Stale entries are cleaned up opportunistically.
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
    // Upsert: try to find an existing entry for this key that hasn't expired
    const [existing] = await db
      .select()
      .from(rateLimitEntries)
      .where(
        and(
          eq(rateLimitEntries.key, key),
          gt(rateLimitEntries.resetAt, now),
        ),
      )
      .limit(1);

    if (!existing) {
      // Insert a fresh entry
      const resetAt = new Date(now.getTime() + windowMs);
      await db.insert(rateLimitEntries).values({ key, count: 1, resetAt });
      return { allowed: true, retryAfter: 0 };
    }

    if (existing.count >= maxAttempts) {
      const retryAfter = Math.ceil(
        (existing.resetAt.getTime() - now.getTime()) / 1000,
      );
      return { allowed: false, retryAfter };
    }

    // Increment count
    await db
      .update(rateLimitEntries)
      .set({
        count: sql`${rateLimitEntries.count} + 1`,
      })
      .where(eq(rateLimitEntries.id, existing.id));

    return { allowed: true, retryAfter: 0 };
  } catch {
    // If the DB call fails, allow the request through rather than blocking it
    return { allowed: true, retryAfter: 0 };
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
