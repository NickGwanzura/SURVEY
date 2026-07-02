"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { ConditionalField } from "@/components/survey/ConditionalField";
import { StepShell } from "@/components/survey/StepShell";
import { Field, FieldGroup } from "@/components/ui/Field";
import { Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import {
  ENERGY_EFFICIENT_BARRIERS,
  ENERGY_EFFICIENT_BARRIER_LABELS,
  ENERGY_EFFICIENT_INSTALL,
  ENERGY_EFFICIENT_INSTALL_LABELS,
} from "@/lib/constants/challenges";
import {
  type EnergyEfficiencyStepValues,
  energyEfficiencyStepSchema,
} from "@/lib/validation";

type Props = {
  defaultValues: Partial<EnergyEfficiencyStepValues>;
  onNext: (values: EnergyEfficiencyStepValues) => void;
  onBack?: () => void;
};

export function EnergyEfficiencyStep({ defaultValues, onNext, onBack }: Props) {
  const form = useForm<EnergyEfficiencyStepValues>({
    resolver: zodResolver(energyEfficiencyStepSchema),
    defaultValues: {
      energyEfficientBarriers: [],
      ...defaultValues,
    },
    mode: "onTouched",
  });

  const installs = form.watch("installsEnergyEfficient");
  const barriers = form.watch("energyEfficientBarriers") ?? [];

  const submit = form.handleSubmit((values) => onNext(values));

  return (
    <form noValidate onSubmit={submit}>
      <StepShell onBack={onBack} onNext={() => submit()}>
        <Field
          label="Do you install or recommend energy-efficient systems?"
          required
          htmlFor="installsEnergyEfficient"
          error={form.formState.errors.installsEnergyEfficient?.message}
        >
          <Select
            id="installsEnergyEfficient"
            placeholder="Choose…"
            invalid={Boolean(form.formState.errors.installsEnergyEfficient)}
            {...form.register("installsEnergyEfficient")}
          >
            {ENERGY_EFFICIENT_INSTALL.map((o) => (
              <option key={o} value={o}>
                {ENERGY_EFFICIENT_INSTALL_LABELS[o]}
              </option>
            ))}
          </Select>
        </Field>

        <ConditionalField show={installs && installs !== "always"}>
          <FieldGroup
            legend="If you do not always install or recommend energy-efficient systems, why not?"
            required
            hint="Select all that apply."
            error={form.formState.errors.energyEfficientBarriers?.message as string}
          >
            <Controller
              control={form.control}
              name="energyEfficientBarriers"
              render={({ field }) => (
                <div className="flex flex-col gap-2">
                  {ENERGY_EFFICIENT_BARRIERS.map((b) => {
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
                        <span className="text-sm">
                          {ENERGY_EFFICIENT_BARRIER_LABELS[b]}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            />
          </FieldGroup>

          {barriers.includes("other") ? (
            <Field
              label="Please describe the other reason"
              required
              htmlFor="energyEfficientBarriersOther"
              error={
                form.formState.errors.energyEfficientBarriersOther?.message
              }
              className="mt-3"
            >
              <Textarea
                id="energyEfficientBarriersOther"
                rows={3}
                invalid={Boolean(
                  form.formState.errors.energyEfficientBarriersOther,
                )}
                {...form.register("energyEfficientBarriersOther")}
              />
            </Field>
          ) : null}
        </ConditionalField>
      </StepShell>
    </form>
  );
}
