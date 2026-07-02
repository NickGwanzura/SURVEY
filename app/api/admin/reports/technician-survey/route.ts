import { NextRequest, NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";

import { getCurrentAdmin } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { technicianSurveyReports, adminUsers } from "@/lib/schema";

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const reports = await db
      .select({
        id: technicianSurveyReports.id,
        reportTitle: technicianSurveyReports.reportTitle,
        surveyName: technicianSurveyReports.surveyName,
        reportingPeriodStart: technicianSurveyReports.reportingPeriodStart,
        reportingPeriodEnd: technicianSurveyReports.reportingPeriodEnd,
        totalResponses: technicianSurveyReports.totalResponses,
        generatedBy: technicianSurveyReports.generatedBy,
        generatedAt: technicianSurveyReports.generatedAt,
        status: technicianSurveyReports.status,
        pdfUrl: technicianSurveyReports.pdfUrl,
        aiSummary: technicianSurveyReports.aiSummary,
        createdAt: technicianSurveyReports.createdAt,
        generatorName: adminUsers.name,
      })
      .from(technicianSurveyReports)
      .innerJoin(adminUsers, eq(technicianSurveyReports.generatedBy, adminUsers.id))
      .orderBy(desc(technicianSurveyReports.generatedAt));

    return NextResponse.json({ reports });
  } catch (err) {
    console.error("[GET /api/admin/reports/technician-survey]", err);
    return NextResponse.json(
      { error: "Failed to fetch reports." },
      { status: 500 },
    );
  }
}
