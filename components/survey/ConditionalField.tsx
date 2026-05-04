"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type ConditionalFieldProps = {
  show: boolean;
  className?: string;
  children: ReactNode;
};

export function ConditionalField({
  show,
  className,
  children,
}: ConditionalFieldProps) {
  if (!show) return null;
  return (
    <div
      className={cn(
        "conditional-enter rounded-xl border border-brand-200 bg-brand-50/60 p-3.5",
        className,
      )}
    >
      {children}
    </div>
  );
}
