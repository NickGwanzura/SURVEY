"use client";

import { useRouter } from "next/navigation";

import { SurveyWizard } from "@/components/survey/SurveyWizard";
import { normalizeSurveyForForm } from "@/lib/validation";
import type { SurveySubmission } from "@/lib/validation";
import type { TechnicianSurvey } from "@/lib/schema";

type Props = {
  survey: TechnicianSurvey;
};

export function AdminSurveyEditor({ survey }: Props) {
  const router = useRouter();

  const handleSubmit = async (data: SurveySubmission) => {
    const res = await fetch(`/api/admin/responses/${survey.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const json = (await res.json().catch(() => null)) as {
        error?: string;
      } | null;
      throw new Error(json?.error ?? "Save failed. Please try again.");
    }

    router.push(`/admin/responses/${survey.id}?saved=1`);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-blue-800">
        <p className="font-medium">Admin edit mode</p>
        <p className="mt-1 text-sm">
          You are editing this application on behalf of the applicant. All
          changes are logged in the audit trail.
        </p>
      </div>
      <SurveyWizard
        mode="edit"
        initialData={normalizeSurveyForForm(survey as unknown as Record<string, unknown>)}
        onSubmit={handleSubmit}
        submitLabel="Save changes"
      />
    </div>
  );
}
