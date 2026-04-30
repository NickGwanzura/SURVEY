"use client";

import { SimpleBarChart } from "@/components/admin/charts/BarChart";
import { SimplePieChart } from "@/components/admin/charts/PieChart";
import type { InsightsData } from "@/lib/admin/insights-data";

type SkillsProps = InsightsData["skills"];

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

export function SkillsSection({
  avgConfidenceTraditional,
  avgConfidenceLowGwp,
  confidenceGapByProvince,
  certificationRateByProvince,
  educationDistribution,
}: SkillsProps) {
  const gap = Number((avgConfidenceTraditional - avgConfidenceLowGwp).toFixed(2));

  const confGapData = confidenceGapByProvince.map((r) => ({
    label: r.label,
    count: r.gap,
  }));

  const certRateData = certificationRateByProvince.map((r) => ({
    label: r.label,
    count: r.certifiedPercent,
  }));

  return (
    <section className="space-y-6">
      <h2 className="text-lg font-semibold text-slate-900">
        Skills &amp; Training
      </h2>

      {/* Big stat tiles */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm text-center">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Avg. Confidence — Traditional Refrigerants
          </p>
          <p className="mt-2 text-4xl font-semibold tabular-nums text-slate-900">
            {avgConfidenceTraditional.toFixed(1)}
            <span className="text-lg text-slate-400">/5</span>
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm text-center">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Avg. Confidence — Low-GWP Refrigerants
          </p>
          <p className="mt-2 text-4xl font-semibold tabular-nums text-slate-900">
            {avgConfidenceLowGwp.toFixed(1)}
            <span className="text-lg text-slate-400">/5</span>
          </p>
        </div>
        <div
          className={`rounded-2xl border p-5 shadow-sm text-center ${
            gap > 0.5
              ? "border-amber-200 bg-amber-50"
              : "border-emerald-200 bg-emerald-50"
          }`}
        >
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Training Gap (Traditional − Low-GWP)
          </p>
          <p
            className={`mt-2 text-4xl font-semibold tabular-nums ${
              gap > 0.5 ? "text-amber-700" : "text-emerald-700"
            }`}
          >
            {gap > 0 ? "+" : ""}
            {gap.toFixed(2)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {gap > 0.5
              ? "Low-GWP upskilling needed"
              : "Confidence levels balanced"}
          </p>
        </div>
      </div>

      {/* Confidence gap by province */}
      <SectionCard title="Confidence Gap by Province (Traditional − Low-GWP, descending)">
        <SimpleBarChart
          data={confGapData}
          dataKey="count"
          horizontal
          color="#ea580c"
          height={360}
        />
      </SectionCard>

      {/* Certification rate by province */}
      <SectionCard title="Certification Rate by Province (%)">
        <SimpleBarChart
          data={certRateData}
          dataKey="count"
          horizontal
          color="#16a34a"
          height={360}
        />
      </SectionCard>

      {/* Education distribution */}
      <SectionCard title="Education Distribution">
        <SimplePieChart data={educationDistribution} />
      </SectionCard>
    </section>
  );
}
