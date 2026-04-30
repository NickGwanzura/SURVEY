import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type Props = {
  title: string;
  children: ReactNode;
  className?: string;
};

export function ResponseDetailSection({ title, children, className }: Props) {
  return (
    <section
      aria-labelledby={`section-${title.toLowerCase().replace(/\s+/g, "-")}`}
      className={cn(
        "rounded-xl border border-slate-200 bg-white p-6 shadow-sm",
        className,
      )}
    >
      <h2
        id={`section-${title.toLowerCase().replace(/\s+/g, "-")}`}
        className="mb-4 text-base font-semibold text-slate-900"
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

type DetailRowProps = {
  label: string;
  children: ReactNode;
  className?: string;
};

export function DetailRow({ label, children, className }: DetailRowProps) {
  return (
    <div className={cn("flex flex-col gap-0.5 sm:flex-row sm:gap-4", className)}>
      <dt className="w-full text-xs font-medium text-slate-500 sm:w-48 sm:shrink-0 sm:text-sm">
        {label}
      </dt>
      <dd className="text-sm text-slate-900">{children}</dd>
    </div>
  );
}

export function DetailGrid({ children }: { children: ReactNode }) {
  return (
    <dl className="flex flex-col gap-3">{children}</dl>
  );
}
