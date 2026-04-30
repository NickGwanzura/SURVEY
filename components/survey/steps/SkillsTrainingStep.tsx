"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { ConditionalField } from "@/components/survey/ConditionalField";
import {
  LIKERT_ACCESS_LABELS,
  LIKERT_CONFIDENCE_LABELS,
  LikertScale,
} from "@/components/survey/LikertScale";
import { StepShell } from "@/components/survey/StepShell";
import { Field, FieldGroup } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import {
  CERTIFICATION_TYPES,
  CERTIFICATION_TYPE_LABELS,
  HAS_CERTIFICATION_LABELS,
  HAS_CERTIFICATION_OPTIONS,
} from "@/lib/constants/refrigerants";
import {
  type SkillsTrainingStepValues,
  skillsTrainingStepSchema,
} from "@/lib/validation";

type Props = {
  defaultValues: Partial<SkillsTrainingStepValues>;
  onNext: (values: SkillsTrainingStepValues) => void;
  onBack?: () => void;
};

export function SkillsTrainingStep({ defaultValues, onNext, onBack }: Props) {
  const form = useForm<SkillsTrainingStepValues>({
    resolver: zodResolver(skillsTrainingStepSchema),
    defaultValues: {
      certificationsHeld: [],
      ...defaultValues,
    },
    mode: "onTouched",
  });

  const hasFormalTraining = form.watch("hasFormalTraining");
  const hasCertification = form.watch("hasCertification");
  const certificationsHeld = form.watch("certificationsHeld") ?? [];

  const submit = form.handleSubmit((values) => onNext(values));

  return (
    <form noValidate onSubmit={submit}>
      <StepShell onBack={onBack} onNext={() => submit()}>
        <FieldGroup
          legend="Have you received formal training in HVAC-R?"
          required
          error={form.formState.errors.hasFormalTraining?.message}
        >
          <Controller
            control={form.control}
            name="hasFormalTraining"
            render={({ field }) => (
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: true, label: "Yes" },
                  { value: false, label: "No" },
                ].map((opt) => (
                  <label
                    key={String(opt.value)}
                    className={`flex min-h-[48px] cursor-pointer items-center justify-center rounded-lg border px-4 ${
                      field.value === opt.value
                        ? "border-brand-600 bg-brand-50 ring-2 ring-brand-600"
                        : "border-slate-300 bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      className="sr-only"
                      checked={field.value === opt.value}
                      onChange={() => field.onChange(opt.value)}
                    />
                    <span className="text-base font-medium">{opt.label}</span>
                  </label>
                ))}
              </div>
            )}
          />
        </FieldGroup>

        <ConditionalField show={hasFormalTraining === true}>
          <div className="flex flex-col gap-3">
            <Field
              label="Where did you train?"
              required
              htmlFor="trainingInstitution"
              error={form.formState.errors.trainingInstitution?.message}
            >
              <Input
                id="trainingInstitution"
                invalid={Boolean(form.formState.errors.trainingInstitution)}
                {...form.register("trainingInstitution")}
              />
            </Field>
            <Field
              label="Year completed"
              required
              htmlFor="trainingYear"
              error={form.formState.errors.trainingYear?.message}
            >
              <Input
                id="trainingYear"
                type="number"
                inputMode="numeric"
                min={1950}
                max={new Date().getFullYear()}
                invalid={Boolean(form.formState.errors.trainingYear)}
                {...form.register("trainingYear", {
                  setValueAs: (v) => (v === "" || v == null ? null : Number(v)),
                })}
              />
            </Field>
          </div>
        </ConditionalField>

        <Field
          label="Do you hold any certification or accreditation?"
          required
          htmlFor="hasCertification"
          error={form.formState.errors.hasCertification?.message}
        >
          <Select
            id="hasCertification"
            placeholder="Choose…"
            invalid={Boolean(form.formState.errors.hasCertification)}
            {...form.register("hasCertification")}
          >
            {HAS_CERTIFICATION_OPTIONS.map((o) => (
              <option key={o} value={o}>
                {HAS_CERTIFICATION_LABELS[o]}
              </option>
            ))}
          </Select>
        </Field>

        <ConditionalField show={hasCertification === "yes"}>
          <div className="flex flex-col gap-3">
            <FieldGroup
              legend="Which certifications do you hold?"
              required
              error={form.formState.errors.certificationsHeld?.message as string}
            >
              <Controller
                control={form.control}
                name="certificationsHeld"
                render={({ field }) => (
                  <div className="flex flex-col gap-2">
                    {CERTIFICATION_TYPES.map((c) => {
                      const checked = field.value?.includes(c) ?? false;
                      return (
                        <label
                          key={c}
                          className={`flex min-h-[44px] cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 ${
                            checked
                              ? "border-brand-600 bg-brand-50"
                              : "border-slate-300 bg-white"
                          }`}
                        >
                          <input
                            type="checkbox"
                            className="h-5 w-5 accent-brand-600"
                            checked={checked}
                            onChange={(e) => {
                              const next = new Set(field.value ?? []);
                              if (e.target.checked) next.add(c);
                              else next.delete(c);
                              field.onChange(Array.from(next));
                            }}
                          />
                          <span className="text-sm">
                            {CERTIFICATION_TYPE_LABELS[c]}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
              />
            </FieldGroup>

            {certificationsHeld.includes("hevacraz_membership") ? (
              <Field
                label="HEVACRAZ Membership Number"
                required
                htmlFor="hevacrazMemberNumber"
                error={form.formState.errors.hevacrazMemberNumber?.message}
              >
                <Input
                  id="hevacrazMemberNumber"
                  invalid={Boolean(form.formState.errors.hevacrazMemberNumber)}
                  {...form.register("hevacrazMemberNumber")}
                />
              </Field>
            ) : null}
          </div>
        </ConditionalField>

        <FieldGroup
          legend="Confidence — Traditional refrigerants (R-22, R-134a, R-404A, R-410A)"
          required
          error={
            form.formState.errors.confidenceTraditionalRefrigerants?.message
          }
        >
          <Controller
            control={form.control}
            name="confidenceTraditionalRefrigerants"
            render={({ field }) => (
              <LikertScale
                name="confidenceTraditionalRefrigerants"
                value={field.value}
                onChange={field.onChange}
                labels={LIKERT_CONFIDENCE_LABELS}
                invalid={Boolean(
                  form.formState.errors.confidenceTraditionalRefrigerants,
                )}
              />
            )}
          />
        </FieldGroup>

        <FieldGroup
          legend="Confidence — Low-GWP refrigerants (R-290, R-744, R-32, R-1234yf)"
          required
          error={form.formState.errors.confidenceLowGwpRefrigerants?.message}
        >
          <Controller
            control={form.control}
            name="confidenceLowGwpRefrigerants"
            render={({ field }) => (
              <LikertScale
                name="confidenceLowGwpRefrigerants"
                value={field.value}
                onChange={field.onChange}
                labels={LIKERT_CONFIDENCE_LABELS}
                invalid={Boolean(
                  form.formState.errors.confidenceLowGwpRefrigerants,
                )}
              />
            )}
          />
        </FieldGroup>

        <FieldGroup
          legend="Access to tools and equipment"
          required
          error={form.formState.errors.accessToTools?.message}
        >
          <Controller
            control={form.control}
            name="accessToTools"
            render={({ field }) => (
              <LikertScale
                name="accessToTools"
                value={field.value}
                onChange={field.onChange}
                labels={LIKERT_ACCESS_LABELS}
                invalid={Boolean(form.formState.errors.accessToTools)}
              />
            )}
          />
        </FieldGroup>

        <FieldGroup
          legend="Access to spare parts"
          required
          error={form.formState.errors.accessToSpareParts?.message}
        >
          <Controller
            control={form.control}
            name="accessToSpareParts"
            render={({ field }) => (
              <LikertScale
                name="accessToSpareParts"
                value={field.value}
                onChange={field.onChange}
                labels={LIKERT_ACCESS_LABELS}
                invalid={Boolean(form.formState.errors.accessToSpareParts)}
              />
            )}
          />
        </FieldGroup>

        <FieldGroup
          legend="Access to low-GWP refrigerants"
          required
          error={form.formState.errors.accessToLowGwpRefrigerants?.message}
        >
          <Controller
            control={form.control}
            name="accessToLowGwpRefrigerants"
            render={({ field }) => (
              <LikertScale
                name="accessToLowGwpRefrigerants"
                value={field.value}
                onChange={field.onChange}
                labels={LIKERT_ACCESS_LABELS}
                invalid={Boolean(
                  form.formState.errors.accessToLowGwpRefrigerants,
                )}
              />
            )}
          />
        </FieldGroup>
      </StepShell>
    </form>
  );
}
