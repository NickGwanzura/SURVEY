import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { notifyAdminsOfNewSubmission } from "@/lib/admin/email";
import { logSystemEvent } from "@/lib/admin/system-events";
import { retailersSurvey, surveyEvents } from "@/lib/schema";
import { retailerSurveySubmissionSchema } from "@/lib/retailer-validation";

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

    const parsed = retailerSurveySubmissionSchema.safeParse(body);
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
      .select({ id: retailersSurvey.id })
      .from(retailersSurvey)
      .where(eq(retailersSurvey.phone, data.phone))
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
      .insert(retailersSurvey)
      .values({
        businessName: data.businessName,
        contactPersonName: data.contactPersonName,
        businessType: data.businessType,
        province: data.province,
        city: data.city,
        suburb: data.suburb,
        phone: data.phone,
        email: data.email,
        businessSize: data.businessSize,
        yearsInOperation: data.yearsInOperation,
        businessRegistrationNumber: data.businessRegistrationNumber,
        productCategories: data.productCategories,
        productCategoriesOther: data.productCategoriesOther,
        sourcingChannel: data.sourcingChannel,
        localSourcingPercent: data.localSourcingPercent,
        brandsCarried: data.brandsCarried,
        customerTypes: data.customerTypes,
        refrigerantAwareness: data.refrigerantAwareness,
        stocksLowGwp: data.stocksLowGwp,
        supplyChallenges: data.supplyChallenges,
        supplyChallengesOther: data.supplyChallengesOther,
        biggestDailyChallenge: data.biggestDailyChallenge,
        loadSheddingImpact: data.loadSheddingImpact,
        regulatoryBarriers: data.regulatoryBarriers,
        competitionLevel: data.competitionLevel,
        pricePressure: data.pricePressure,
        interestedInTraining: data.interestedInTraining,
        trainingTopics: data.trainingTopics,
        consentToContact: data.consentToContact,
        preferredLanguage: data.preferredLanguage,
        dataConsentAccepted: data.dataConsentAccepted,
        dataConsentAcceptedAt: new Date(),
        dataConsentIpAddress: getClientIp(req),
        dataConsentUserAgent: req.headers.get("user-agent"),
        ipAddress: getClientIp(req),
        userAgent: req.headers.get("user-agent"),
        submissionSource: data.submissionSource,
      })
      .returning({ id: retailersSurvey.id });

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
        step: 4,
        stepName: "Consent and Submission",
        event: "retailer_survey_submitted",
        ipAddress: getClientIp(req),
        userAgent: req.headers.get("user-agent") ?? null,
      })
      .then(() => {})
      .catch(() => {});

    // Alert all active admins asynchronously
    notifyAdminsOfNewSubmission({
      firstName: data.contactPersonName,
      surname: data.businessName,
      province: data.province,
      referenceNumber,
    }).catch((err) => {
      console.error("[retailer-survey/submit] Admin notification error:", err);
    });

    logSystemEvent({
      eventType: "survey.submitted",
      description: `New retailer survey submitted by ${data.contactPersonName} (${data.businessName}) — ${referenceNumber}`,
      metadata: {
        referenceNumber,
        province: data.province,
        businessType: data.businessType,
        surveyType: "retailer",
      },
      ipAddress: getClientIp(req),
    }).catch(() => {});

    return NextResponse.json({
      id: inserted.id,
      referenceNumber,
    });
  } catch (err) {
    console.error("[retailer-survey/submit] Unexpected error:", err);
    return NextResponse.json(
      { error: "Submission failed. Please try again later or contact support if the issue persists." },
      { status: 500 },
    );
  }
}
