import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth-server";
import { getProvinceComparison } from "@/lib/admin/province-comparison-data";
import { getProvinceChallengesData } from "@/lib/admin/province-challenges-data";
import { Badge } from "@/components/admin/Badge";

export const dynamic = "force-dynamic";

export default async function ProvinceComparisonPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const [rows, challengeRows] = await Promise.all([
    getProvinceComparison(),
    getProvinceChallengesData(),
  ]);

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

      {/* Challenges by Province */}
      {challengeRows.length > 0 && (
        <section className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Challenges by Province
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              Work challenge indicators broken down per province
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {challengeRows.map((prov) => (
              <details
                key={prov.province}
                className="group rounded-xl border border-slate-200 bg-white shadow-sm"
              >
                <summary className="flex cursor-pointer items-center justify-between gap-4 px-4 py-3 text-sm font-medium text-slate-900 hover:bg-slate-50 [&::-webkit-details-marker]:hidden">
                  <div className="flex items-center gap-3">
                    <svg
                      className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-open:rotate-90"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                      aria-hidden
                    >
                      <path d="M6 4l4 4-4 4" />
                    </svg>
                    <span className="font-semibold">{prov.label}</span>
                    <Badge tone="neutral">{prov.totalSubmissions} submissions</Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span>
                      PPE:{" "}
                      <strong
                        className={
                          prov.ppeFullAccessPercent >= 50
                            ? "text-emerald-600"
                            : "text-amber-600"
                        }
                      >
                        {prov.ppeFullAccessPercent}%
                      </strong>
                    </span>
                    <span>
                      Recovery:{" "}
                      <strong
                        className={
                          prov.recoveryAlwaysPercent >= 50
                            ? "text-emerald-600"
                            : "text-amber-600"
                        }
                      >
                        {prov.recoveryAlwaysPercent}%
                      </strong>
                    </span>
                  </div>
                </summary>

                <div className="border-t border-slate-100 px-4 py-4">
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Top challenges */}
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Most Common Daily Challenges
                      </p>
                      {prov.topChallenges.length === 0 ? (
                        <p className="text-sm text-slate-400">No data</p>
                      ) : (
                        <div className="flex flex-col gap-1.5">
                          {prov.topChallenges.map((c) => (
                            <div
                              key={c.value}
                              className="flex items-center justify-between gap-4 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2"
                            >
                              <span className="text-sm text-slate-700">
                                {c.label}
                              </span>
                              <span className="shrink-0 text-xs tabular-nums text-slate-500">
                                {c.count}{" "}
                                <span className="text-slate-400">
                                  ({c.percent}%)
                                </span>
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Load shedding */}
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Load Shedding Frequency
                      </p>
                      {prov.loadSheddingDistribution.length === 0 ? (
                        <p className="text-sm text-slate-400">No data</p>
                      ) : (
                        <div className="flex flex-col gap-1.5">
                          {prov.loadSheddingDistribution.map((ls) => (
                            <div
                              key={ls.value}
                              className="flex items-center justify-between gap-4 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2"
                            >
                              <span className="text-sm text-slate-700">
                                {ls.label}
                              </span>
                              <span className="shrink-0 text-xs tabular-nums text-slate-500">
                                {ls.count}{" "}
                                <span className="text-slate-400">
                                  ({ls.percent}%)
                                </span>
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* PPE & Recovery summary */}
                    <div className="lg:col-span-2">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                          <p className="text-xs font-medium text-slate-500">
                            PPE — Full Access
                          </p>
                          <p
                            className={`mt-1 text-lg font-semibold ${
                              prov.ppeFullAccessPercent >= 50
                                ? "text-emerald-700"
                                : "text-amber-700"
                            }`}
                          >
                            {prov.ppeFullAccessPercent}%
                          </p>
                          <p className="text-xs text-slate-400">
                            of technicians have full PPE provided
                          </p>
                        </div>
                        <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                          <p className="text-xs font-medium text-slate-500">
                            Recovery Equipment — Always Use
                          </p>
                          <p
                            className={`mt-1 text-lg font-semibold ${
                              prov.recoveryAlwaysPercent >= 50
                                ? "text-emerald-700"
                                : "text-amber-700"
                            }`}
                          >
                            {prov.recoveryAlwaysPercent}%
                          </p>
                          <p className="text-xs text-slate-400">
                            of technicians always use recovery equipment
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Top EHS barriers */}
                    {prov.topEhsBarriers.length > 0 && (
                      <div className="lg:col-span-2">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Top EHS Compliance Barriers
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {prov.topEhsBarriers.map((b) => (
                            <Badge key={b.value} tone="neutral">
                              {b.label}{" "}
                              <span className="ml-1 text-slate-400">
                                ({b.count})
                              </span>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </details>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
