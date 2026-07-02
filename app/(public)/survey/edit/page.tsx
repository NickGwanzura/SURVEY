"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { SurveyWizard } from "@/components/survey/SurveyWizard";
import { normalizeSurveyForForm } from "@/lib/validation";
import type { SurveySubmission } from "@/lib/validation";

type EditState = {
  id: string;
  phone: string;
  data: Record<string, unknown>;
};

export default function SurveyEditPage() {
  const router = useRouter();
  const [state, setState] = useState<EditState | null>(() => {
    if (typeof window === "undefined") return null;
    const raw = sessionStorage.getItem("surveyEditState");
    if (!raw) return null;
    try {
      return JSON.parse(raw) as EditState;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (state === null) {
      router.push("/edit");
    }
  }, [state, router]);

  if (!state) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3 text-slate-500">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" />
        <span className="text-sm">Loading your application…</span>
      </div>
    );
  }

  const handleSubmit = async (data: SurveySubmission) => {
    const res = await fetch(`/api/survey/${state.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, verificationPhone: state.phone }),
    });

    if (!res.ok) {
      const json = (await res.json().catch(() => null)) as {
        error?: string;
      } | null;
      throw new Error(json?.error ?? "Save failed. Please try again.");
    }

    sessionStorage.removeItem("surveyEditState");
    router.push("/survey/complete?edited=1");
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
        <p className="font-medium">You are editing your application</p>
        <p className="mt-1 text-sm">
          Review your answers and make any corrections, then save your changes
          at the end.
        </p>
      </div>
      <SurveyWizard
        mode="edit"
        initialData={normalizeSurveyForForm(state.data)}
        onSubmit={handleSubmit}
        submitLabel="Save changes"
      />
    </div>
  );
}
