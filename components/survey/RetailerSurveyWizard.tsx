"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { OfflineBanner } from "@/components/survey/OfflineBanner";
import { ProgressBar } from "@/components/survey/ProgressBar";
import { RetailerBusinessStep } from "@/components/survey/steps/RetailerBusinessStep";
import { RetailerConsentStep } from "@/components/survey/steps/RetailerConsentStep";
import { RetailerChallengesStep } from "@/components/survey/steps/RetailerChallengesStep";
import { RetailerProductsStep } from "@/components/survey/steps/RetailerProductsStep";
import { cn } from "@/lib/cn";
import type {
  RetailerSurveySubmission,
  RetailerConsentStepValues,
} from "@/lib/retailer-validation";

const STEP_TITLES = [
  "Business Information",
  "Products and Sourcing",
  "Challenges",
  "Consent and Submission",
];

const LS_KEY = "zw-rac-retailer-survey-draft-v1";

type DraftState = Partial<RetailerSurveySubmission>;

function loadDraft(): DraftState {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as DraftState;
  } catch {
    return {};
  }
}

function saveDraft(state: DraftState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LS_KEY, JSON.stringify(state));
  } catch {
    /* swallow quota errors */
  }
}

function clearDraft() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(LS_KEY);
  } catch {
    /* ignore */
  }
}

export type RetailerSurveyWizardProps = {
  initialData?: Partial<RetailerSurveySubmission>;
  mode?: "create" | "edit";
  onSubmit?: (data: RetailerSurveySubmission) => Promise<void>;
  submitLabel?: string;
};

