import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { sendSurveyCompletedEmail, notifyAdminsOfNewSubmission } from "@/lib/admin/email";
import { logSystemEvent } from "@/lib/admin/system-events";
import { surveyEvents, techniciansSurvey } from "@/lib/schema";
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
  try {
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

    if (!data.dataConsentAccepted) {
      return NextResponse.json(
        {
          error:
            "You must accept the Data Protection Notice to submit the survey.",
          code: "CONSENT_REQUIRED",
        },
        { status: 422 },
      );
    }

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
        dataConsentAccepted: data.dataConsentAccepted,
        dataConsentAcceptedAt: new Date(),
        dataConsentIpAddress: getClientIp(req),
        dataConsentUserAgent: req.headers.get("user-agent"),
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

    const referenceNumber = inserted.id.slice(0, 8).toUpperCase();

    // Log consent audit event asynchronously
    db.insert(surveyEvents)
      .values({
        phone: data.phone,
        step: 6,
        stepName: "Consent and Submission",
        event: "data_consent_accepted",
        ipAddress: getClientIp(req),
        userAgent: req.headers.get("user-agent") ?? null,
      })
      .then(() => {})
      .catch(() => {});

    // Send confirmation email asynchronously — don't block the response
    if (data.email && data.firstName) {
      sendSurveyCompletedEmail(data.email, data.firstName, referenceNumber).catch(
        (err) => {
          console.error(
            `[survey/submit] Email send error for ${data.email}:`,
            err,
          );
        },
      );
    }

    // Alert all active admins asynchronously — don't block the response
    notifyAdminsOfNewSubmission({
      firstName: data.firstName,
      surname: data.surname,
      province: data.province,
      referenceNumber,
    }).catch((err) => {
      console.error("[survey/submit] Admin notification error:", err);
    });

    logSystemEvent({
      eventType: "survey.submitted",
      description: `New survey submitted by ${data.firstName} ${data.surname} (${referenceNumber})`,
      metadata: { referenceNumber, province: data.province },
      ipAddress: getClientIp(req),
    }).catch(() => {});

    return NextResponse.json({
      id: inserted.id,
      referenceNumber,
    });
  } catch (err) {
    console.error("[survey/submit] Unexpected error:", err);
    return NextResponse.json(
      { error: "Submission failed. Please try again later or contact support if the issue persists." },
      { status: 500 },
    );
  }
}
