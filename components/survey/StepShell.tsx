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
    <div className="flex flex-col gap-5 pb-32">
      <div className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        {children}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/98 px-4 py-4 backdrop-blur-sm sm:relative sm:border-0 sm:bg-transparent sm:px-0 sm:py-0">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
          <Button
            type="button"
            variant="ghost"
            size="md"
            onClick={onBack}
            disabled={isFirst || isSubmitting}
            className="min-w-[88px]"
            aria-label={backLabel ?? "Go back to previous section"}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {backLabel ?? "Back"}
          </Button>

          <Button
            type="button"
            onClick={onNext}
            loading={isSubmitting}
            size="lg"
            className="min-w-[140px]"
            aria-label={isLast ? "Submit the survey" : "Continue to next section"}
          >
            {nextLabel ?? (isLast ? "Submit survey" : "Continue")}
            {!isSubmitting && !isLast ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : null}
          </Button>
        </div>
      </div>
    </div>
  );
}
