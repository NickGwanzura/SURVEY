import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth-server";
import { 
  getMethodologyData, 
  getSkillsGapData, 
  getToolsNeedsData, 
  getBarrierAnalysisData, 
  getGeoMappingData, 
  getAchievementGapsData,
  convertToCsv
} from "@/lib/admin/reports-data";

export async function GET(request: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const reportType = searchParams.get("report");

  if (!reportType) {
    return NextResponse.json({ error: "Missing report parameter" }, { status: 400 });
  }

  let data: Record<string, { label: any; count: number }[]> = {};
  let filename = "report.csv";

  try {
    switch (reportType) {
      case "methodology":
        data = await getMethodologyData();
        filename = "Methodology_and_Readiness_Report.csv";
        break;
      case "skills-gap":
        data = await getSkillsGapData();
        filename = "Skills_Gap_Analysis.csv";
        break;
      case "tools-needs":
        data = await getToolsNeedsData();
        filename = "Tools_and_Equipment_Needs.csv";
        break;
      case "barrier-analysis":
        data = await getBarrierAnalysisData();
        filename = "Barrier_Analysis.csv";
        break;
      case "geo-mapping":
        data = await getGeoMappingData();
        filename = "Geo_Mapping.csv";
        break;
      case "achievement-gaps":
        data = await getAchievementGapsData();
        filename = "Achievement_and_Residual_Gaps.csv";
        break;
      default:
        return NextResponse.json({ error: "Invalid report type" }, { status: 400 });
    }

    const csvStr = convertToCsv(data);

    return new Response(csvStr, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });

  } catch (error) {
    console.error(`Failed to generate export for ${reportType}:`, error);
    return NextResponse.json({ error: "Failed to generate export" }, { status: 500 });
  }
}
