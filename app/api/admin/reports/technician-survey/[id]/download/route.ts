import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { getCurrentAdmin } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { technicianSurveyReports } from "@/lib/schema";
import { getSurveyReportData } from "@/lib/admin/survey-report-data";
import { generateSurveyReportSummary } from "@/lib/admin/survey-report-ai";
import { generateSurveyReportPdf } from "@/lib/admin/survey-report-pdf";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const [report] = await db
      .select()
      .from(technicianSurveyReports)
      .where(eq(technicianSurveyReports.id, id))
      .limit(1);

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Regenerate PDF from stored metadata
    const rawData = await getSurveyReportData(
      report.reportingPeriodStart,
      report.reportingPeriodEnd,
    );

    const totalResponses = report.totalResponses;

    function computePercent(
      rows: { label: string; count: number }[],
      total: number,
    ): { label: string; count: number; percent: string }[] {
      return rows.map((r) => ({
        ...r,
        percent: total > 0 ? ((r.count / total) * 100).toFixed(1) : "0.0",
      }));
    }

    const dateStr = report.generatedAt.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Africa/Harare",
    });

    const reportingPeriodStart = report.reportingPeriodStart.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "Africa/Harare",
    });

    const reportingPeriodEnd = report.reportingPeriodEnd.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "Africa/Harare",
    });

    const pdfInput = {
      reportTitle: report.reportTitle,
      surveyName: report.surveyName,
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
      insights: report.aiSummary,
    };

    const pdfBuffer = generateSurveyReportPdf(pdfInput);

    return new Response(
      new Blob([new Uint8Array(pdfBuffer)], { type: "application/pdf" }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="Technician_Survey_Report_${reportingPeriodStart.replace(/\s/g, "_")}_${reportingPeriodEnd.replace(/\s/g, "_")}.pdf"`,
        },
      },
    );
  } catch (err) {
    console.error("[GET /api/admin/reports/technician-survey/:id/download]", err);
    return NextResponse.json(
      { error: "Failed to download report." },
      { status: 500 },
    );
  }
}
