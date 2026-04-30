"use client";

import { SimpleBarChart } from "@/components/admin/charts/BarChart";
import { SimplePieChart } from "@/components/admin/charts/PieChart";
import type { InsightsData } from "@/lib/admin/insights-data";

type ChallengesProps = InsightsData["challenges"];

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

export function ChallengesSection({
  biggestChallenge,
  loadSheddingDistribution,
  recoveryEquipmentUseRate,
  ppeAccessDistribution,
  topEhsBarriers,
}: ChallengesProps) {
  const challengeData = biggestChallenge.map((r) => ({
    label: r.label,
    count: r.count,
  }));

  const ehsData = topEhsBarriers.map((r) => ({
    label: r.label,
    count: r.count,
  }));

  return (
    <section className="space-y-6">
      <h2 className="text-lg font-semibold text-slate-900">
        Work Challenges
      </h2>

      {/* Biggest daily challenge */}
      <SectionCard title="Most Common Daily Challenge">
        <SimpleBarChart
          data={challengeData}
          horizontal
          color="#7c3aed"
          height={400}
        />
      </SectionCard>

      {/* Pie charts 2x2 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard title="Load Shedding Frequency">
          <SimplePieChart data={loadSheddingDistribution} />
        </SectionCard>

        <SectionCard title="Refrigerant Recovery Equipment Use">
          <SimplePieChart data={recoveryEquipmentUseRate} />
        </SectionCard>

        <SectionCard title="PPE Access">
          <SimplePieChart data={ppeAccessDistribution} />
        </SectionCard>

        <SectionCard title="Top EHS Compliance Barriers">
          <SimpleBarChart
            data={ehsData}
            horizontal
            color="#db2777"
            height={240}
          />
        </SectionCard>
      </div>
    </section>
  );
}
