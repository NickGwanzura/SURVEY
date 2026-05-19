import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth-server";
import { getBarrierAnalysisData } from "@/lib/admin/reports-data";
import { ReportTable } from "@/components/admin/reports/ReportTable";
import { ExportReportButton } from "@/components/admin/reports/ExportReportButton";

export const dynamic = "force-dynamic";

export default async function BarrierAnalysisPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const data = await getBarrierAnalysisData();

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">
            Reports
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">
            Barrier Analysis
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Analysis of barriers to entry and operational challenges.
          </p>
        </div>
        <div>
          <ExportReportButton report="barrier-analysis" filename="Barrier_Analysis" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ReportTable title="Biggest Daily Challenge" data={data.dailyChallenges} />
        <ReportTable title="Load Shedding Frequency" data={data.loadShedding} />
        <ReportTable title="Obstacle: High Import Costs" data={data.importCosts} />
        <ReportTable title="Obstacle: Forex Shortages" data={data.forex} />
      </div>
    </div>
  );
}
