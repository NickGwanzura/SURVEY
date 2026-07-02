import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth-server";
import { getTimeComparison } from "@/lib/admin/time-comparison-data";
import type { PeriodStats } from "@/lib/admin/time-comparison-data";

export const dynamic = "force-dynamic";

function Diff({ current, previous }: { current: number; previous: number }) {
  if (previous === 0)
    return current > 0 ? (
      <span className="text-emerald-600">+{current}</span>
    ) : (
      <span className="text-slate-400">—</span>
    );
  const diff = ((current - previous) / previous) * 100;
  const color =
    diff > 0 ? "text-emerald-600" : diff < 0 ? "text-red-600" : "text-slate-500";
  const sign = diff > 0 ? "+" : "";
  return (
    <span className={color}>
      {sign}
      {diff.toFixed(1)}%
    </span>
  );
}

function PeriodCard({
  current,
  previous,
}: {
  current: PeriodStats;
  previous: PeriodStats;
}) {
  const rows = [
    { label: "Total submissions", current: current.total, previous: previous.total },
    { label: "Verified", current: current.verified, previous: previous.verified },
    { label: "Pending", current: current.pending, previous: previous.pending },
    { label: "Flagged", current: current.flagged, previous: previous.flagged },
    { label: "Duplicates", current: current.duplicate, previous: previous.duplicate },
    {
      label: "With certification",
      current: current.withCertification,
      previous: previous.withCertification,
    },
    { label: "With GPS", current: current.withGps, previous: previous.withGps },
    {
      label: "Avg. trad. confidence",
      current: current.avgConfidenceTraditional,
      previous: previous.avgConfidenceTraditional,
      isDecimal: true,
    },
    {
      label: "Avg. low-GWP confidence",
      current: current.avgConfidenceLowGwp,
      previous: previous.avgConfidenceLowGwp,
      isDecimal: true,
    },
  ];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-900">{current.label}</h2>
      <p className="text-xs text-slate-500">vs {previous.label}</p>
      <div className="mt-4 space-y-3">
        {rows.map((r) => (
          <div
            key={r.label}
            className="flex items-center justify-between text-sm"
          >
            <span className="text-slate-600">{r.label}</span>
            <div className="flex items-center gap-3">
              <span className="tabular-nums font-medium text-slate-900">
                {r.isDecimal
                  ? r.current.toFixed(2)
                  : r.current.toLocaleString()}
              </span>
              <span className="w-16 text-right text-xs">
                <Diff current={r.current} previous={r.previous} />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function ComparisonPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const data = await getTimeComparison();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Time-Period Comparison
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Compare metrics across months, quarters, and years
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <PeriodCard
          current={data.currentMonth}
          previous={data.previousMonth}
        />
        <PeriodCard
          current={data.currentQuarter}
          previous={data.previousQuarter}
        />
        <PeriodCard current={data.currentYear} previous={data.previousYear} />
      </div>
    </div>
  );
}
