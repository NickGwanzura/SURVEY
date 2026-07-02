"use client";

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type BarChartProps = {
  data: Array<Record<string, unknown>>;
  dataKey?: string;
  color?: string;
  xAxisKey?: string;
  height?: number;
  horizontal?: boolean;
  /** Optional label for the data series (used in tooltip) */
  seriesLabel?: string;
  /** Optional description for empty state */
  emptyMessage?: string;
};

const BRAND_COLOR = "#0d4f3c"; // brand-600

/** Compute the percentage share of each item relative to the total. */
function computePercentages(
  data: Record<string, unknown>[],
  dataKey: string,
): Map<number, number> {
  const total = data.reduce((s, d) => s + (Number(d[dataKey]) || 0), 0);
  const map = new Map<number, number>();
  if (total === 0) return map;
  data.forEach((d, i) => {
    map.set(i, ((Number(d[dataKey]) || 0) / total) * 100);
  });
  return map;
}

export function SimpleBarChart({
  data,
  dataKey = "count",
  color = BRAND_COLOR,
  xAxisKey = "label",
  height = 280,
  horizontal = false,
  seriesLabel = "Count",
  emptyMessage = "No data available",
}: BarChartProps) {
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

  // Truncate long labels
  const truncate = (s: string, max = 20) =>
    s.length > max ? `${s.slice(0, max)}…` : s;

  const pctMap = computePercentages(data, dataKey);

  const formatted = data.map((d, i) => ({
    ...d,
    _fullLabel: String(d[xAxisKey] ?? ""),
    _pct: pctMap.get(i) ?? 0,
    [xAxisKey]: truncate(String(d[xAxisKey] ?? ""), horizontal ? 30 : 18),
  }));

  const tooltipFormatter = (
    value: number | string,
    _name: string,
    props: { payload?: Record<string, unknown> },
  ): [string, string] => {
    const num = Number(value) || 0;
    const label = String(props?.payload?._fullLabel ?? "");
    const pct = Number(props?.payload?._pct ?? 0);
    const pctStr = pct > 0 ? ` (${pct.toFixed(1)}%)` : "";
    return [`${num.toLocaleString()}${pctStr}`, label];
  };

  if (horizontal) {
    return (
      <ResponsiveContainer width="100%" height={Math.max(height, data.length * 36)}>
        <RechartsBarChart
          data={formatted}
          layout="vertical"
          margin={{ top: 4, right: 24, left: 4, bottom: 4 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11 }} />
          <YAxis
            type="category"
            dataKey={xAxisKey}
            width={Math.min(200, Math.max(80, ...data.map((d) => String(d[xAxisKey] ?? "").length * 7 + 16)))}
            tick={{ fontSize: 11 }}
          />
          <Tooltip
            formatter={tooltipFormatter}
            labelFormatter={() => ""}
          />
          <Bar
            dataKey={dataKey}
            fill={color}
            radius={[0, 4, 4, 0]}
            isAnimationActive={true}
            animationDuration={600}
            animationEasing="ease-out"
            label={{
              position: "right",
              formatter: (_value: number, entry: { payload?: Record<string, unknown> }) => {
                const pct = Number(entry?.payload?._pct ?? 0);
                return pct > 5 ? `${pct.toFixed(1)}%` : "";
              },
              fontSize: 10,
              fill: "#64748b",
            }}
          />
        </RechartsBarChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart
        data={formatted}
        margin={{ top: 4, right: 8, left: -8, bottom: 64 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey={xAxisKey}
          tick={{ fontSize: 10 }}
          angle={-35}
          textAnchor="end"
          interval={0}
          height={60}
        />
        <YAxis tick={{ fontSize: 11 }} width={45} />
        <Tooltip
          formatter={tooltipFormatter}
          labelFormatter={() => ""}
        />
        <Bar
          dataKey={dataKey}
          fill={color}
          radius={[4, 4, 0, 0]}
          maxBarSize={48}
          isAnimationActive={true}
          animationDuration={600}
          animationEasing="ease-out"
          label={{
            position: "top",
            formatter: (_value: number, entry: { payload?: Record<string, unknown> }) => {
              const pct = Number(entry?.payload?._pct ?? 0);
              return pct > 5 ? `${pct.toFixed(1)}%` : "";
            },
            fontSize: 10,
            fill: "#64748b",
          }}
        />
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}
