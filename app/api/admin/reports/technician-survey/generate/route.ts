import { NextRequest, NextResponse } from "next/server";

import { getCurrentAdmin } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { technicianSurveyReports } from "@/lib/schema";
import { getSurveyReportData } from "@/lib/admin/survey-report-data";
import { generateSurveyReportSummary } from "@/lib/admin/survey-report-ai";
import { generateSurveyReportPdf } from "@/lib/admin/survey-report-pdf";

export async function POST(request: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { startDate?: string; endDate?: string; surveyName?: string } = {};
  try {
    body = await request.json();
  } catch {}

  const startDate = body.startDate ? new Date(body.startDate) : undefined;
  const endDate = body.endDate ? new Date(body.endDate) : undefined;
  const surveyName = body.surveyName ?? "RAC Technician Survey";

  if (startDate && endDate && startDate > endDate) {
    return NextResponse.json(
      { error: "startDate must be before endDate" },
      { status: 400 },
    );
  }

  try {
    const rawData = await getSurveyReportData(startDate, endDate);
    const totalResponses = rawData.meta.total;

    if (totalResponses === 0) {
      return NextResponse.json(
        { error: "No survey data found for the selected period." },
        { status: 404 },
      );
    }

    // Build data summary for GROQ
    const dataSummary: Record<string, unknown> = {
      meta: rawData.meta,
      demographics: rawData.demographics,
      location: rawData.location,
      skills: rawData.skills,
      trainingNeeds: rawData.trainingNeeds,
      tools: rawData.tools,
      safety: rawData.safety,
      challenges: rawData.challenges,
      energy: rawData.energy,
    };

    // Compute percentages for PDF
    function computePercent(
      rows: { label: string; count: number }[],
      total: number,
    ): { label: string; count: number; percent: string }[] {
      return rows.map((r) => ({
        ...r,
        percent: total > 0 ? ((r.count / total) * 100).toFixed(1) : "0.0",
      }));
    }

    // Try GROQ analysis
    let aiSummary = null;
    if (process.env.GROQ_API_KEY) {
      try {
        aiSummary = await generateSurveyReportSummary(dataSummary, totalResponses);
      } catch (err) {
        console.warn("[generate] GROQ analysis failed, continuing without AI summary:", err);
      }
    }

    const now = new Date();
    const dateStr = now.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Africa/Harare",
    });

    const reportingPeriodStart = rawData.meta.startDate
      ? rawData.meta.startDate.toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
          timeZone: "Africa/Harare",
        })
      : startDate?.toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }) ?? "N/A";

    const reportingPeriodEnd = rawData.meta.endDate
      ? rawData.meta.endDate.toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
          timeZone: "Africa/Harare",
        })
      : endDate?.toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }) ?? "N/A";

    const pdfInput = {
      reportTitle: "Technician Survey Report",
      surveyName,
      reportingPeriodStart,
      reportingPeriodEnd,
      totalResponses,
      generatedDate: dateStr,
      organizationName: "NOU / HEVACRAZ",
      data: {
        demographics: {
          ageGroup: computePercent(rawData.demographics.ageGroup, totalResponses),
          gender: computePercent(rawData.demographics.gender, totalResponses),
          educationLevel: computePercent(rawData.demographics.educationLevel, totalResponses),
          yearsExperience: computePercent(rawData.demographics.yearsExperience, totalResponses),
        },
        location: {
          province: computePercent(rawData.location.province, totalResponses),
        },
        skills: {
          mainWorkFocus: computePercent(rawData.skills.mainWorkFocus, totalResponses),
          hasFormalTraining: computePercent(rawData.skills.hasFormalTraining, totalResponses),
          hasCertification: computePercent(rawData.skills.hasCertification, totalResponses),
          certificationsHeld: computePercent(rawData.skills.certificationsHeld, totalResponses),
          confidenceTraditional: rawData.skills.confidenceTraditional,
          confidenceLowGwp: rawData.skills.confidenceLowGwp,
        },
        trainingNeeds: {
          missingCertifications: computePercent(rawData.trainingNeeds.missingCertifications, totalResponses),
        },
        tools: {
          accessToTools: rawData.tools.accessToTools,
          accessToSpareParts: rawData.tools.accessToSpareParts,
          accessToLowGwpRefrigerants: rawData.tools.accessToLowGwpRefrigerants,
          recoveryEquipmentUse: computePercent(rawData.tools.recoveryEquipmentUse, totalResponses),
          ppeAccess: computePercent(rawData.tools.ppeAccess, totalResponses),
        },
        safety: {
          ppeAccess: computePercent(rawData.safety.ppeAccess, totalResponses),
          ehsBarriers: computePercent(rawData.safety.ehsBarriers, totalResponses),
          recoveryEquipmentUse: computePercent(rawData.tools.recoveryEquipmentUse, totalResponses),
        },
        challenges: {
          biggestDailyChallenge: computePercent(rawData.challenges.biggestDailyChallenge, totalResponses),
          loadSheddingFrequency: computePercent(rawData.challenges.loadSheddingFrequency, totalResponses),
          obstacleHighImportCosts: rawData.challenges.obstacleHighImportCosts,
          obstacleForexShortages: rawData.challenges.obstacleForexShortages,
          obstacleUnreliableSuppliers: rawData.challenges.obstacleUnreliableSuppliers,
          obstacleCounterfeitProducts: rawData.challenges.obstacleCounterfeitProducts,
          ehsBarriers: computePercent(rawData.challenges.ehsBarriers, totalResponses),
        },
        energy: {
          installsEnergyEfficient: computePercent(rawData.energy.installsEnergyEfficient, totalResponses),
        },
      },
      provinceAnalytics: {
        trainingByProvince: rawData.trainingNeeds.trainingByProvince,
        certificationByProvince: rawData.trainingNeeds.certificationByProvince,
        ppeAccessByProvince: rawData.trainingNeeds.ppeAccessByProvince,
      },
      insights: aiSummary,
    };

    const pdfBuffer = generateSurveyReportPdf(pdfInput);

    const reportTitle = `Technician Survey Report - ${reportingPeriodStart} to ${reportingPeriodEnd}`;

    // Store report record
    const [saved] = await db
      .insert(technicianSurveyReports)
      .values({
        reportTitle,
        surveyName,
        reportingPeriodStart: rawData.meta.startDate ?? startDate ?? now,
        reportingPeriodEnd: rawData.meta.endDate ?? endDate ?? now,
        totalResponses,
        generatedBy: admin.user.id,
        status: "completed",
        aiSummary,
        metadata: {
          startDate: reportingPeriodStart,
          endDate: reportingPeriodEnd,
          generatedDate: dateStr,
        },
      })
      .returning();

    // Return PDF and metadata
    return new Response(
      new Blob([new Uint8Array(pdfBuffer)], { type: "application/pdf" }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="Technician_Survey_Report_${reportingPeriodStart.replace(/\s/g, "_")}_${reportingPeriodEnd.replace(/\s/g, "_")}.pdf"`,
          "X-Report-Id": saved.id,
        },
      },
    );
  } catch (err) {
    console.error("[POST /api/admin/reports/technician-survey/generate]", err);
    return NextResponse.json(
      { error: "Failed to generate report." },
      { status: 500 },
    );
  }
}
