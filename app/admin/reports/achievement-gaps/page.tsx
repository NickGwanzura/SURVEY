import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth-server";
import { getAchievementGapsData } from "@/lib/admin/reports-data";
import { ReportTable } from "@/components/admin/reports/ReportTable";
import { ExportReportButton } from "@/components/admin/reports/ExportReportButton";

export const dynamic = "force-dynamic";

export default async function AchievementGapsPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const data = await getAchievementGapsData();

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">
            Reports
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">
            Confirmation of Achievement and Residual Gaps
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Evaluation of achievements against goals and identification of remaining gaps.
          </p>
        </div>
        <div>
          <ExportReportButton report="achievement-gaps" filename="Achievement_and_Residual_Gaps" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ReportTable title="Energy Efficient Installations" data={data.energyInstalls} />
        <ReportTable title="Overall Survey Completion Status" data={data.statuses} />
      </div>
    </div>
  );
}
