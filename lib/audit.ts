import { db } from "@/lib/db";
import { auditLog } from "@/lib/schema";

export type ActorInfo =
  | { type: "admin"; adminUserId: string; display?: string }
  | { type: "applicant"; display: string };

export type FieldChange = { before: unknown; after: unknown };

const NON_EDITABLE_FIELDS = [
  "id",
  "createdAt",
  "updatedAt",
  "submittedAt",
  "ipAddress",
  "userAgent",
  "submissionSource",
];

function valuesEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a == null && b == null) return true;
  if (a == null || b == null) return false;

  // Normalise numeric strings vs numbers (Drizzle numeric returns strings)
  if (
    (typeof a === "string" || typeof a === "number") &&
    (typeof b === "string" || typeof b === "number")
  ) {
    const numA = Number(a);
    const numB = Number(b);
    if (!Number.isNaN(numA) && !Number.isNaN(numB)) {
      return numA === numB;
    }
  }

  // Normalise Date objects vs ISO strings
  if (a instanceof Date || b instanceof Date) {
    const dateA = a instanceof Date ? a : new Date(a as string);
    const dateB = b instanceof Date ? b : new Date(b as string);
    if (!Number.isNaN(dateA.getTime()) && !Number.isNaN(dateB.getTime())) {
      return dateA.getTime() === dateB.getTime();
    }
  }

  return JSON.stringify(a) === JSON.stringify(b);
}

export function computeDiff<T extends Record<string, unknown>>(
  before: T,
  after: T,
  excludeFields: string[] = NON_EDITABLE_FIELDS,
): Record<string, FieldChange> {
  const changes: Record<string, FieldChange> = {};
  for (const key of Object.keys(after)) {
    if (excludeFields.includes(key)) continue;
    const b = before[key];
    const a = after[key];
    if (!valuesEqual(b, a)) {
      changes[key] = { before: b, after: a };
    }
  }
  return changes;
}

export async function logSurveyEdit(
  surveyId: string,
  actor: ActorInfo,
  changes: Record<string, FieldChange>,
): Promise<void> {
  const entries = Object.entries(changes).map(([field, diff]) => ({
    surveyId,
    actorAdminUserId: actor.type === "admin" ? actor.adminUserId : null,
    actorType: actor.type,
    actorDisplay: actor.display ?? null,
    action: `${field}:updated`,
    payload: { field, before: diff.before, after: diff.after },
  }));

  if (entries.length === 0) return;

  await db.insert(auditLog).values(entries);
}
