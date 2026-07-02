"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { StepShell } from "@/components/survey/StepShell";
import { Field } from "@/components/ui/Field";
import { Select } from "@/components/ui/Select";
import { PREFERRED_LANGUAGES } from "@/lib/constants/challenges";

import {
  type RetailerConsentStepValues,
  retailerConsentStepSchema,
} from "@/lib/retailer-validation";

type Props = {
  defaultValues: Partial<RetailerConsentStepValues>;
  onNext: (values: RetailerConsentStepValues) => void;
  onBack?: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
  requireDataConsent?: boolean;
};

const LANGUAGE_LABELS: Record<string, string> = {
  english: "English",
  shona: "Shona",
  ndebele: "Ndebele",
};

export function RetailerConsentStep({
  defaultValues,
  onNext,
  onBack,
  isSubmitting,
  submitLabel,
  requireDataConsent = true,
}: Props) {
  const form = useForm<RetailerConsentStepValues>({
    resolver: zodResolver(retailerConsentStepSchema),
    defaultValues,
    mode: "onTouched",
  });

  const submit = form.handleSubmit((values) => onNext(values));

  return (
    <form noValidate onSubmit={submit}>
      <StepShell
        onBack={onBack}
        onNext={() => submit()}
        isLast
        isSubmitting={isSubmitting}
        nextLabel={submitLabel ?? "Submit survey"}
      >
        <Field
          label="May we contact you about your submission?"
          required
          error={form.formState.errors.consentToContact?.message}
        >
          <Controller
            control={form.control}
            name="consentToContact"
            render={({ field }) => (
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="radio"
                    checked={field.value === true}
                    onChange={() => field.onChange(true)}
                    onBlur={field.onBlur}
                    className="accent-brand-600"
                  />
                  Yes
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="radio"
                    checked={field.value === false}
                    onChange={() => field.onChange(false)}
                    onBlur={field.onBlur}
                    className="accent-brand-600"
                  />
                  No
                </label>
              </div>
            )}
          />
        </Field>

        <Field
          label="Preferred Language"
          required
          htmlFor="preferredLanguage"
          error={form.formState.errors.preferredLanguage?.message}
        >
          <Select
            id="preferredLanguage"
            placeholder="Choose…"
            invalid={Boolean(form.formState.errors.preferredLanguage)}
            {...form.register("preferredLanguage")}
          >
            {PREFERRED_LANGUAGES.map((l) => (
              <option key={l} value={l}>
                {LANGUAGE_LABELS[l] ?? l}
              </option>
            ))}
          </Select>
        </Field>

        {requireDataConsent && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <Field
              label=""
              error={form.formState.errors.dataConsentAccepted?.message}
            >
              <Controller
                control={form.control}
                name="dataConsentAccepted"
                render={({ field }) => (
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={field.value === true}
                      onChange={(e) => field.onChange(e.target.checked)}
                      onBlur={field.onBlur}
                      className="mt-0.5 accent-brand-600"
                    />
                    <span className="text-sm text-slate-700 leading-relaxed">
                      I confirm that the information provided is accurate and I
                      consent to the processing of my data in accordance with
                      the Data Protection Notice. I understand that my details
                      may be shared with NOU and HEVACRAZ for registry purposes.
                    </span>
                  </label>
                )}
              />
            </Field>
          </div>
        )}
      </StepShell>
    </form>
  );
}
