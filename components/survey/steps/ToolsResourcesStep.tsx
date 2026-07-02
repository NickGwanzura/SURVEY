"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import {
  LIKERT_OBSTACLE_LABELS,
  LikertScale,
} from "@/components/survey/LikertScale";
import { StepShell } from "@/components/survey/StepShell";
import { Field, FieldGroup } from "@/components/ui/Field";
import { Textarea } from "@/components/ui/Input";
import {
  type ToolsResourcesStepValues,
  toolsResourcesStepSchema,
} from "@/lib/validation";

type Props = {
  defaultValues: Partial<ToolsResourcesStepValues>;
  onNext: (values: ToolsResourcesStepValues) => void;
  onBack?: () => void;
};

const OBSTACLE_FIELDS = [
  {
    name: "obstacleHighImportCosts" as const,
    legend: "High import costs",
  },
  {
    name: "obstacleForexShortages" as const,
    legend: "Forex shortages",
  },
  {
    name: "obstacleUnreliableSuppliers" as const,
    legend: "Unreliable suppliers",
  },
  {
    name: "obstacleCounterfeitProducts" as const,
    legend: "Counterfeit products",
  },
];

export function ToolsResourcesStep({ defaultValues, onNext, onBack }: Props) {
  const form = useForm<ToolsResourcesStepValues>({
    resolver: zodResolver(toolsResourcesStepSchema),
    defaultValues,
    mode: "onTouched",
  });

  const submit = form.handleSubmit((values) => onNext(values));

  return (
    <form noValidate onSubmit={submit}>
      <StepShell onBack={onBack} onNext={() => submit()}>
        <p className="rounded-md border border-slate-200 bg-white p-3 text-sm text-slate-700">
          For each obstacle, choose how significant it is in your daily work.
        </p>

        {OBSTACLE_FIELDS.map((f) => (
          <FieldGroup
            key={f.name}
            legend={f.legend}
            required
            error={form.formState.errors[f.name]?.message}
          >
            <Controller
              control={form.control}
              name={f.name}
              render={({ field }) => (
                <LikertScale
                  name={f.name}
                  value={field.value}
                  onChange={field.onChange}
                  labels={LIKERT_OBSTACLE_LABELS}
                  invalid={Boolean(form.formState.errors[f.name])}
                />
              )}
            />
          </FieldGroup>
        ))}

        <Field
          label="Other significant obstacles you face"
          htmlFor="obstaclesOther"
          hint="Tell us about any other major challenges with tools, resources, or supplies."
          error={form.formState.errors.obstaclesOther?.message}
        >
          <Textarea
            id="obstaclesOther"
            rows={4}
            invalid={Boolean(form.formState.errors.obstaclesOther)}
            {...form.register("obstaclesOther")}
          />
        </Field>
      </StepShell>
    </form>
  );
}
