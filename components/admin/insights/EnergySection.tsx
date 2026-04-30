"use client";

import { SimpleBarChart } from "@/components/admin/charts/BarChart";
import type { InsightsData } from "@/lib/admin/insights-data";

type EnergyProps = InsightsData["energy"];

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

type CorrCell = {
  trained: boolean;
  alwaysInstalls: boolean;
  count: number;
};

function CorrelationGrid({ data }: { data: CorrCell[] }) {
  if (data.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-slate-400">
        No data available
      </p>
    );
  }

  const get = (trained: boolean, always: boolean) =>
    data.find((d) => d.trained === trained && d.alwaysInstalls === always)
      ?.count ?? 0;

  const total = data.reduce((s, d) => s + d.count, 0);
  const pct = (n: number) =>
    total > 0 ? `${((n / total) * 100).toFixed(1)}%` : "—";

  const cells: Array<{
    trained: boolean;
    always: boolean;
    trainedLabel: string;
    alwaysLabel: string;
  }> = [
    { trained: true, always: true, trainedLabel: "Trained", alwaysLabel: "Always installs" },
    { trained: true, always: false, trainedLabel: "Trained", alwaysLabel: "Does not always install" },
    { trained: false, always: true, trainedLabel: "Not trained", alwaysLabel: "Always installs" },
    { trained: false, always: false, trainedLabel: "Not trained", alwaysLabel: "Does not always install" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {cells.map((c) => {
        const n = get(c.trained, c.always);
        const highlight = c.trained && c.always;
        return (
          <div
            key={`${c.trained}-${c.always}`}
            className={`rounded-xl border p-4 ${
              highlight
                ? "border-emerald-200 bg-emerald-50"
                : "border-slate-200 bg-slate-50"
            }`}
          >
            <p className="text-xs font-medium text-slate-500">
              {c.trainedLabel}
            </p>
            <p className="text-xs text-slate-500">{c.alwaysLabel}</p>
            <p
              className={`mt-2 text-2xl font-semibold tabular-nums ${
                highlight ? "text-emerald-700" : "text-slate-700"
              }`}
            >
              {n.toLocaleString()}
            </p>
            <p className="text-xs text-slate-400">{pct(n)} of respondents</p>
          </div>
        );
      })}
    </div>
  );
}

export function EnergySection({
  energyEfficientInstallRate,
  topEnergyEfficientBarriers,
  correlationTrainingVsEfficient,
}: EnergyProps) {
  const installData = energyEfficientInstallRate.map((r) => ({
    label: r.label,
    count: r.count,
  }));

  const barrierData = topEnergyEfficientBarriers.map((r) => ({
    label: r.label,
    count: r.count,
  }));

  return (
    <section className="space-y-6">
      <h2 className="text-lg font-semibold text-slate-900">
        Energy Efficiency
      </h2>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard title="Energy-Efficient Installation Practice">
          <SimpleBarChart
            data={installData}
            horizontal
            color="#16a34a"
            height={240}
          />
        </SectionCard>

        <SectionCard title="Top Barriers to Energy-Efficient Installs">
          <SimpleBarChart
            data={barrierData}
            horizontal
            color="#ca8a04"
            height={280}
          />
        </SectionCard>
      </div>

      <SectionCard title="Training vs. Always Installs Energy-Efficient Equipment">
        <CorrelationGrid data={correlationTrainingVsEfficient} />
      </SectionCard>
    </section>
  );
}
