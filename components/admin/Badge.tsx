import type { ReactNode } from "react";

import { cn } from "@/lib/cn";
import type { SubmissionStatus } from "@/lib/constants/challenges";

type BadgeProps = {
  children: ReactNode;
  tone?:
    | "neutral"
    | "info"
    | "success"
    | "warning"
    | "danger"
    | "brand";
  className?: string;
};

const toneClasses: Record<NonNullable<BadgeProps["tone"]>, string> = {
  neutral: "bg-slate-100 text-slate-700",
  info: "bg-sky-100 text-sky-800",
  success: "bg-emerald-100 text-emerald-800",
  warning: "bg-amber-100 text-amber-900",
  danger: "bg-red-100 text-red-800",
  brand: "bg-brand-100 text-brand-700",
};

const BADGE_STATUS_TONES: Record<SubmissionStatus, BadgeProps["tone"]> = {
  pending: "info",
  verified: "success",
  flagged: "warning",
  duplicate: "neutral",
} as const;

export function Badge({ children, tone = "neutral", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: SubmissionStatus }) {
  return (
    <Badge tone={BADGE_STATUS_TONES[status]}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}
