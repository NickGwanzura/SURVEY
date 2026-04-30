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
  data: Array<{ label: string; count: number; percent: number }>;
  height?: number;
};

const COLORS = [
  "#2563eb",
  "#7c3aed",
  "#db2777",
  "#ea580c",
  "#16a34a",
  "#0891b2",
  "#ca8a04",
  "#dc2626",
];

export function SimplePieChart({ data, height = 280 }: PieChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-slate-400">
        No data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsPieChart>
        <Pie
          data={data}
          dataKey="count"
          nameKey="label"
          cx="50%"
          cy="45%"
          outerRadius={90}
          label={({ percent }: { percent: number }) =>
            `${(percent * 100).toFixed(1)}%`
          }
          labelLine={false}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(v: number) => v.toLocaleString()}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(val: string) =>
            val.length > 28 ? `${val.slice(0, 28)}…` : val
          }
          wrapperStyle={{ fontSize: 11 }}
        />
      </RechartsPieChart>
    </ResponsiveContainer>
  );
}
