import "server-only";

import { eq, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import {
  registrationNumberSequence,
  retailersSurvey,
  techniciansSurvey,
} from "@/lib/schema";

export type EntityType = "technician" | "retailer";

const PREFIXES: Record<EntityType, string> = {
  technician: "ZW-RAC",
  retailer: "ZW-RTL",
};

/**
 * Atomically assign the next sequential registration number to a survey
 * submission.  Idempotent — if the row already has a registration number
 * it is returned as-is.
 */
export async function assignRegistrationNumber(
  entityType: EntityType,
  surveyId: string,
): Promise<string> {
  const table =
    entityType === "technician" ? techniciansSurvey : retailersSurvey;

  // --- 1.  Check if already assigned ---
  const existing = await db
    .select({ registrationNumber: table.registrationNumber })
    .from(table)
    .where(eq(table.id, surveyId))
    .limit(1);

  if (existing.length === 0) {
    throw new Error(
      `[reg-number] ${entityType} survey ${surveyId} not found`,
    );
  }
  if (existing[0].registrationNumber) {
    return existing[0].registrationNumber;
  }

  // --- 2.  Atomically increment the counter (Neon HTTP driver limitation:
  //          no server-side transactions, so this is a best-effort
  //          approach.  Gaps in the sequence are acceptable.) ---
  const prefix = PREFIXES[entityType];

  // Seed row on first call
  await db
    .insert(registrationNumberSequence)
    .values({ entityType, counter: 0 })
    .onConflictDoNothing();

  const [next] = await db
    .update(registrationNumberSequence)
    .set({ counter: sql`${registrationNumberSequence.counter} + 1` })
    .where(eq(registrationNumberSequence.entityType, entityType))
    .returning({ counter: registrationNumberSequence.counter });

  if (!next) {
    throw new Error(
      `[reg-number] Failed to increment counter for ${entityType}`,
    );
  }

  const number = `${prefix}-${String(next.counter).padStart(6, "0")}`;

  // --- 3.  Write back to the survey row ---
  // Handle unique-constraint violations in case of a race condition by
  // retrying once with the next number.
  try {
    await db
      .update(table)
      .set({ registrationNumber: number })
      .where(eq(table.id, surveyId));
  } catch {
    // Retry with the auto-incremented value (another concurrent call may
    // have claimed the same number).
    const [retry] = await db
      .update(registrationNumberSequence)
      .set({ counter: sql`${registrationNumberSequence.counter} + 1` })
      .where(eq(registrationNumberSequence.entityType, entityType))
      .returning({ counter: registrationNumberSequence.counter });

    if (!retry) {
      throw new Error(
        `[reg-number] Failed to retry counter increment for ${entityType}`,
      );
    }

    const fallbackNumber = `${prefix}-${String(retry.counter).padStart(6, "0")}`;

    await db
      .update(table)
      .set({ registrationNumber: fallbackNumber })
      .where(eq(table.id, surveyId));

    return fallbackNumber;
  }

  return number;
}
