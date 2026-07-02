"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { OfflineBanner, useOnlineStatus } from "@/components/survey/OfflineBanner";
import { ProgressBar } from "@/components/survey/ProgressBar";
import { BackgroundStep } from "@/components/survey/steps/BackgroundStep";
import { ConsentStep } from "@/components/survey/steps/ConsentStep";
import { EnergyEfficiencyStep } from "@/components/survey/steps/EnergyEfficiencyStep";
import { SkillsTrainingStep } from "@/components/survey/steps/SkillsTrainingStep";
import { ToolsResourcesStep } from "@/components/survey/steps/ToolsResourcesStep";
import { WorkChallengesStep } from "@/components/survey/steps/WorkChallengesStep";
import { useToast } from "@/components/ui/Toast";
import {
  SURVEY_DRAFT_LS_KEY,
  queueSubmission,
} from "@/lib/offline-sync";
import { cn } from "@/lib/cn";
import type { ConsentStepValues, SurveySubmission } from "@/lib/validation";

const STEP_TITLES = [
  "Background Information",
  "Skills and Training",
  "Tools and Resources",
  "Work Challenges and Environment",
  "Energy Efficiency",
  "Consent and Submission",
];

type DraftState = Partial<SurveySubmission>;

function loadDraft(): DraftState {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(SURVEY_DRAFT_LS_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as DraftState;
  } catch {
    return {};
  }
}

function saveDraft(state: DraftState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SURVEY_DRAFT_LS_KEY, JSON.stringify(state));
  } catch {
    /* swallow quota errors */
  }
}

function clearDraft() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(SURVEY_DRAFT_LS_KEY);
  } catch {
    /* ignore */
  }
}

export type SurveyWizardProps = {
  initialData?: Partial<SurveySubmission>;
  mode?: "create" | "edit";
  onSubmit?: (data: SurveySubmission) => Promise<void>;
  submitLabel?: string;
};

export function SurveyWizard({
  initialData,
  mode = "create",
  onSubmit: externalSubmit,
  submitLabel,
}: SurveyWizardProps = {}) {
  const router = useRouter();
  const toast = useToast();
  const isOnline = useOnlineStatus();

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

  const logEvent = useCallback(async (event: string, stepIndex: number) => {
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
        }),
      });
    } catch {
      // Silent fail - analytics should not break the survey
    }
  }, [data.phone, mode]);

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

  // Log 'view' event when step becomes visible
  useEffect(() => {
    if (!hydrated) return;
    if (mode === "edit") return;
    if (hasLoggedView.current.has(step)) return;
    hasLoggedView.current.add(step);
    void logEvent("view", step);
  }, [step, hydrated, logEvent, mode]);

  // Log 'abandon' on page hide / beforeunload
  useEffect(() => {
    if (mode === "edit") return;
    const handleLeave = () => {
      void logEvent("abandon", currentStepRef.current);
    };

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        handleLeave();
      }
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

  const advance = (patch: Partial<SurveySubmission>) => {
    void logEvent("complete", step);
    setData((prev) => ({ ...prev, ...patch }));
    setStep((s) => Math.min(s + 1, STEP_TITLES.length - 1));
  };

  const back = () => setStep((s) => Math.max(s - 1, 0));

  const submit = async (final: Partial<SurveySubmission>) => {
    const merged: SurveySubmission = {
      ...data,
      ...final,
      submissionSource: "web",
    } as SurveySubmission;

    setSubmitting(true);
    setSubmitError(null);

    // Edit mode — delegate to parent
    if (mode === "edit" && externalSubmit) {
      try {
        await externalSubmit(merged);
        return;
      } catch (err) {
        setSubmitError(
          err instanceof Error
            ? err.message
            : "Save failed. Please try again.",
        );
        setSubmitting(false);
        return;
      }
    }

    // Create mode — existing logic
    if (!navigator.onLine) {
      try {
        await queueSubmission(merged);
        clearDraft();
        toast.push({
          variant: "info",
          title: "Saved offline",
          description: "Your response will sync when you reconnect.",
        });
        router.push("/survey/complete?offline=1");
        return;
      } catch (err) {
        setSubmitError(
          err instanceof Error
            ? err.message
            : "Could not save offline. Please try again.",
        );
        setSubmitting(false);
        return;
      }
    }

    try {
      const res = await fetch("/api/survey/submit", {
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
      router.push(`/survey/complete?ref=${encodeURIComponent(json.referenceNumber)}`);
    } catch (err) {
      // Network error — fall back to offline queue.
      try {
        await queueSubmission(merged);
        clearDraft();
        toast.push({
          variant: "info",
          title: "Saved offline",
          description: "Your response will sync when you reconnect.",
        });
        router.push("/survey/complete?offline=1");
      } catch {
        setSubmitError(
          err instanceof Error
            ? err.message
            : "Submission failed. Please try again.",
        );
        setSubmitting(false);
      }
    }
  };

  const canJumpToStep = (targetStep: number) => {
    // In edit mode, allow jumping to any step because data is pre-populated.
    // Admins should click Continue to save current-step edits before jumping.
    return mode === "edit" && targetStep !== step;
  };

  const jumpToStep = (targetStep: number) => {
    if (!canJumpToStep(targetStep)) return;
    setStep(targetStep);
  };

  const stepContent = (
    <>
      {step === 0 ? (
        <BackgroundStep
          defaultValues={data}
          onNext={(values) => advance(values)}
          isFirst
        />
      ) : null}

      {step === 1 ? (
        <SkillsTrainingStep
          defaultValues={data}
          onNext={(values) => advance(values)}
          onBack={back}
        />
      ) : null}

      {step === 2 ? (
        <ToolsResourcesStep
          defaultValues={data}
          onNext={(values) => advance(values)}
          onBack={back}
        />
      ) : null}

      {step === 3 ? (
        <WorkChallengesStep
          defaultValues={data}
          onNext={(values) => advance(values)}
          onBack={back}
        />
      ) : null}

      {step === 4 ? (
        <EnergyEfficiencyStep
          defaultValues={data}
          onNext={(values) => advance(values)}
          onBack={back}
        />
      ) : null}

      {step === 5 ? (
        <ConsentStep
          defaultValues={data as unknown as Partial<ConsentStepValues>}
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
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden className="mt-0.5 shrink-0 text-red-600">
            <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="1.5" />
            <path d="M9 5.5v4M9 11.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <p className="text-sm text-red-800">{submitError}</p>
        </div>
      ) : null}

      {mode === "edit" ? (
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          {/* Step navigation sidebar */}
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
                      onClick={() => jumpToStep(i)}
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

          {/* Step content */}
          <div className="min-w-0 flex-1">{stepContent}</div>
        </div>
      ) : (
        stepContent
      )}
    </div>
  );
}
