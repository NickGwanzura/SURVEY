"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { AnswerReview } from "@/components/survey/AnswerReview";
import { PhotoCapture } from "@/components/survey/PhotoCapture";
import { PrivacyNoticeModal } from "@/components/survey/PrivacyNoticeModal";
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
  submitLabel?: string;
  requireDataConsent?: boolean;
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
  submitLabel,
  requireDataConsent = true,
}: Props) {
  const [privacyNoticeOpen, setPrivacyNoticeOpen] = useState(false);

  const form = useForm<ConsentStepValues>({
    resolver: zodResolver(consentStepSchema),
    defaultValues: {
      ...defaultValues,
      dataConsentAccepted: requireDataConsent
        ? defaultValues.dataConsentAccepted
        : true,
    },
    mode: "onTouched",
  });

  const submit = form.handleSubmit((values) => onNext(values));

  return (
    <form noValidate onSubmit={submit}>
      <StepShell
        onBack={onBack}
        onNext={() => submit()}
        isLast
        nextLabel={isSubmitting ? "Saving…" : (submitLabel ?? "Submit survey")}
        isSubmitting={isSubmitting}
      >
        <AnswerReview data={defaultValues} />

        <hr className="border-slate-200" />
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

        {requireDataConsent ? (
          <>
            <hr className="border-slate-200" />
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="mb-3 flex items-start gap-3">
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-700"
                  aria-hidden
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M8 1.5L3 4v4.5c0 3.2 2.5 6.2 5 7 2.5-.8 5-3.8 5-7V4L8 1.5z"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M6.5 8.5L7.5 9.5 10 6.5"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Data Protection & Privacy Notice
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Your personal data will be processed in accordance with the
                    Zimbabwe Cyber and Data Protection Act [Chapter 11:07].
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPrivacyNoticeOpen(true)}
                className="text-sm font-medium text-brand-600 underline-offset-4 hover:underline"
              >
                Read the full Data Protection Notice
              </button>

              <PrivacyNoticeModal
                open={privacyNoticeOpen}
                onClose={() => setPrivacyNoticeOpen(false)}
              />

              <div className="mt-4">
                <label
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                    form.watch("dataConsentAccepted")
                      ? "border-brand-300 bg-brand-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    {...form.register("dataConsentAccepted")}
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                  <span className="text-sm leading-relaxed text-slate-700">
                    I have read and I accept the{" "}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setPrivacyNoticeOpen(true);
                      }}
                      className="font-medium text-brand-600 underline-offset-4 hover:underline"
                    >
                      Data Protection Notice
                    </button>{" "}
                    as required by the Zimbabwe Cyber and Data Protection Act.
                    I consent to the processing of my personal data as described
                    in this notice.
                  </span>
                </label>
                {form.formState.errors.dataConsentAccepted?.message ? (
                  <p className="mt-1.5 text-xs font-medium text-red-600" role="alert">
                    {form.formState.errors.dataConsentAccepted.message}
                  </p>
                ) : null}
              </div>
            </div>
          </>
        ) : null}
      </StepShell>
    </form>
  );
}
