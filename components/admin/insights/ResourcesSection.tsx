"use client";

import { SimpleBarChart } from "@/components/admin/charts/BarChart";
import type { InsightsData } from "@/lib/admin/insights-data";

type ResourcesProps = InsightsData["resources"];

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-slate-700">{title}</h3>
      {children}
    </div>
  );
}

export function ResourcesSection({
  obstacleMeans,
  topObstaclesByProvince,
  accessMeans,
}: ResourcesProps) {
  const obstacleData = [
    { label: "Import Costs", count: obstacleMeans.importCosts },
    { label: "Forex Shortages", count: obstacleMeans.forexShortages },
    {
      label: "Unreliable Suppliers",
      count: obstacleMeans.unreliableSuppliers,
    },
    {
      label: "Counterfeit Products",
      count: obstacleMeans.counterfeit,
    },
  ];

  const accessData = [
    { label: "Tools", count: accessMeans.tools },
    { label: "Spare Parts", count: accessMeans.spareParts },
    { label: "Low-GWP Refrigerants", count: accessMeans.lowGwpRefrigerants },
  ];

  return (
    <section className="space-y-6">
      <h2 className="text-lg font-semibold text-slate-900">
        Tools &amp; Resources
      </h2>

      {/* Obstacle means */}
      <SectionCard title="Mean Obstacle Severity (1–5 Likert scale, national average)">
        <SimpleBarChart data={obstacleData} dataKey="count" color="#dc2626" />
      </SectionCard>

      {/* Top obstacles by province */}
      <SectionCard title="Top 3 Obstacles by Province">
        {topObstaclesByProvince.length === 0 ? (
          <p className="py-4 text-center text-sm text-slate-400">
            No data available
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                  <th className="pb-2 pr-4">Province</th>
                  <th className="pb-2 pr-4">#1 Obstacle</th>
                  <th className="pb-2 pr-4">#2 Obstacle</th>
                  <th className="pb-2">#3 Obstacle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {topObstaclesByProvince.map((r) => (
                  <tr key={r.province} className="hover:bg-slate-50">
                    <td className="py-2.5 pr-4 font-medium text-slate-900">
                      {r.label}
                    </td>
                    {r.top.map((t, i) => (
                      <td key={i} className="py-2.5 pr-4 text-slate-600">
                        {t.name}{" "}
                        <span className="text-xs text-slate-400">
                          ({t.mean.toFixed(2)})
                        </span>
                      </td>
                    ))}
                    {/* Pad if fewer than 3 entries */}
                    {Array.from({ length: Math.max(0, 3 - r.top.length) }).map(
                      (_, i) => (
                        <td key={`pad-${i}`} className="py-2.5 pr-4" />
                      ),
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {/* Access means */}
      <SectionCard title="Mean Access Score (1–5, higher is better)">
        <SimpleBarChart
          data={accessData}
          dataKey="count"
          color="#0891b2"
        />
      </SectionCard>
    </section>
  );
}
