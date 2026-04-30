"use client";

import type { ReactNode } from "react";

import { Button } from "@/components/ui/Button";

export type StepShellProps = {
  children: ReactNode;
  onBack?: () => void;
  onNext: () => void;
  nextLabel?: string;
  backLabel?: string;
  isFirst?: boolean;
  isLast?: boolean;
  isSubmitting?: boolean;
};

export function StepShell({
  children,
  onBack,
  onNext,
  nextLabel,
  backLabel,
  isFirst,
  isLast,
  isSubmitting,
}: StepShellProps) {
  return (
    <div className="flex flex-col gap-6 pb-28">
      {children}

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:relative sm:border-0 sm:bg-transparent sm:px-0 sm:py-0">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={onBack}
            disabled={isFirst || isSubmitting}
          >
            {backLabel ?? "Back"}
          </Button>
          <Button
            type="button"
            onClick={onNext}
            loading={isSubmitting}
            size="lg"
          >
            {nextLabel ?? (isLast ? "Submit" : "Next")}
          </Button>
        </div>
      </div>
    </div>
  );
}
