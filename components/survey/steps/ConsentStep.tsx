"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { PhotoCapture } from "@/components/survey/PhotoCapture";
import { StepShell } from "@/components/survey/StepShell";
import { Field, FieldGroup } from "@/components/ui/Field";
import { Select } from "@/components/ui/Select";
import {
  PREFERRED_LANGUAGES,
  PREFERRED_LANGUAGE_LABELS,
} from "@/lib/constants/challenges";
import { type ConsentStepValues, consentStepSchema } from "@/lib/validation";

type Props = {
  defaultValues: Partial<ConsentStepValues>;
  onNext: (values: ConsentStepValues) => void;
  onBack?: () => void;
  isSubmitting?: boolean;
};

const yesNoOptions = [
  { value: true, label: "Yes" },
  { value: false, label: "No" },
];

function YesNoControl({
  value,
  onChange,
}: {
  value: boolean | undefined;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {yesNoOptions.map((opt) => (
        <label
          key={String(opt.value)}
          className={`flex min-h-[48px] cursor-pointer items-center justify-center rounded-lg border px-4 ${
            value === opt.value
              ? "border-brand-600 bg-brand-50 ring-2 ring-brand-600"
              : "border-slate-300 bg-white"
          }`}
        >
          <input
            type="radio"
            className="sr-only"
            checked={value === opt.value}
            onChange={() => onChange(opt.value)}
          />
          <span className="text-base font-medium">{opt.label}</span>
        </label>
      ))}
    </div>
  );
}

export function ConsentStep({
  defaultValues,
  onNext,
  onBack,
  isSubmitting,
}: Props) {
  const form = useForm<ConsentStepValues>({
    resolver: zodResolver(consentStepSchema),
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
        nextLabel={isSubmitting ? "Submitting…" : "Submit survey"}
        isSubmitting={isSubmitting}
      >
        <FieldGroup
          legend="Consent to be contacted by NOU / HEVACRAZ"
          required
          error={form.formState.errors.consentToContact?.message}
        >
          <Controller
            control={form.control}
            name="consentToContact"
            render={({ field }) => (
              <YesNoControl value={field.value} onChange={field.onChange} />
            )}
          />
        </FieldGroup>

        <FieldGroup
          legend="Consent to appear in the public technician registry once verified"
          required
          error={form.formState.errors.consentToPublicRegistry?.message}
        >
          <Controller
            control={form.control}
            name="consentToPublicRegistry"
            render={({ field }) => (
              <YesNoControl value={field.value} onChange={field.onChange} />
            )}
          />
        </FieldGroup>

        <Field
          label="Preferred language for follow-up communication"
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
                {PREFERRED_LANGUAGE_LABELS[l]}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          label="Profile photo"
          hint="Optional — helps us verify your identity for the registry."
          error={form.formState.errors.profilePhotoUrl?.message}
        >
          <Controller
            control={form.control}
            name="profilePhotoUrl"
            render={({ field }) => (
              <PhotoCapture
                value={field.value ?? undefined}
                onChange={(url) => field.onChange(url ?? null)}
              />
            )}
          />
        </Field>
      </StepShell>
    </form>
  );
}
