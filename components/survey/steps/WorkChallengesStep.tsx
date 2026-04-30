"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { ConditionalField } from "@/components/survey/ConditionalField";
import { StepShell } from "@/components/survey/StepShell";
import { Field, FieldGroup } from "@/components/ui/Field";
import { Input, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import {
  BIGGEST_DAILY_CHALLENGES,
  BIGGEST_DAILY_CHALLENGE_LABELS,
  EHS_BARRIERS,
  EHS_BARRIER_LABELS,
  LOAD_SHEDDING_FREQUENCIES,
  LOAD_SHEDDING_FREQUENCY_LABELS,
  PPE_ACCESS,
  PPE_ACCESS_LABELS,
  RECOVERY_EQUIPMENT_USE,
  RECOVERY_EQUIPMENT_USE_LABELS,
} from "@/lib/constants/challenges";
import {
  type WorkChallengesStepValues,
  workChallengesStepSchema,
} from "@/lib/validation";

type Props = {
  defaultValues: Partial<WorkChallengesStepValues>;
  onNext: (values: WorkChallengesStepValues) => void;
  onBack?: () => void;
};

export function WorkChallengesStep({ defaultValues, onNext, onBack }: Props) {
  const form = useForm<WorkChallengesStepValues>({
    resolver: zodResolver(workChallengesStepSchema),
    defaultValues: {
      ehsComplianceBarriers: [],
      ...defaultValues,
    },
    mode: "onTouched",
  });

  const challenge = form.watch("biggestDailyChallenge");
  const ehsBarriers = form.watch("ehsComplianceBarriers") ?? [];

  const submit = form.handleSubmit((values) => onNext(values));

  return (
    <form noValidate onSubmit={submit}>
      <StepShell onBack={onBack} onNext={() => submit()}>
        <Field
          label="What is your biggest daily challenge?"
          required
          htmlFor="biggestDailyChallenge"
          error={form.formState.errors.biggestDailyChallenge?.message}
        >
          <Select
            id="biggestDailyChallenge"
            placeholder="Choose…"
            invalid={Boolean(form.formState.errors.biggestDailyChallenge)}
            {...form.register("biggestDailyChallenge")}
          >
            {BIGGEST_DAILY_CHALLENGES.map((c) => (
              <option key={c} value={c}>
                {BIGGEST_DAILY_CHALLENGE_LABELS[c]}
              </option>
            ))}
          </Select>
        </Field>

        <ConditionalField show={challenge === "other"}>
          <Field
            label="Please describe the challenge"
            required
            htmlFor="biggestDailyChallengeOther"
            error={form.formState.errors.biggestDailyChallengeOther?.message}
          >
            <Input
              id="biggestDailyChallengeOther"
              invalid={Boolean(
                form.formState.errors.biggestDailyChallengeOther,
              )}
              {...form.register("biggestDailyChallengeOther")}
            />
          </Field>
        </ConditionalField>

        <Field
          label="How often does load shedding affect your work?"
          required
          htmlFor="loadSheddingFrequency"
          error={form.formState.errors.loadSheddingFrequency?.message}
        >
          <Select
            id="loadSheddingFrequency"
            placeholder="Choose…"
            invalid={Boolean(form.formState.errors.loadSheddingFrequency)}
            {...form.register("loadSheddingFrequency")}
          >
            {LOAD_SHEDDING_FREQUENCIES.map((f) => (
              <option key={f} value={f}>
                {LOAD_SHEDDING_FREQUENCY_LABELS[f]}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          label="Do you use refrigerant recovery equipment?"
          required
          htmlFor="refrigerantRecoveryEquipmentUse"
          error={
            form.formState.errors.refrigerantRecoveryEquipmentUse?.message
          }
        >
          <Select
            id="refrigerantRecoveryEquipmentUse"
            placeholder="Choose…"
            invalid={Boolean(
              form.formState.errors.refrigerantRecoveryEquipmentUse,
            )}
            {...form.register("refrigerantRecoveryEquipmentUse")}
          >
            {RECOVERY_EQUIPMENT_USE.map((r) => (
              <option key={r} value={r}>
                {RECOVERY_EQUIPMENT_USE_LABELS[r]}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          label="Do you have access to Personal Protective Equipment (PPE)?"
          required
          htmlFor="ppeAccess"
          error={form.formState.errors.ppeAccess?.message}
        >
          <Select
            id="ppeAccess"
            placeholder="Choose…"
            invalid={Boolean(form.formState.errors.ppeAccess)}
            {...form.register("ppeAccess")}
          >
            {PPE_ACCESS.map((p) => (
              <option key={p} value={p}>
                {PPE_ACCESS_LABELS[p]}
              </option>
            ))}
          </Select>
        </Field>

        <FieldGroup
          legend="What prevents Environment, Health, and Safety (EHS) compliance in your work?"
          required
          hint="Select all that apply."
          error={form.formState.errors.ehsComplianceBarriers?.message as string}
        >
          <Controller
            control={form.control}
            name="ehsComplianceBarriers"
            render={({ field }) => (
              <div className="flex flex-col gap-2">
                {EHS_BARRIERS.map((b) => {
                  const checked = field.value?.includes(b) ?? false;
                  return (
                    <label
                      key={b}
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
                          if (e.target.checked) next.add(b);
                          else next.delete(b);
                          field.onChange(Array.from(next));
                        }}
                      />
                      <span className="text-sm">{EHS_BARRIER_LABELS[b]}</span>
                    </label>
                  );
                })}
              </div>
            )}
          />
        </FieldGroup>

        <ConditionalField show={ehsBarriers.includes("other")}>
          <Field
            label="Please describe the other barrier"
            required
            htmlFor="ehsComplianceBarriersOther"
            error={
              form.formState.errors.ehsComplianceBarriersOther?.message
            }
          >
            <Textarea
              id="ehsComplianceBarriersOther"
              rows={3}
              invalid={Boolean(
                form.formState.errors.ehsComplianceBarriersOther,
              )}
              {...form.register("ehsComplianceBarriersOther")}
            />
          </Field>
        </ConditionalField>
      </StepShell>
    </form>
  );
}
