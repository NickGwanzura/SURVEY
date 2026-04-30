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
        "rounded-lg border border-brand-200 bg-brand-50 p-3",
        className,
      )}
    >
      {children}
    </div>
  );
}
