"use client";

import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type EventTypeDistItem = {
  eventType: string;
  count: number;
};

type EventTypePieChartProps = {
  data: EventTypeDistItem[];
  height?: number;
};

const EVENT_TYPE_LABELS: Record<string, string> = {
  "admin.login": "Admin Login",
  "admin.logout": "Admin Logout",
  "admin.invite_sent": "Invite Sent",
  "admin.password_reset": "Password Reset",
  "admin.password_changed": "Password Changed",
  "survey.verified": "Survey Verified",
  "survey.flagged": "Survey Flagged",
  "survey.deleted": "Survey Deleted",
  "export.created": "Export Created",
  "messaging.sent": "Message Sent",
  "report.analyzed": "Report Analyzed",
};

const COLORS = [
  "#0d4f3c", // brand-600
  "#2d7a5a", // brand-500
  "#e8a838", // amber-500
  "#4a8bb7", // steel blue
  "#9b6b9e", // muted purple
  "#c4544a", // brick red
  "#5a8f6a", // sage green
  "#b88a4a", // ochre
  "#6b7b8b", // slate blue
  "#c4786a", // terracotta
  "#7c3aed", // violet
];

export function EventTypePieChart({ data, height = 260 }: EventTypePieChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 py-12 text-sm text-slate-400">
        No events yet
      </div>
    );
  }

  const chartData = data.map((d) => ({
    label: EVENT_TYPE_LABELS[d.eventType] ?? d.eventType,
    count: d.count,
  }));

  const total = chartData.reduce((s, d) => s + d.count, 0);

  const renderLegend = (props: { payload?: Array<{ value: string; color?: string }> }) => {
    const { payload } = props;
    if (!payload) return null;
    return (
      <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 text-xs text-slate-600">
        {payload.map((entry, index) => {
          const item = chartData.find((d) => d.label === entry.value);
          const pct = item ? ((item.count / total) * 100).toFixed(1) : "0";
          const truncated = entry.value.length > 20
            ? `${entry.value.slice(0, 20)}…`
            : entry.value;
          return (
            <li key={index} className="inline-flex items-center gap-1.5 whitespace-nowrap">
              <span
                className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: entry.color ?? COLORS[index % COLORS.length] }}
              />
              <span className="text-slate-700">{truncated}</span>
              <span className="font-medium text-slate-500">{pct}%</span>
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
          data={chartData}
          dataKey="count"
          nameKey="label"
          cx="50%"
          cy="45%"
          innerRadius={0}
          outerRadius="80%"
          paddingAngle={1.5}
          label={({ value }: { value: number }) => {
            const pct = total > 0 ? (value / total) * 100 : 0;
            return pct > 5 ? `${pct.toFixed(1)}%` : "";
          }}
          labelLine={{ stroke: "#94a3b8", strokeWidth: 1 }}
          isAnimationActive={true}
          animationDuration={800}
          animationEasing="ease-out"
        >
          {chartData.map((_, i) => (
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
        <Legend content={renderLegend} verticalAlign="bottom" />
      </RechartsPieChart>
    </ResponsiveContainer>
  );
}
