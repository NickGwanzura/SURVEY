import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";

import { getCurrentAdmin } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { techniciansSurvey } from "@/lib/schema";
import { analyzeSubmission, generateInsightSummary } from "@/lib/admin/ai-analysis";
import { getInsightsData } from "@/lib/admin/insights-data";

const analyzeSchema = z.object({
  surveyId: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json(
      { error: "GROQ_API_KEY is not configured. Contact the system administrator." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = analyzeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const { surveyId } = parsed.data;

  try {
    const rows = await db
      .select()
      .from(techniciansSurvey)
      .where(eq(techniciansSurvey.id, surveyId))
      .limit(1);

    if (rows.length === 0 || !rows[0]) {
      return NextResponse.json({ error: "Survey not found" }, { status: 404 });
    }

    const survey = rows[0];

    // Build a clean data object for the AI
    const cleanData: Record<string, unknown> = {
      firstName: survey.firstName,
      surname: survey.surname,
      gender: survey.gender,
      ageGroup: survey.ageGroup,
      educationLevel: survey.educationLevel,
      yearsExperience: survey.yearsExperience,
      mainWorkFocus: survey.mainWorkFocus,
      province: survey.province,
      city: survey.city,
      phone: survey.phone,
      email: survey.email,
      hasFormalTraining: survey.hasFormalTraining,
      hasCertification: survey.hasCertification,
      certificationsHeld: survey.certificationsHeld,
      hevacrazMemberNumber: survey.hevacrazMemberNumber,
      confidenceTraditionalRefrigerants: survey.confidenceTraditionalRefrigerants,
      confidenceLowGwpRefrigerants: survey.confidenceLowGwpRefrigerants,
      accessToTools: survey.accessToTools,
      accessToSpareParts: survey.accessToSpareParts,
      biggestDailyChallenge: survey.biggestDailyChallenge,
      loadSheddingFrequency: survey.loadSheddingFrequency,
      refrigerantRecoveryEquipmentUse: survey.refrigerantRecoveryEquipmentUse,
      ppeAccess: survey.ppeAccess,
      installsEnergyEfficient: survey.installsEnergyEfficient,
      status: survey.status,
      consentToContact: survey.consentToContact,
    };

    const result = await analyzeSubmission(cleanData);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[POST /api/admin/ai-analyze]", err);
    return NextResponse.json(
      { error: "AI analysis failed. Please try again." },
      { status: 500 },
    );
  }
}

// GET endpoint for insight summary generation
export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json(
      { error: "GROQ_API_KEY is not configured." },
      { status: 503 },
    );
  }

  try {
    const insights = await getInsightsData();

    const dataSummary: Record<string, unknown> = {
      skills: {
        avgConfidenceTraditional: insights.skills.avgConfidenceTraditional,
        avgConfidenceLowGwp: insights.skills.avgConfidenceLowGwp,
        certificationRateByProvince: insights.skills.certificationRateByProvince.map(
          (p) => ({ province: p.label, certifiedPercent: p.certifiedPercent }),
        ),
        educationDistribution: insights.skills.educationDistribution,
      },
      resources: {
        obstacleMeans: insights.resources.obstacleMeans,
        accessMeans: insights.resources.accessMeans,
      },
      challenges: {
        biggestChallenge: insights.challenges.biggestChallenge.map(
          (c) => ({ label: c.label, count: c.count }),
        ),
        recoveryEquipmentUseRate: insights.challenges.recoveryEquipmentUseRate,
        ppeAccessDistribution: insights.challenges.ppeAccessDistribution,
      },
    };

    const result = await generateInsightSummary(
      insights.meta.sampleSize,
      dataSummary,
    );
    return NextResponse.json({
      ...result,
      generatedAt: insights.meta.generatedAt,
      sampleSize: insights.meta.sampleSize,
    });
  } catch (err) {
    console.error("[GET /api/admin/ai-analyze]", err);
    return NextResponse.json(
      { error: "AI insight generation failed. Please try again." },
      { status: 500 },
    );
  }
}
