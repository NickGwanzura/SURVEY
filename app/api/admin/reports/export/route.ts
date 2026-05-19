import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth-server";
import { generateReportPdf } from "@/lib/admin/report-pdf";
import { 
  getMethodologyData, 
  getSkillsGapData, 
  getToolsNeedsData, 
  getBarrierAnalysisData, 
  getGeoMappingData, 
  getAchievementGapsData,
  convertToCsv
} from "@/lib/admin/reports-data";

const DATA_FETCHERS: Record<string, () => Promise<Record<string, { label: any; count: number }[]>>> = {
  methodology: getMethodologyData,
  "skills-gap": getSkillsGapData,
  "tools-needs": getToolsNeedsData,
  "barrier-analysis": getBarrierAnalysisData,
  "geo-mapping": getGeoMappingData,
  "achievement-gaps": getAchievementGapsData,
};

const FILE_NAMES: Record<string, string> = {
  methodology: "Methodology_and_Readiness_Report",
  "skills-gap": "Skills_Gap_Analysis",
  "tools-needs": "Tools_and_Equipment_Needs",
  "barrier-analysis": "Barrier_Analysis",
  "geo-mapping": "Geo_Mapping",
  "achievement-gaps": "Achievement_and_Residual_Gaps",
};

export async function GET(request: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const reportType = searchParams.get("report");
  const format = searchParams.get("format") ?? "csv";

  if (!reportType || !DATA_FETCHERS[reportType]) {
    return NextResponse.json({ error: "Missing or invalid report parameter" }, { status: 400 });
  }

  if (format !== "csv" && format !== "pdf") {
    return NextResponse.json({ error: "Invalid format. Use 'csv' or 'pdf'." }, { status: 400 });
  }

  try {
    const data = await DATA_FETCHERS[reportType]();
    const baseName = FILE_NAMES[reportType] ?? "Report";

    if (format === "pdf") {
      const pdfBuffer = generateReportPdf(reportType, data);

      return new Response(new Blob([new Uint8Array(pdfBuffer)], { type: "application/pdf" }), {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${baseName}.pdf"`,
        },
      });
    }

    const csvStr = convertToCsv(data);

    return new Response(csvStr, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${baseName}.csv"`,
      },
    });

  } catch (error) {
    console.error(`Failed to generate export for ${reportType}:`, error);
    return NextResponse.json({ error: "Failed to generate export" }, { status: 500 });
  }
}
