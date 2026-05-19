"use client";

import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type PieChartProps = {
  data: Array<{ label: string; count: number }>;
  height?: number;
  /** Optional description for empty state */
  emptyMessage?: string;
};

// Brand-aligned color palette (OKLCH-inspired, harmonious sequence)
const COLORS = [
  "#0d4f3c", // brand-600 (dark green)
  "#2d7a5a", // brand-500
  "#e8a838", // amber-500
  "#4a8bb7", // steel blue
  "#9b6b9e", // muted purple
  "#c4544a", // brick red
  "#5a8f6a", // sage green
  "#b88a4a", // ochre
  "#6b7b8b", // slate blue
  "#c4786a", // terracotta
];

export function SimplePieChart({ data, height = 280, emptyMessage = "No data available" }: PieChartProps) {
  if (!data || data.length === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 py-12 text-sm text-slate-400"
        role="img"
        aria-label={emptyMessage}
      >
        {emptyMessage}
      </div>
    );
  }

  const total = data.reduce((s, d) => s + d.count, 0);

  // Create legend items with percentage
  const legendData = data.map((d) => ({
    value: d.label,
    count: d.count,
    percent: total > 0 ? (d.count / total) * 100 : 0,
  }));

  // Custom legend renderer — shows "Label — 45.2%"
  const renderLegend = (props: { payload?: Array<{ value: string; color?: string }> }) => {
    const { payload } = props;
    if (!payload) return null;
    return (
      <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 text-xs text-slate-600">
        {payload.map((entry, index) => {
          const ld = legendData[index];
          const pctStr = ld ? ` ${ld.percent.toFixed(1)}%` : "";
          const truncated = entry.value.length > 24
            ? `${entry.value.slice(0, 24)}…`
            : entry.value;
          return (
            <li key={`legend-${index}`} className="inline-flex items-center gap-1.5 whitespace-nowrap">
              <span
                className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: entry.color ?? COLORS[index % COLORS.length] }}
              />
              <span className="text-slate-700">{truncated}</span>
              <span className="font-medium text-slate-500">{pctStr}</span>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsPieChart>
        <Pie
          data={data}
          dataKey="count"
          nameKey="label"
          cx="50%"
          cy="45%"
          innerRadius={0}
          outerRadius="80%"
          paddingAngle={1.5}
          label={({ percent }: { percent: number }) =>
            percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ""
          }
          labelLine={{ stroke: "#94a3b8", strokeWidth: 1 }}
          isAnimationActive={true}
          animationDuration={800}
          animationEasing="ease-out"
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(v: number | string, _name: string, props: { payload?: { label: string; count: number } }) => {
            const count = Number(v) || 0;
            const pct = total > 0 ? ((count / total) * 100).toFixed(1) : "0";
            return [`${count.toLocaleString()} (${pct}%)`, props?.payload?.label ?? ""];
          }}
          labelFormatter={() => ""}
        />
        <Legend
          content={renderLegend}
          verticalAlign="bottom"
        />
      </RechartsPieChart>
    </ResponsiveContainer>
  );
}
