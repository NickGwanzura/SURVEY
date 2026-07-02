"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { ConditionalField } from "@/components/survey/ConditionalField";
import { StepShell } from "@/components/survey/StepShell";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import {
  SUPPLY_CHALLENGES,
  SUPPLY_CHALLENGE_LABELS,
} from "@/lib/constants/retailers";
import {
  type RetailerChallengesStepValues,
  retailerChallengesStepSchema,
} from "@/lib/retailer-validation";

type Props = {
  defaultValues: Partial<RetailerChallengesStepValues>;
  onNext: (values: RetailerChallengesStepValues) => void;
  onBack?: () => void;
};

export function RetailerChallengesStep({
  defaultValues,
  onNext,
  onBack,
}: Props) {
  const form = useForm<RetailerChallengesStepValues>({
    resolver: zodResolver(retailerChallengesStepSchema),
    defaultValues,
    mode: "onTouched",
  });

  const submit = form.handleSubmit((values) => onNext(values));

  return (
    <form noValidate onSubmit={submit}>
      <StepShell onBack={onBack} onNext={() => submit()}>
        <Field
          label="What challenges do you face in your supply chain?"
          required
          hint="Select all that apply."
          error={form.formState.errors.supplyChallenges?.message}
        >
          <Controller
            control={form.control}
            name="supplyChallenges"
            render={({ field }) => {
              const raw = field.value;
              const selected: string[] = Array.isArray(raw) ? raw : [];
              const toggle = (val: string) => {
                const next = selected.includes(val)
                  ? selected.filter((v) => v !== val)
                  : [...selected, val];
                field.onChange(next);
              };
              return (
                <div
                  role="group"
                  className="grid grid-cols-1 gap-2 sm:grid-cols-2"
                >
                  {SUPPLY_CHALLENGES.map((ch) => {
                    const checked = selected.includes(ch);
                    return (
                      <label
                        key={ch}
                        className={`flex cursor-pointer items-start gap-2 rounded-lg border p-3 text-sm transition-colors ${
                          checked
                            ? "border-brand-600 bg-brand-50 text-slate-900"
                            : "border-slate-300 text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggle(ch)}
                          onBlur={field.onBlur}
                          className="mt-0.5 accent-brand-600"
                        />
                        <span>{SUPPLY_CHALLENGE_LABELS[ch]}</span>
                      </label>
                    );
                  })}
                </div>
              );
            }}
          />
        </Field>

        <ConditionalField
          show={form.watch("supplyChallenges")?.includes("other")}
        >
          <Field
            label="Please describe the challenge"
            required
            htmlFor="supplyChallengesOther"
            error={form.formState.errors.supplyChallengesOther?.message}
          >
            <Input
              id="supplyChallengesOther"
              invalid={Boolean(form.formState.errors.supplyChallengesOther)}
              {...form.register("supplyChallengesOther")}
            />
          </Field>
        </ConditionalField>

        <Field
          label="What is your biggest daily challenge?"
          required
          htmlFor="biggestDailyChallenge"
          error={form.formState.errors.biggestDailyChallenge?.message}
        >
          <Input
            id="biggestDailyChallenge"
            placeholder="Describe your biggest daily challenge…"
            invalid={Boolean(form.formState.errors.biggestDailyChallenge)}
            {...form.register("biggestDailyChallenge")}
          />
        </Field>

        <Field
          label="How much does load shedding impact your business?"
          required
          hint="1 = Very low, 5 = Very high"
          error={form.formState.errors.loadSheddingImpact?.message}
        >
          <Controller
            control={form.control}
            name="loadSheddingImpact"
            render={({ field }) => (
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => field.onChange(n)}
                    onBlur={field.onBlur}
                    className={`flex h-10 w-10 items-center justify-center rounded-lg border text-sm font-medium transition-colors ${
                      field.value === n
                        ? "border-brand-600 bg-brand-600 text-white"
                        : "border-slate-300 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            )}
          />
        </Field>

        <Field
          label="Level of competition in your area"
          required
          hint="1 = Very low, 5 = Very high"
          error={form.formState.errors.competitionLevel?.message}
        >
          <Controller
            control={form.control}
            name="competitionLevel"
            render={({ field }) => (
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => field.onChange(n)}
                    onBlur={field.onBlur}
                    className={`flex h-10 w-10 items-center justify-center rounded-lg border text-sm font-medium transition-colors ${
                      field.value === n
                        ? "border-brand-600 bg-brand-600 text-white"
                        : "border-slate-300 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            )}
          />
        </Field>

        <Field
          label="Price pressure from competitors / imports"
          required
          hint="1 = Very low, 5 = Very high"
          error={form.formState.errors.pricePressure?.message}
        >
          <Controller
            control={form.control}
            name="pricePressure"
            render={({ field }) => (
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => field.onChange(n)}
                    onBlur={field.onBlur}
                    className={`flex h-10 w-10 items-center justify-center rounded-lg border text-sm font-medium transition-colors ${
                      field.value === n
                        ? "border-brand-600 bg-brand-600 text-white"
                        : "border-slate-300 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            )}
          />
        </Field>

        <Field
          label="Are there regulatory barriers you face?"
          htmlFor="regulatoryBarriers"
          hint="Optional"
          error={form.formState.errors.regulatoryBarriers?.message}
        >
          <Input
            id="regulatoryBarriers"
            placeholder="e.g. import licences, standards compliance…"
            invalid={Boolean(form.formState.errors.regulatoryBarriers)}
            {...form.register("regulatoryBarriers")}
          />
        </Field>

        <Field
          label="Would you be interested in training on low-GWP refrigerants?"
          required
          error={form.formState.errors.interestedInTraining?.message}
        >
          <Controller
            control={form.control}
            name="interestedInTraining"
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

        <ConditionalField show={form.watch("interestedInTraining") === true}>
          <Field
            label="What topics would be most useful?"
            htmlFor="trainingTopics"
            hint="Optional"
            error={form.formState.errors.trainingTopics?.message}
          >
            <Input
              id="trainingTopics"
              placeholder="e.g. R-32 handling, leak detection, energy-efficient systems…"
              invalid={Boolean(form.formState.errors.trainingTopics)}
              {...form.register("trainingTopics")}
            />
          </Field>
        </ConditionalField>
      </StepShell>
    </form>
  );
}
