import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth-server";
import { getMethodologyData } from "@/lib/admin/reports-data";
import { ReportTable } from "@/components/admin/reports/ReportTable";
import { ExportReportButton } from "@/components/admin/reports/ExportReportButton";

export const dynamic = "force-dynamic";

export default async function MethodologyReportPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const data = await getMethodologyData();

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">
            Reports
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">
            Methodology & Readiness Report
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Findings from the survey regarding methodology and readiness.
          </p>
        </div>
        <div>
          <ExportReportButton report="methodology" filename="Methodology_and_Readiness_Report" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ReportTable title="Age Group Distribution" data={data.ageGroup} />
        <ReportTable title="Gender Breakdown" data={data.gender} />
        <ReportTable title="Education Level" data={data.educationLevel} />
        <ReportTable title="Years of Experience" data={data.yearsExperience} />
      </div>
    </div>
  );
}
