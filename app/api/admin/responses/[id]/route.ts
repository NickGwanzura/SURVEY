import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";

import { computeDiff, logSurveyEdit } from "@/lib/audit";
import { getCurrentAdmin } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { auditLog, techniciansSurvey } from "@/lib/schema";
import {
  getResponseById,
  patchResponseSchema,
} from "@/lib/admin/responses-data";
import { sendFlaggedEmail, sendVerifiedEmail } from "@/lib/admin/email";
import { logSystemEvent } from "@/lib/admin/system-events";
import { surveyUpdateSchema } from "@/lib/validation";

const idSchema = z.string().uuid();

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(
  _request: NextRequest,
  { params }: RouteContext,
) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!idSchema.safeParse(id).success) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  try {
    const data = await getResponseById(id);
    if (!data) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(data);
  } catch (err) {
    console.error("[GET /api/admin/responses/[id]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteContext,
) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!idSchema.safeParse(id).success) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = patchResponseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const updates = parsed.data;

  // Fetch existing row to build before/after diff
  const existing = await db
    .select()
    .from(techniciansSurvey)
    .where(eq(techniciansSurvey.id, id))
    .limit(1);

  if (existing.length === 0 || !existing[0]) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const before = existing[0];
  const changes: Record<string, { before: unknown; after: unknown }> = {};

  if (updates.status !== undefined && updates.status !== before.status) {
    changes["status"] = { before: before.status, after: updates.status };
  }
  if ("notes" in updates && updates.notes !== before.notes) {
    changes["notes"] = { before: before.notes, after: updates.notes };
  }
  if (updates.flagReason !== undefined && updates.status === "flagged") {
    changes["flagReason"] = { before: null, after: updates.flagReason };
  }

  if (Object.keys(changes).length === 0) {
    // Nothing actually changed
    return NextResponse.json(before);
  }

  try {
    const now = new Date();
    const updateData: Partial<typeof techniciansSurvey.$inferInsert> = {
      updatedAt: now,
    };
    if (updates.status !== undefined) updateData.status = updates.status;
    if ("notes" in updates) {
      // null means "clear notes"; undefined means "not provided" (no change)
      updateData.notes = updates.notes === null ? null : (updates.notes ?? undefined);
    }

    const updatedRows = await db
      .update(techniciansSurvey)
      .set(updateData)
      .where(eq(techniciansSurvey.id, id))
      .returning();

    const updated = updatedRows[0];
    if (!updated) {
      return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }

    // Write audit log entries for each changed field
    for (const [field, diff] of Object.entries(changes)) {
      const action =
        field === "status" ? `status:${String(diff.after)}` : `${field}:updated`;
      await db.insert(auditLog).values({
        surveyId: id,
        actorAdminUserId: admin.user.id,
        action,
        payload: { field, before: diff.before, after: diff.after },
      });
    }

    // Send notification email + log system event when status changes
    if (updates.status === "verified" && before.email) {
      sendVerifiedEmail(
        before.email,
        before.firstName,
        before.surname,
        before.consentToPublicRegistry,
      ).then((r) => {
        if (!r.ok) console.warn(`[PATCH] Failed to notify ${before.email}: ${r.error}`);
      });
      logSystemEvent({
        actorAdminUserId: admin.user.id,
        eventType: "survey.verified",
        description: `Survey ${id} verified — ${before.firstName} ${before.surname}`,
        metadata: { surveyId: id, email: before.email },
      }).catch((err) => console.error("[PATCH] logSystemEvent failed:", err));
    } else if (updates.status === "flagged" && before.email) {
      sendFlaggedEmail(
        before.email,
        before.firstName,
        before.surname,
        updates.flagReason,
      ).then((r) => {
        if (!r.ok) console.warn(`[PATCH] Failed to notify ${before.email}: ${r.error}`);
      });
      logSystemEvent({
        actorAdminUserId: admin.user.id,
        eventType: "survey.flagged",
        description: `Survey ${id} flagged — ${before.firstName} ${before.surname}`,
        metadata: { surveyId: id, reason: updates.flagReason },
      }).catch((err) => console.error("[PATCH] logSystemEvent failed:", err));
    }

    return NextResponse.json(updated);
  } catch (err) {
    console.error("[PATCH /api/admin/responses/[id]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: RouteContext,
) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!idSchema.safeParse(id).success) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = surveyUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const data = parsed.data;

  try {
    const existingRows = await db
      .select()
      .from(techniciansSurvey)
      .where(eq(techniciansSurvey.id, id))
      .limit(1);

    if (existingRows.length === 0 || !existingRows[0]) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const before = existingRows[0];

    // Prevent duplicate phone if changed
    if (data.phone !== before.phone) {
      const dup = await db
        .select({ id: techniciansSurvey.id })
        .from(techniciansSurvey)
        .where(eq(techniciansSurvey.phone, data.phone))
        .limit(1);
      if (dup.length > 0 && dup[0]?.id !== id) {
        return NextResponse.json(
          { error: "This phone number is already used by another application." },
          { status: 409 },
        );
      }
    }

    const now = new Date();

    const [updated] = await db
      .update(techniciansSurvey)
      .set({
        firstName: data.firstName,
        surname: data.surname,
        gender: data.gender,
        ageGroup: data.ageGroup,
        educationLevel: data.educationLevel,
        yearsExperience: data.yearsExperience,
        mainWorkFocus: data.mainWorkFocus,
        mainWorkFocusOther: data.mainWorkFocusOther,
        province: data.province,
        city: data.city,
        suburb: data.suburb,
        gpsLatitude: data.gpsLatitude?.toString() ?? null,
        gpsLongitude: data.gpsLongitude?.toString() ?? null,
        gpsAccuracyMeters: data.gpsAccuracyMeters?.toString() ?? null,
        phone: data.phone,
        email: data.email,
        hasFormalTraining: data.hasFormalTraining,
        trainingInstitution: data.trainingInstitution,
        trainingYear: data.trainingYear ?? null,
        hasCertification: data.hasCertification,
        certificationsHeld: data.certificationsHeld ?? null,
        certificationNumber: data.certificationNumber,
        hevacrazMemberNumber: data.hevacrazMemberNumber,
        confidenceTraditionalRefrigerants: data.confidenceTraditionalRefrigerants,
        confidenceLowGwpRefrigerants: data.confidenceLowGwpRefrigerants,
        accessToTools: data.accessToTools,
        accessToSpareParts: data.accessToSpareParts,
        accessToLowGwpRefrigerants: data.accessToLowGwpRefrigerants,
        obstacleHighImportCosts: data.obstacleHighImportCosts,
        obstacleForexShortages: data.obstacleForexShortages,
        obstacleUnreliableSuppliers: data.obstacleUnreliableSuppliers,
        obstacleCounterfeitProducts: data.obstacleCounterfeitProducts,
        obstaclesOther: data.obstaclesOther,
        biggestDailyChallenge: data.biggestDailyChallenge,
        biggestDailyChallengeOther: data.biggestDailyChallengeOther,
        loadSheddingFrequency: data.loadSheddingFrequency,
        refrigerantRecoveryEquipmentUse: data.refrigerantRecoveryEquipmentUse,
        ppeAccess: data.ppeAccess,
        ehsComplianceBarriers: data.ehsComplianceBarriers,
        ehsComplianceBarriersOther: data.ehsComplianceBarriersOther,
        installsEnergyEfficient: data.installsEnergyEfficient,
        energyEfficientBarriers: data.energyEfficientBarriers ?? null,
        energyEfficientBarriersOther: data.energyEfficientBarriersOther,
        consentToContact: data.consentToContact,
        consentToPublicRegistry: data.consentToPublicRegistry,
        preferredLanguage: data.preferredLanguage,
        profilePhotoUrl: data.profilePhotoUrl,
        updatedAt: now,
      })
      .where(eq(techniciansSurvey.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }

    const changes = computeDiff(
      before as unknown as Record<string, unknown>,
      updated as unknown as Record<string, unknown>,
    );

    await logSurveyEdit(id, {
      type: "admin",
      adminUserId: admin.user.id,
      display: `${admin.user.name} (${admin.user.email})`,
    }, changes);

    logSystemEvent({
      actorAdminUserId: admin.user.id,
      eventType: "survey.edited",
      description: `Survey ${id} edited — ${before.firstName} ${before.surname}`,
      metadata: { surveyId: id, changedFields: Object.keys(changes) },
    }).catch((err) => console.error("[PUT] logSystemEvent failed:", err));

    return NextResponse.json(updated);
  } catch (err) {
    console.error("[PUT /api/admin/responses/[id]]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: RouteContext,
) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!idSchema.safeParse(id).success) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const existing = await db
    .select()
    .from(techniciansSurvey)
    .where(eq(techniciansSurvey.id, id))
    .limit(1);

  if (existing.length === 0 || !existing[0]) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const survey = existing[0];

  try {
    // NOTE: The audit log row written here will be cascade-deleted when the
    // survey row is deleted (FK: audit_log.survey_id → technicians_survey.id
    // ON DELETE CASCADE). This is a known limitation — soft-delete is preferred
    // but the schema does not have a deletedAt column. The survey ID is
    // captured in the payload for forensic purposes.
    console.warn(
      `[DELETE /api/admin/responses/${id}] Audit trail will be lost due to cascade FK. Survey ID captured in payload only.`,
    );

    await db.insert(auditLog).values({
      surveyId: id,
      actorAdminUserId: admin.user.id,
      action: "deleted",
      payload: {
        surveyId: id,
        firstName: survey.firstName,
        surname: survey.surname,
        phone: survey.phone,
        status: survey.status,
        submittedAt: survey.submittedAt,
      },
    });

    logSystemEvent({
      actorAdminUserId: admin.user.id,
      eventType: "survey.deleted",
      description: `Survey ${id} deleted — ${survey.firstName} ${survey.surname}`,
      metadata: { surveyId: id, status: survey.status, submittedAt: survey.submittedAt.toISOString() },
    }).catch((err) => console.error("[DELETE] logSystemEvent failed:", err));

    await db.delete(techniciansSurvey).where(eq(techniciansSurvey.id, id));

    return NextResponse.json({ deleted: true });
  } catch (err) {
    console.error("[DELETE /api/admin/responses/[id]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
