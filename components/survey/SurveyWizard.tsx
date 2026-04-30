"use client";

import { useEffect, useRef, useState } from "react";
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
import type { SurveySubmission } from "@/lib/validation";

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

export function SurveyWizard() {
  const router = useRouter();
  const toast = useToast();
  const isOnline = useOnlineStatus();

  const [hydrated, setHydrated] = useState(false);
  const [step, setStep] = useState(0);
  const [data, setData] = useState<DraftState>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const topRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setData(loadDraft());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveDraft(data);
  }, [data, hydrated]);

  useEffect(() => {
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [step]);

  if (!hydrated) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-500">
        Loading…
      </div>
    );
  }

  const advance = (patch: Partial<SurveySubmission>) => {
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

  return (
    <div className="flex flex-col gap-6">
      <OfflineBanner />
      <div ref={topRef} />
      <ProgressBar
        step={step + 1}
        totalSteps={STEP_TITLES.length}
        title={STEP_TITLES[step]}
      />

      {!isOnline ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
          You are working offline. Your answers are auto-saved on this device
          and will sync when you reconnect.
        </div>
      ) : null}

      {submitError ? (
        <div
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800"
        >
          {submitError}
        </div>
      ) : null}

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
          defaultValues={data}
          onNext={(values) => submit(values)}
          onBack={back}
          isSubmitting={submitting}
        />
      ) : null}
    </div>
  );
}
