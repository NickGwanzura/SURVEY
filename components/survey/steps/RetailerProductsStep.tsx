"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { ConditionalField } from "@/components/survey/ConditionalField";
import { StepShell } from "@/components/survey/StepShell";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import {
  PRODUCT_CATEGORIES,
  PRODUCT_CATEGORY_LABELS,
  SOURCING_OPTIONS,
  SOURCING_OPTION_LABELS,
  CUSTOMER_TYPES,
  CUSTOMER_TYPE_LABELS,
  REFRIGERANT_AWARENESS,
  REFRIGERANT_AWARENESS_LABELS,
} from "@/lib/constants/retailers";
import {
  type RetailerProductsStepValues,
  retailerProductsStepSchema,
} from "@/lib/retailer-validation";

type Props = {
  defaultValues: Partial<RetailerProductsStepValues>;
  onNext: (values: RetailerProductsStepValues) => void;
  onBack?: () => void;
};

export function RetailerProductsStep({
  defaultValues,
  onNext,
  onBack,
}: Props) {
  const form = useForm<RetailerProductsStepValues>({
    resolver: zodResolver(retailerProductsStepSchema),
    defaultValues,
    mode: "onTouched",
  });

  const sourcingChannel = form.watch("sourcingChannel");

  const submit = form.handleSubmit((values) => onNext(values));

  return (
    <form noValidate onSubmit={submit}>
      <StepShell onBack={onBack} onNext={() => submit()}>
        <Field
          label="What do you supply?"
          required
          hint="Select all that apply."
          error={form.formState.errors.productCategories?.message}
        >
          <Controller
            control={form.control}
            name="productCategories"
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
                  {PRODUCT_CATEGORIES.map((cat) => {
                    const checked = selected.includes(cat);
                    return (
                      <label
                        key={cat}
                        className={`flex cursor-pointer items-start gap-2 rounded-lg border p-3 text-sm transition-colors ${
                          checked
                            ? "border-brand-600 bg-brand-50 text-slate-900"
                            : "border-slate-300 text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggle(cat)}
                          onBlur={field.onBlur}
                          className="mt-0.5 accent-brand-600"
                        />
                        <span>{PRODUCT_CATEGORY_LABELS[cat]}</span>
                      </label>
                    );
                  })}
                </div>
              );
            }}
          />
        </Field>

        <ConditionalField
          show={form.watch("productCategories")?.includes("other")}
        >
          <Field
            label="Please describe the product category"
            required
            htmlFor="productCategoriesOther"
            error={form.formState.errors.productCategoriesOther?.message}
          >
            <Input
              id="productCategoriesOther"
              invalid={Boolean(form.formState.errors.productCategoriesOther)}
              {...form.register("productCategoriesOther")}
            />
          </Field>
        </ConditionalField>

        <Field
          label="Where do you source your products?"
          required
          htmlFor="sourcingChannel"
          error={form.formState.errors.sourcingChannel?.message}
        >
          <Select
            id="sourcingChannel"
            placeholder="Choose…"
            invalid={Boolean(form.formState.errors.sourcingChannel)}
            {...form.register("sourcingChannel")}
          >
            {SOURCING_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {SOURCING_OPTION_LABELS[s]}
              </option>
            ))}
          </Select>
        </Field>

        <ConditionalField show={sourcingChannel === "mix"}>
          <Field
            label="Approximate % sourced locally"
            required
            htmlFor="localSourcingPercent"
            hint="0–100"
            error={form.formState.errors.localSourcingPercent?.message}
          >
            <Input
              id="localSourcingPercent"
              type="number"
              min={0}
              max={100}
              placeholder="e.g. 60"
              invalid={Boolean(form.formState.errors.localSourcingPercent)}
              {...form.register("localSourcingPercent", {
                valueAsNumber: true,
              })}
            />
          </Field>
        </ConditionalField>

        <Field
          label="Brands you carry"
          htmlFor="brandsCarried"
          hint="Optional — list main brands"
          error={form.formState.errors.brandsCarried?.message}
        >
          <Input
            id="brandsCarried"
            placeholder="e.g. Daikin, Hisense, Samsung"
            invalid={Boolean(form.formState.errors.brandsCarried)}
            {...form.register("brandsCarried")}
          />
        </Field>

        <Field
          label="Who are your main customers?"
          required
          hint="Select all that apply."
          error={form.formState.errors.customerTypes?.message}
        >
          <Controller
            control={form.control}
            name="customerTypes"
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
                  {CUSTOMER_TYPES.map((ct) => {
                    const checked = selected.includes(ct);
                    return (
                      <label
                        key={ct}
                        className={`flex cursor-pointer items-start gap-2 rounded-lg border p-3 text-sm transition-colors ${
                          checked
                            ? "border-brand-600 bg-brand-50 text-slate-900"
                            : "border-slate-300 text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggle(ct)}
                          onBlur={field.onBlur}
                          className="mt-0.5 accent-brand-600"
                        />
                        <span>{CUSTOMER_TYPE_LABELS[ct]}</span>
                      </label>
                    );
                  })}
                </div>
              );
            }}
          />
        </Field>

        <Field
          label="Awareness of low-GWP refrigerants"
          required
          htmlFor="refrigerantAwareness"
          error={form.formState.errors.refrigerantAwareness?.message}
        >
          <Select
            id="refrigerantAwareness"
            placeholder="Choose…"
            invalid={Boolean(form.formState.errors.refrigerantAwareness)}
            {...form.register("refrigerantAwareness")}
          >
            {REFRIGERANT_AWARENESS.map((r) => (
              <option key={r} value={r}>
                {REFRIGERANT_AWARENESS_LABELS[r]}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          label="Do you currently stock or sell low-GWP refrigerants?"
          required
          error={form.formState.errors.stocksLowGwp?.message}
        >
          <Controller
            control={form.control}
            name="stocksLowGwp"
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
      </StepShell>
    </form>
  );
}
