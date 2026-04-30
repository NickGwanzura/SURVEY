import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { techniciansSurvey } from "@/lib/schema";
import { surveySubmissionSchema } from "@/lib/validation";

export const runtime = "nodejs";

function getClientIp(req: NextRequest): string | null {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return req.headers.get("x-real-ip");
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = surveySubmissionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed.",
        issues: parsed.error.flatten(),
      },
      { status: 422 },
    );
  }

  const data = parsed.data;

  const existing = await db
    .select({ id: techniciansSurvey.id })
    .from(techniciansSurvey)
    .where(eq(techniciansSurvey.phone, data.phone))
    .limit(1);

  if (existing.length > 0) {
    return NextResponse.json(
      {
        error:
          "This phone number has already been submitted. If you believe this is an error, please contact support.",
        code: "DUPLICATE_PHONE",
      },
      { status: 409 },
    );
  }

  const [inserted] = await db
    .insert(techniciansSurvey)
    .values({
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
      ipAddress: getClientIp(req),
      userAgent: req.headers.get("user-agent"),
      submissionSource: data.submissionSource,
    })
    .returning({ id: techniciansSurvey.id });

  if (!inserted) {
    return NextResponse.json(
      { error: "Failed to record submission." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    id: inserted.id,
    referenceNumber: inserted.id.slice(0, 8).toUpperCase(),
  });
}
