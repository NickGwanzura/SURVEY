import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { computeDiff, logSurveyEdit } from "@/lib/audit";
import { db } from "@/lib/db";
import { techniciansSurvey } from "@/lib/schema";
import { surveyUpdateSchema } from "@/lib/validation";

const idSchema = z.string().uuid();

const updateBodySchema = z.intersection(
  surveyUpdateSchema,
  z.object({
    verificationPhone: z.string().trim().min(1),
  }),
);

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: RouteContext) {
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

  const parsed = updateBodySchema.safeParse(body);
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

    // Verify ownership via original phone
    if (before.phone !== data.verificationPhone) {
      return NextResponse.json(
        { error: "Unauthorized. Phone number does not match." },
        { status: 403 },
      );
    }

    // Prevent duplicate phone if changed to another existing survey's phone
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

    await logSurveyEdit(id, { type: "applicant", display: data.verificationPhone }, changes);

    return NextResponse.json(updated);
  } catch (err) {
    console.error("[PUT /api/survey/[id]]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
