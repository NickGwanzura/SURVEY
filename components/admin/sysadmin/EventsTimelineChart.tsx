"use client";

import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
} from "recharts";

type EventsByDayItem = {
  date: string;
  count: number;
};

type EventsTimelineChartProps = {
  data: EventsByDayItem[];
  height?: number;
};

function formatDateLabel(raw: string): string {
  if (!/^\d{4}/.test(raw)) return raw;
  try {
    const d = new Date(raw + (raw.length === 10 ? "T00:00:00" : ""));
    if (isNaN(d.getTime())) return raw;
    return d.toLocaleDateString("en-ZA", {
      day: "numeric",
      month: "short",
    });
  } catch {
    return raw;
  }
}

export function EventsTimelineChart({ data, height = 260 }: EventsTimelineChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 py-12 text-sm text-slate-400">
        No events in the last 30 days
      </div>
    );
  }

  const step = Math.max(1, Math.floor(data.length / 8));
  const tickFormatter = (val: string, idx: number) => {
    if (idx % step === 0) return formatDateLabel(val);
    return "";
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLineChart
        data={data}
        margin={{ top: 8, right: 8, left: -8, bottom: 4 }}
      >
        <defs>
          <linearGradient id="timelineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0d4f3c" stopOpacity={0.20} />
            <stop offset="100%" stopColor="#0d4f3c" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
        <XAxis
          dataKey="date"
          tickFormatter={tickFormatter}
          tick={{ fontSize: 11, fill: "#64748b" }}
          axisLine={{ stroke: "#e2e8f0" }}
          tickLine={false}
          interval={0}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#64748b" }}
          allowDecimals={false}
          axisLine={false}
          tickLine={false}
          width={36}
        />
        <Tooltip
          labelFormatter={(l: string) => formatDateLabel(l)}
          formatter={(v: number | string) => [Number(v).toLocaleString(), "Events"]}
          contentStyle={{
            borderRadius: 8,
            border: "1px solid #e2e8f0",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            fontSize: 13,
          }}
        />
        <Area
          type="monotone"
          dataKey="count"
          stroke="none"
          fill="url(#timelineGrad)"
          isAnimationActive={true}
          animationDuration={1000}
          animationEasing="ease-out"
        />
        <Line
          type="monotone"
          dataKey="count"
          stroke="#0d4f3c"
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 5, fill: "#0d4f3c", stroke: "#fff", strokeWidth: 2 }}
          isAnimationActive={true}
          animationDuration={1000}
          animationEasing="ease-out"
        />
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}
