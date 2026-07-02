"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { StepShell } from "@/components/survey/StepShell";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import {
  BUSINESS_TYPES,
  BUSINESS_TYPE_LABELS,
  BUSINESS_SIZES,
  BUSINESS_SIZE_LABELS,
} from "@/lib/constants/retailers";
import { PROVINCES, PROVINCE_LABELS } from "@/lib/constants/provinces";
import {
  type RetailerBusinessStepValues,
  retailerBusinessStepSchema,
} from "@/lib/retailer-validation";

type Props = {
  defaultValues: Partial<RetailerBusinessStepValues>;
  onNext: (values: RetailerBusinessStepValues) => void;
  onBack?: () => void;
  isFirst?: boolean;
};

export function RetailerBusinessStep({
  defaultValues,
  onNext,
  onBack,
  isFirst,
}: Props) {
  const form = useForm<RetailerBusinessStepValues>({
    resolver: zodResolver(retailerBusinessStepSchema),
    defaultValues,
    mode: "onTouched",
  });

  const submit = form.handleSubmit((values) => onNext(values));

  return (
    <form noValidate onSubmit={submit}>
      <StepShell onBack={onBack} onNext={() => submit()} isFirst={isFirst}>
        <Field
          label="Business Name"
          required
          htmlFor="businessName"
          error={form.formState.errors.businessName?.message}
        >
          <Input
            id="businessName"
            autoComplete="organization"
            invalid={Boolean(form.formState.errors.businessName)}
            {...form.register("businessName")}
          />
        </Field>

        <Field
          label="Contact Person Name"
          required
          htmlFor="contactPersonName"
          error={form.formState.errors.contactPersonName?.message}
        >
          <Input
            id="contactPersonName"
            autoComplete="name"
            invalid={Boolean(form.formState.errors.contactPersonName)}
            {...form.register("contactPersonName")}
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            label="Business Type"
            required
            htmlFor="businessType"
            error={form.formState.errors.businessType?.message}
          >
            <Select
              id="businessType"
              placeholder="Choose…"
              invalid={Boolean(form.formState.errors.businessType)}
              {...form.register("businessType")}
            >
              {BUSINESS_TYPES.map((t) => (
                <option key={t} value={t}>
                  {BUSINESS_TYPE_LABELS[t]}
                </option>
              ))}
            </Select>
          </Field>

          <Field
            label="Business Size"
            required
            htmlFor="businessSize"
            error={form.formState.errors.businessSize?.message}
          >
            <Select
              id="businessSize"
              placeholder="Choose…"
              invalid={Boolean(form.formState.errors.businessSize)}
              {...form.register("businessSize")}
            >
              {BUSINESS_SIZES.map((s) => (
                <option key={s} value={s}>
                  {BUSINESS_SIZE_LABELS[s]}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <Field
          label="Years in Operation"
          required
          htmlFor="yearsInOperation"
          error={form.formState.errors.yearsInOperation?.message}
        >
          <Input
            id="yearsInOperation"
            type="number"
            min={0}
            max={100}
            invalid={Boolean(form.formState.errors.yearsInOperation)}
            {...form.register("yearsInOperation", { valueAsNumber: true })}
          />
        </Field>

        <Field
          label="Business Registration Number"
          htmlFor="businessRegistrationNumber"
          hint="Optional"
          error={form.formState.errors.businessRegistrationNumber?.message}
        >
          <Input
            id="businessRegistrationNumber"
            invalid={Boolean(form.formState.errors.businessRegistrationNumber)}
            {...form.register("businessRegistrationNumber")}
          />
        </Field>

        <Field
          label="Province"
          required
          htmlFor="province"
          error={form.formState.errors.province?.message}
        >
          <Select
            id="province"
            placeholder="Choose…"
            invalid={Boolean(form.formState.errors.province)}
            {...form.register("province")}
          >
            {PROVINCES.map((p) => (
              <option key={p} value={p}>
                {PROVINCE_LABELS[p]}
              </option>
            ))}
          </Select>
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            label="City / Town"
            required
            htmlFor="city"
            error={form.formState.errors.city?.message}
          >
            <Input
              id="city"
              invalid={Boolean(form.formState.errors.city)}
              {...form.register("city")}
            />
          </Field>
          <Field
            label="Suburb / Area"
            required
            htmlFor="suburb"
            error={form.formState.errors.suburb?.message}
          >
            <Input
              id="suburb"
              invalid={Boolean(form.formState.errors.suburb)}
              {...form.register("suburb")}
            />
          </Field>
        </div>

        <Field
          label="Phone Number"
          required
          htmlFor="phone"
          hint="Format: +263 followed by 9 digits (e.g. +263771234567)"
          error={form.formState.errors.phone?.message}
        >
          <Input
            id="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="+263"
            invalid={Boolean(form.formState.errors.phone)}
            {...form.register("phone")}
          />
        </Field>

        <Field
          label="Email Address"
          htmlFor="email"
          hint="Optional"
          error={form.formState.errors.email?.message}
        >
          <Input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            invalid={Boolean(form.formState.errors.email)}
            {...form.register("email")}
          />
        </Field>
      </StepShell>
    </form>
  );
}
