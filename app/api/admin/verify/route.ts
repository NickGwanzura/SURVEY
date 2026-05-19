import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq, inArray } from "drizzle-orm";

import { getCurrentAdmin } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { sendVerifiedEmail, sendFlaggedEmail } from "@/lib/admin/email";
import { auditLog, techniciansSurvey } from "@/lib/schema";
import { SUBMISSION_STATUSES } from "@/lib/constants/challenges";

const bulkActionSchema = z.object({
  ids: z
    .array(z.string().uuid())
    .min(1, "At least one ID required.")
    .max(200, "Maximum 200 IDs per request."),
  action: z.enum(["verify", "flag", "duplicate", "pending"]),
  reason: z.string().trim().max(1000).optional(),
});

const ACTION_TO_STATUS: Record<
  z.infer<typeof bulkActionSchema>["action"],
  (typeof SUBMISSION_STATUSES)[number]
> = {
  verify: "verified",
  flag: "flagged",
  duplicate: "duplicate",
  pending: "pending",
};

export async function POST(request: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = bulkActionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const { ids, action, reason } = parsed.data;
  const newStatus = ACTION_TO_STATUS[action];

  // Note: Neon HTTP driver does not support transactions. Operations run
  // sequentially; if the audit insert fails after the status update succeeds,
  // the status change still stands and the audit gap is acceptable for a
  // bulk admin action.
  try {
    const updateData: Partial<typeof techniciansSurvey.$inferInsert> = {
      status: newStatus,
      updatedAt: new Date(),
    };
    if (action === "flag" && reason) {
      updateData.notes = reason;
    }

    // Fetch the current rows before updating so we can send emails
    const rowsBefore = await db
      .select({
        id: techniciansSurvey.id,
        firstName: techniciansSurvey.firstName,
        surname: techniciansSurvey.surname,
        email: techniciansSurvey.email,
        consentToPublicRegistry: techniciansSurvey.consentToPublicRegistry,
      })
      .from(techniciansSurvey)
      .where(inArray(techniciansSurvey.id, ids));

    const updatedRows = await db
      .update(techniciansSurvey)
      .set(updateData)
      .where(inArray(techniciansSurvey.id, ids))
      .returning({ id: techniciansSurvey.id });

    if (updatedRows.length > 0) {
      await db.insert(auditLog).values(
        updatedRows.map((row) => ({
          surveyId: row.id,
          actorAdminUserId: admin.user.id,
          action: `status:${newStatus}`,
          payload: {
            bulk: true,
            action,
            newStatus,
            reason: reason ?? null,
          },
        })),
      );
    }

    // Send notification emails asynchronously — don't block the response
    if (action === "verify" || action === "flag") {
      for (const row of rowsBefore) {
        if (!row.email) continue;
        if (action === "verify") {
          sendVerifiedEmail(
            row.email,
            row.firstName,
            row.surname,
            row.consentToPublicRegistry,
          ).then((r) => {
            if (!r.ok) console.warn(`[verify] Failed to notify ${row.email}: ${r.error}`);
          });
        } else if (action === "flag") {
          sendFlaggedEmail(
            row.email,
            row.firstName,
            row.surname,
            reason,
          ).then((r) => {
            if (!r.ok) console.warn(`[verify] Failed to notify ${row.email}: ${r.error}`);
          });
        }
      }
    }

    return NextResponse.json({ updated: updatedRows.length });
  } catch (err) {
    console.error("[POST /api/admin/verify]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
