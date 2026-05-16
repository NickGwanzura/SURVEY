import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth-server";
import { getProvinceComparison } from "@/lib/admin/province-comparison-data";
import { Badge } from "@/components/admin/Badge";

export const dynamic = "force-dynamic";

export default async function ProvinceComparisonPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const rows = await getProvinceComparison();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Province Comparison</h1>
        <p className="mt-1 text-sm text-slate-500">
          Side-by-side metrics across all provinces
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
              <th className="sticky left-0 bg-slate-50 px-3 py-3 sm:px-4">Province</th>
              <th className="px-3 py-3 text-right sm:px-4">Submissions</th>
              <th className="px-3 py-3 text-right sm:px-4">Verified</th>
              <th className="px-3 py-3 text-right sm:px-4">Cert. Rate</th>
              <th className="px-3 py-3 text-right sm:px-4">Trad. Conf.</th>
              <th className="px-3 py-3 text-right sm:px-4">Low-GWP Conf.</th>
              <th className="px-3 py-3 text-right sm:px-4">Gap</th>
              <th className="px-3 py-3 text-right sm:px-4">Tool Access</th>
              <th className="px-3 py-3 text-right sm:px-4">Parts Access</th>
              <th className="px-3 py-3 text-right sm:px-4">Refrig. Access</th>
              <th className="px-3 py-3 text-right sm:px-4">With GPS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((r) => (
              <tr key={r.province} className="hover:bg-slate-50">
                <td className="sticky left-0 bg-white px-3 py-3 font-medium text-slate-900 sm:px-4">
                  {r.label}
                </td>
                <td className="px-3 py-3 text-right tabular-nums text-slate-700 sm:px-4">
                  {r.totalSubmissions.toLocaleString()}
                </td>
                <td className="px-3 py-3 text-right tabular-nums sm:px-4">
                  {r.verifiedCount > 0 ? (
                    <Badge tone="success">{r.verifiedCount}</Badge>
                  ) : (
                    <span className="text-slate-400">0</span>
                  )}
                </td>
                <td className="px-3 py-3 text-right tabular-nums text-slate-700 sm:px-4">
                  {r.certificationRate.toFixed(1)}%
                </td>
                <td className="px-3 py-3 text-right tabular-nums text-slate-700 sm:px-4">
                  {r.avgConfidenceTraditional.toFixed(2)}
                </td>
                <td className="px-3 py-3 text-right tabular-nums text-slate-700 sm:px-4">
                  {r.avgConfidenceLowGwp.toFixed(2)}
                </td>
                <td className="px-3 py-3 text-right tabular-nums sm:px-4">
                  {r.confidenceGap > 0.5 ? (
                    <span className="font-medium text-amber-600">{r.confidenceGap.toFixed(2)}</span>
                  ) : (
                    <span className="text-slate-700">{r.confidenceGap.toFixed(2)}</span>
                  )}
                </td>
                <td className="px-3 py-3 text-right tabular-nums text-slate-700 sm:px-4">
                  {r.avgAccessTools.toFixed(2)}
                </td>
                <td className="px-3 py-3 text-right tabular-nums text-slate-700 sm:px-4">
                  {r.avgAccessSpareParts.toFixed(2)}
                </td>
                <td className="px-3 py-3 text-right tabular-nums text-slate-700 sm:px-4">
                  {r.avgAccessRefrigerants.toFixed(2)}
                </td>
                <td className="px-3 py-3 text-right tabular-nums text-slate-700 sm:px-4">
                  {r.hasGpsCount.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
