import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq, inArray, sql } from "drizzle-orm";

import { getCurrentAdmin } from "@/lib/auth-server";
import { db } from "@/lib/db";
import {
  sendCertificateEmail,
  sendFlaggedEmail,
  sendVerifiedEmail,
} from "@/lib/admin/email";
import { generateCertificatePdf } from "@/lib/admin/certificate-pdf";
import { assignRegistrationNumber } from "@/lib/admin/registration-number";
import { auditLog, retailersSurvey, techniciansSurvey } from "@/lib/schema";
import { SUBMISSION_STATUSES } from "@/lib/constants/challenges";

const bulkActionSchema = z.object({
  ids: z
    .array(z.string().uuid())
    .min(1, "At least one ID required.")
    .max(200, "Maximum 200 IDs per request."),
  action: z.enum(["verify", "flag", "duplicate", "pending"]),
  reason: z.string().trim().max(1000).optional(),
  /** When "technician", also applies to retailers_survey. */
  surveyType: z.enum(["technician", "retailer"]).default("technician"),
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

  const { ids, action, reason, surveyType } = parsed.data;
  const newStatus = ACTION_TO_STATUS[action];

  const table =
    surveyType === "technician" ? techniciansSurvey : retailersSurvey;

  // Note: Neon HTTP driver does not support transactions. Operations run
  // sequentially; if sub-steps fail after the status update succeeds, the
  // status change still stands and the audit gap is acceptable for a
  // bulk admin action.
  try {
    // Fetch current rows before updating so we can send emails
    const rowsBefore = await db
      .select({
        id: table.id,
        firstName:
          surveyType === "technician"
            ? techniciansSurvey.firstName
            : retailersSurvey.contactPersonName,
        surname:
          surveyType === "technician"
            ? techniciansSurvey.surname
            : retailersSurvey.businessName,
        email: table.email,
        consentToPublicRegistry:
          surveyType === "technician"
            ? techniciansSurvey.consentToPublicRegistry
            : sql<boolean>`false`,
        registrationNumber: table.registrationNumber,
      })
      .from(table)
      .where(inArray(table.id, ids));

    const updateData: Partial<typeof table.$inferInsert> = {
      status: newStatus,
      updatedAt: new Date(),
    };
    if (action === "flag" && reason) {
      updateData.notes = reason;
    }

    const updatedRows = await db
      .update(table)
      .set(updateData)
      .where(inArray(table.id, ids))
      .returning({ id: table.id });

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
            surveyType,
          },
        })),
      );
    }

    // Send notification emails asynchronously — don't block the response
    for (const row of rowsBefore) {
      if (!row.email) continue;

      if (action === "verify") {
        // --- 1. Assign registration number ---
        if (!row.registrationNumber) {
          try {
            const regNumber = await assignRegistrationNumber(
              surveyType,
              row.id,
            );

            // --- 2. Generate certificate PDF ---
            const pdfBuffer = generateCertificatePdf({
              firstName: row.firstName,
              surname: row.surname,
              registrationNumber: regNumber,
              issueDate: new Date(),
              entityType: surveyType,
            });

            // --- 3. Send certificate email (with PDF attachment) ---
            sendCertificateEmail(
              row.email,
              row.firstName,
              regNumber,
              pdfBuffer,
            ).then((r) => {
              if (!r.ok)
                console.warn(
                  `[verify] Failed to send cert email to ${row.email}: ${r.error}`,
                );
            });
          } catch (err) {
            console.error(
              `[verify] Failed to issue certificate for ${row.id}:`,
              err,
            );
            // Fall back to the standard verified email
            sendVerifiedEmail(
              row.email,
              row.firstName,
              row.surname,
              surveyType === "technician" && row.consentToPublicRegistry,
            ).then((r) => {
              if (!r.ok)
                console.warn(
                  `[verify] Failed to send verified email to ${row.email}: ${r.error}`,
                );
            });
          }
        } else {
          // Already has a registration number — send verified email
          sendVerifiedEmail(
            row.email,
            row.firstName,
            row.surname,
            surveyType === "technician" && row.consentToPublicRegistry,
          ).then((r) => {
            if (!r.ok)
              console.warn(
                `[verify] Failed to send verified email to ${row.email}: ${r.error}`,
              );
          });
        }
      } else if (action === "flag") {
        sendFlaggedEmail(row.email, row.firstName, row.surname, reason).then(
          (r) => {
            if (!r.ok)
              console.warn(
                `[verify] Failed to notify ${row.email}: ${r.error}`,
              );
          },
        );
      }
    }

    return NextResponse.json({ updated: updatedRows.length });
  } catch (err) {
    console.error("[POST /api/admin/verify]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
