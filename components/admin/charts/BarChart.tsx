"use client";

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

type BarChartProps = {
  data: Array<{ label: string; count: number; [key: string]: unknown }>;
  dataKey?: string;
  color?: string;
  xAxisKey?: string;
  height?: number;
  horizontal?: boolean;
};

const BRAND_COLOR = "#2563eb"; // brand-600

export function SimpleBarChart({
  data,
  dataKey = "count",
  color = BRAND_COLOR,
  xAxisKey = "label",
  height = 280,
  horizontal = false,
}: BarChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-slate-400">
        No data available
      </div>
    );
  }

  // Truncate long labels
  const truncate = (s: string, max = 20) =>
    s.length > max ? `${s.slice(0, max)}…` : s;

  const formatted = data.map((d) => ({
    ...d,
    [xAxisKey]: truncate(String(d[xAxisKey] ?? ""), horizontal ? 30 : 18),
  }));

  if (horizontal) {
    return (
      <ResponsiveContainer width="100%" height={Math.max(height, data.length * 36)}>
        <RechartsBarChart
          data={formatted}
          layout="vertical"
          margin={{ top: 4, right: 24, left: 8, bottom: 4 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11 }} />
          <YAxis
            type="category"
            dataKey={xAxisKey}
            width={160}
            tick={{ fontSize: 11 }}
          />
          <Tooltip formatter={(v: number) => v.toLocaleString()} />
          <Bar dataKey={dataKey} fill={color} radius={[0, 4, 4, 0]}>
            {formatted.map((_, i) => (
              <Cell key={i} fill={color} />
            ))}
          </Bar>
        </RechartsBarChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart
        data={formatted}
        margin={{ top: 4, right: 8, left: -16, bottom: 64 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey={xAxisKey}
          tick={{ fontSize: 11 }}
          angle={-35}
          textAnchor="end"
          interval={0}
        />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip formatter={(v: number) => v.toLocaleString()} />
        <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]}>
          {formatted.map((_, i) => (
            <Cell key={i} fill={color} />
          ))}
        </Bar>
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}
