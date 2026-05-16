import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth-server";
import { getCoverageData } from "@/lib/admin/coverage-data";
import { Badge } from "@/components/admin/Badge";

export const dynamic = "force-dynamic";

export default async function CoveragePage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const data = await getCoverageData();
  const zeroCount = data.provinceCoverage.filter((p) => !p.hasSubmissions).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Geographic Coverage</h1>
        <p className="mt-1 text-sm text-slate-500">
          {data.coveredSuburbs} suburb{data.coveredSuburbs !== 1 ? "s" : ""} covered · {zeroCount} province{zeroCount !== 1 ? "s" : ""} with zero submissions
        </p>
      </div>

      {/* Province cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.provinceCoverage.map((p) => (
          <div
            key={p.province}
            className={`rounded-xl border p-4 shadow-sm ${
              p.hasSubmissions
                ? "border-slate-200 bg-white"
                : "border-red-200 bg-red-50"
            }`}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-900">{p.label}</p>
              {p.hasSubmissions ? (
                <Badge tone="success">{p.count}</Badge>
              ) : (
                <Badge tone="danger">No data</Badge>
              )}
            </div>
            {p.hasSubmissions && (
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-brand-600"
                  style={{
                    width: `${Math.min(100, (p.count / Math.max(...data.provinceCoverage.map((x) => x.count))) * 100)}%`,
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Top suburbs */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-slate-900">Top Suburbs by Submission Count</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                <th className="pb-2 pr-4">Suburb</th>
                <th className="pb-2 pr-4">City</th>
                <th className="pb-2 pr-4">Province</th>
                <th className="pb-2 text-right">Submissions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.topSuburbs.map((s) => (
                <tr key={`${s.suburb}-${s.city}-${s.province}`} className="hover:bg-slate-50">
                  <td className="py-2.5 pr-4 font-medium text-slate-900">{s.suburb}</td>
                  <td className="py-2.5 pr-4 text-slate-600">{s.city}</td>
                  <td className="py-2.5 pr-4 text-slate-600">{s.province}</td>
                  <td className="py-2.5 text-right tabular-nums text-slate-700">{s.count.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
