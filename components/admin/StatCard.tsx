import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type StatCardProps = {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  tone?: "default" | "success" | "warning" | "danger";
  icon?: ReactNode;
  className?: string;
};

const toneClasses: Record<NonNullable<StatCardProps["tone"]>, { card: string; icon: string; value: string }> = {
  default: {
    card: "border-slate-200 bg-white",
    icon: "bg-slate-100 text-slate-500",
    value: "text-slate-900",
  },
  success: {
    card: "border-emerald-200 bg-white",
    icon: "bg-emerald-50 text-emerald-600",
    value: "text-emerald-800",
  },
  warning: {
    card: "border-amber-200 bg-white",
    icon: "bg-amber-50 text-amber-600",
    value: "text-amber-900",
  },
  danger: {
    card: "border-red-200 bg-white",
    icon: "bg-red-50 text-red-600",
    value: "text-red-800",
  },
};

const accentBar: Record<NonNullable<StatCardProps["tone"]>, string> = {
  default: "bg-slate-300",
  success: "bg-emerald-400",
  warning: "bg-amber-400",
  danger: "bg-red-400",
};

export function StatCard({
  label,
  value,
  hint,
  tone = "default",
  icon,
  className,
}: StatCardProps) {
  const styles = toneClasses[tone];
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border p-5 shadow-sm",
        styles.card,
        className,
      )}
    >
      <div className={cn("absolute left-0 top-0 h-full w-1 rounded-l-2xl", accentBar[tone])} aria-hidden />
      <div className="flex items-start justify-between gap-3 pl-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            {label}
          </p>
          <p className={cn("mt-2 text-3xl font-bold tabular-nums leading-none", styles.value)}>
            {value}
          </p>
          {hint ? (
            <p className="mt-1.5 text-xs text-slate-400">{hint}</p>
          ) : null}
        </div>
        {icon ? (
          <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", styles.icon)}>
            {icon}
          </span>
        ) : null}
      </div>
    </div>
  );
}
