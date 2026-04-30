"use client";

import { SimpleBarChart } from "@/components/admin/charts/BarChart";
import { SubmissionsLineChart } from "@/components/admin/charts/LineChart";
import { SimplePieChart } from "@/components/admin/charts/PieChart";

type ChartData = {
  byProvince: Array<{ province: string; label: string; count: number }>;
  byWorkFocus: Array<{ value: string; label: string; count: number }>;
  byCertification: Array<{ value: string; label: string; count: number }>;
  submissionsByDay: Array<{ date: string; count: number }>;
};

function ChartCard({
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

export function ChartsSection({
  byProvince,
  byWorkFocus,
  byCertification,
  submissionsByDay,
}: ChartData) {
  const provinceData = byProvince.map((r) => ({
    ...r,
    label: r.label,
    count: r.count,
  }));

  const workFocusData = byWorkFocus.map((r) => ({
    ...r,
    label: r.label,
    count: r.count,
  }));

  const certData = byCertification.map((r) => ({
    label: r.label,
    count: r.count,
    percent:
      byCertification.reduce((s, x) => s + x.count, 0) > 0
        ? Number(
            (
              (r.count / byCertification.reduce((s, x) => s + x.count, 0)) *
              100
            ).toFixed(1),
          )
        : 0,
  }));

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <ChartCard title="Registrations by Province">
        <SimpleBarChart data={provinceData} horizontal />
      </ChartCard>

      <ChartCard title="Registrations by Work Focus">
        <SimpleBarChart
          data={workFocusData}
          horizontal
          color="#7c3aed"
        />
      </ChartCard>

      <ChartCard title="Certification Status">
        <SimplePieChart data={certData} />
      </ChartCard>

      <ChartCard title="Submissions — Last 30 Days">
        <SubmissionsLineChart data={submissionsByDay} />
      </ChartCard>
    </div>
  );
}
