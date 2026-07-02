import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth-server";
import { getFunnelData } from "@/lib/admin/funnel-data";
import { EmptyState } from "@/components/admin/EmptyState";

export const dynamic = "force-dynamic";

export default async function FunnelPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const funnel = await getFunnelData();
  const totalViews = funnel[0]?.views ?? 0;
  const totalSubmissions = funnel[funnel.length - 1]?.completes ?? 0;
  const overallRate = totalViews > 0 ? ((totalSubmissions / totalViews) * 100).toFixed(1) : "0.0";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Survey Completion Funnel</h1>
        <p className="mt-1 text-sm text-slate-500">
          Last 30 days · {totalViews.toLocaleString()} started · {totalSubmissions.toLocaleString()} completed · {overallRate}% overall
        </p>
      </div>

      {funnel.every((f) => f.views === 0) ? (
        <EmptyState
          title="No funnel data yet"
          description="Funnel tracking started with this deployment. Data will appear as technicians interact with the survey."
        />
      ) : (
        <div className="space-y-4">
          {funnel.map((f, i) => {
            const barWidth = totalViews > 0 ? (f.views / totalViews) * 100 : 0;
            const completeWidth = totalViews > 0 ? (f.completes / totalViews) * 100 : 0;
            return (
              <div key={f.step} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{f.stepName}</p>
                      <p className="text-xs text-slate-500">
                        {f.views.toLocaleString()} viewed · {f.completes.toLocaleString()} completed
                        {i > 0 && f.conversionRate > 0 && (
                          <span className="ml-2">· {f.conversionRate}% converted from previous</span>
                        )}
                      </p>
                    </div>
                  </div>
                  {f.dropOffs > 0 && (
                    <span className="text-xs font-medium text-red-600">
                      {f.dropOffs.toLocaleString()} dropped off
                    </span>
                  )}
                </div>
                <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-brand-600 transition-all"
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-50">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all"
                    style={{ width: `${completeWidth}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
