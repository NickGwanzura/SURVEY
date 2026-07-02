import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { getCurrentAdmin } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { technicianSurveyReports, adminUsers } from "@/lib/schema";

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
      .select({
        id: technicianSurveyReports.id,
        reportTitle: technicianSurveyReports.reportTitle,
        reportType: technicianSurveyReports.reportType,
        surveyName: technicianSurveyReports.surveyName,
        reportingPeriodStart: technicianSurveyReports.reportingPeriodStart,
        reportingPeriodEnd: technicianSurveyReports.reportingPeriodEnd,
        totalResponses: technicianSurveyReports.totalResponses,
        generatedBy: technicianSurveyReports.generatedBy,
        generatedAt: technicianSurveyReports.generatedAt,
        status: technicianSurveyReports.status,
        pdfUrl: technicianSurveyReports.pdfUrl,
        aiSummary: technicianSurveyReports.aiSummary,
        metadata: technicianSurveyReports.metadata,
        createdAt: technicianSurveyReports.createdAt,
        generatorName: adminUsers.name,
      })
      .from(technicianSurveyReports)
      .innerJoin(adminUsers, eq(technicianSurveyReports.generatedBy, adminUsers.id))
      .where(eq(technicianSurveyReports.id, id))
      .limit(1);

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    return NextResponse.json({ report });
  } catch (err) {
    console.error("[GET /api/admin/reports/technician-survey/:id]", err);
    return NextResponse.json(
      { error: "Failed to fetch report." },
      { status: 500 },
    );
  }
}