export function RetailerSurveyWizard({
  initialData,
  mode = "create",
  onSubmit: externalSubmit,
  submitLabel,
}: RetailerSurveyWizardProps = {}) {
  const router = useRouter();

  const [hydrated, setHydrated] = useState(false);
  const [step, setStep] = useState(0);
  const [data, setData] = useState<DraftState>(initialData ?? {});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const topRef = useRef<HTMLDivElement | null>(null);
  const hasLoggedView = useRef<Set<number>>(new Set());
  const currentStepRef = useRef(step);

  useEffect(() => {
    currentStepRef.current = step;
  }, [step]);

  const logEvent = useCallback(
    async (event: string, stepIndex: number) => {
      if (mode === "edit") return;
      try {
        await fetch("/api/survey/event", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone: data.phone ?? "unknown",
            step: stepIndex,
            stepName: STEP_TITLES[stepIndex],
            event,
            surveyType: "retailer",
          }),
        });
      } catch {
        // Silent fail
      }
    },
    [data.phone, mode],
  );

  useEffect(() => {
    if (mode === "edit") {
      setHydrated(true);
      return;
    }
    setData(loadDraft());
    setHydrated(true);
  }, [mode]);

  useEffect(() => {
    if (hydrated && mode === "create") saveDraft(data);
  }, [data, hydrated, mode]);

  useEffect(() => {
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [step]);

  useEffect(() => {
    if (!hydrated) return;
    if (mode === "edit") return;
    if (hasLoggedView.current.has(step)) return;
    hasLoggedView.current.add(step);
    void logEvent("view", step);
  }, [step, hydrated, logEvent, mode]);

  useEffect(() => {
    if (mode === "edit") return;
    const handleLeave = () => {
      void logEvent("abandon", currentStepRef.current);
    };
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") handleLeave();
    });
    window.addEventListener("beforeunload", handleLeave);
    return () => {
      window.removeEventListener("beforeunload", handleLeave);
    };
  }, [logEvent, mode]);

  if (!hydrated) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3 text-slate-500">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" />
        <span className="text-sm">Loading your saved progress…</span>
      </div>
    );
  }

  const advance = (patch: Partial<RetailerSurveySubmission>) => {
    void logEvent("complete", step);
    setData((prev) => ({ ...prev, ...patch }));
    setStep((s) => Math.min(s + 1, STEP_TITLES.length - 1));
  };

  const back = () => setStep((s) => Math.max(s - 1, 0));

  const submit = async (final: Partial<RetailerSurveySubmission>) => {
    const merged: RetailerSurveySubmission = {
      ...data,
      ...final,
      submissionSource: "web",
    } as RetailerSurveySubmission;

    setSubmitting(true);
    setSubmitError(null);

    if (mode === "edit" && externalSubmit) {
      try {
        await externalSubmit(merged);
        return;
      } catch (err) {
        setSubmitError(
          err instanceof Error ? err.message : "Save failed. Please try again.",
        );
        setSubmitting(false);
        return;
      }
    }

    try {
      const res = await fetch("/api/retailer-survey/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(merged),
      });

      if (res.status === 409) {
        const json = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        setSubmitError(
          json?.error ?? "This phone number has already been submitted.",
        );
        setSubmitting(false);
        setStep(0);
        return;
      }

      if (!res.ok) {
        const json = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        setSubmitError(
          json?.error ?? `Submission failed (HTTP ${res.status}). Please try again.`,
        );
        setSubmitting(false);
        return;
      }

      const json = (await res.json()) as {
        id: string;
        referenceNumber: string;
      };
      clearDraft();
      router.push(
        `/retailer-survey/complete?ref=${encodeURIComponent(json.referenceNumber)}`,
      );
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : "Submission failed. Please try again.",
      );
      setSubmitting(false);
    }
  };

  const stepContent = (
    <>
      {step === 0 ? (
        <RetailerBusinessStep
          defaultValues={data}
          onNext={(values) => advance(values)}
          isFirst
        />
      ) : null}
      {step === 1 ? (
        <RetailerProductsStep
          defaultValues={data}
          onNext={(values) => advance(values)}
          onBack={back}
        />
      ) : null}
      {step === 2 ? (
        <RetailerChallengesStep
          defaultValues={data}
          onNext={(values) => advance(values)}
          onBack={back}
        />
      ) : null}
      {step === 3 ? (
        <RetailerConsentStep
          defaultValues={data as unknown as Partial<RetailerConsentStepValues>}
          onNext={(values) => submit(values)}
          onBack={back}
          isSubmitting={submitting}
          submitLabel={submitLabel}
          requireDataConsent={mode === "create"}
        />
      ) : null}
    </>
  );

  return (
    <div className="flex flex-col gap-6">
      <OfflineBanner />
      <div ref={topRef} />
      <ProgressBar
        step={step + 1}
        totalSteps={STEP_TITLES.length}
        title={STEP_TITLES[step]}
        stepTitles={STEP_TITLES}
      />

      {submitError ? (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            aria-hidden
            className="mt-0.5 shrink-0 text-red-600"
          >
            <circle
              cx="9"
              cy="9"
              r="8"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M9 5.5v4M9 11.5v.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <p className="text-sm text-red-800">{submitError}</p>
        </div>
      ) : null}

      {mode === "edit" ? (
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <nav
            aria-label="Edit sections"
            className="shrink-0 rounded-xl border border-slate-200 bg-white p-3 shadow-sm lg:w-56"
          >
            <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Jump to section
            </p>
            <ol className="flex flex-row gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
              {STEP_TITLES.map((title, i) => {
                const isCurrent = i === step;
                const isCompleted = i < step;
                return (
                  <li key={i}>
                    <button
                      type="button"
                      onClick={() => {
                        if (mode === "edit" && i !== step) setStep(i);
                      }}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors whitespace-nowrap lg:whitespace-normal",
                        isCurrent
                          ? "bg-brand-50 font-semibold text-brand-700"
                          : isCompleted
                            ? "text-slate-700 hover:bg-slate-50"
                            : "text-slate-500 hover:bg-slate-50",
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                          isCurrent
                            ? "bg-brand-600 text-white"
                            : isCompleted
                              ? "bg-brand-100 text-brand-700"
                              : "bg-slate-100 text-slate-500",
                        )}
                      >
                        {i + 1}
                      </span>
                      <span className="truncate">{title}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </nav>
          <div className="min-w-0 flex-1">{stepContent}</div>
        </div>
      ) : (
        stepContent
      )}
    </div>
  );
}
