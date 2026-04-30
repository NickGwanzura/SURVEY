"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef } from "react";
import { Controller, useForm } from "react-hook-form";

import { ConditionalField } from "@/components/survey/ConditionalField";
import { GpsCapture } from "@/components/survey/GpsCapture";
import { StepShell } from "@/components/survey/StepShell";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import {
  AGE_GROUPS,
  AGE_GROUP_LABELS,
  GENDERS,
  GENDER_LABELS,
  YEARS_EXPERIENCE,
  YEARS_EXPERIENCE_LABELS,
} from "@/lib/constants/ageGroups";
import {
  EDUCATION_LEVELS,
  EDUCATION_LEVEL_LABELS,
} from "@/lib/constants/educationLevels";
import { PROVINCES, PROVINCE_LABELS } from "@/lib/constants/provinces";
import {
  MAIN_WORK_FOCUS,
  MAIN_WORK_FOCUS_LABELS,
} from "@/lib/constants/workFocus";
import {
  type BackgroundStepValues,
  backgroundStepSchema,
} from "@/lib/validation";

type BackgroundStepProps = {
  defaultValues: Partial<BackgroundStepValues>;
  onNext: (values: BackgroundStepValues) => void;
  onBack?: () => void;
  isFirst?: boolean;
};

type DuplicateState = "idle" | "checking" | "duplicate" | "ok";

export function BackgroundStep({
  defaultValues,
  onNext,
  onBack,
  isFirst,
}: BackgroundStepProps) {
  const form = useForm<BackgroundStepValues>({
    resolver: zodResolver(backgroundStepSchema),
    defaultValues,
    mode: "onTouched",
  });

  const mainFocusRaw = form.watch("mainWorkFocus");
  const mainFocus: string[] = Array.isArray(mainFocusRaw)
    ? mainFocusRaw
    : typeof mainFocusRaw === "string" && mainFocusRaw
      ? [mainFocusRaw]
      : [];
  const phone = form.watch("phone");

  const duplicateState = useRef<DuplicateState>("idle");

  useEffect(() => {
    if (!phone || !/^\+263[0-9]{9}$/.test(phone)) {
      duplicateState.current = "idle";
      return;
    }
    duplicateState.current = "checking";
    const handle = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/survey/check-phone?phone=${encodeURIComponent(phone)}`,
        );
        if (!res.ok) {
          duplicateState.current = "idle";
          return;
        }
        const data = (await res.json()) as { exists: boolean };
        if (data.exists) {
          duplicateState.current = "duplicate";
          form.setError("phone", {
            type: "duplicate",
            message:
              "This phone number has already been submitted. If you believe this is an error, please contact support.",
          });
        } else {
          duplicateState.current = "ok";
          if (form.formState.errors.phone?.type === "duplicate") {
            form.clearErrors("phone");
          }
        }
      } catch {
        duplicateState.current = "idle";
      }
    }, 500);
    return () => clearTimeout(handle);
  }, [phone, form]);

  const submit = form.handleSubmit((values) => {
    if (duplicateState.current === "duplicate") return;
    onNext(values);
  });

  return (
    <form noValidate onSubmit={submit}>
      <StepShell
        onBack={onBack}
        onNext={() => submit()}
        isFirst={isFirst}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            label="First Name"
            required
            htmlFor="firstName"
            error={form.formState.errors.firstName?.message}
          >
            <Input
              id="firstName"
              autoComplete="given-name"
              invalid={Boolean(form.formState.errors.firstName)}
              {...form.register("firstName")}
            />
          </Field>
          <Field
            label="Surname"
            required
            htmlFor="surname"
            error={form.formState.errors.surname?.message}
          >
            <Input
              id="surname"
              autoComplete="family-name"
              invalid={Boolean(form.formState.errors.surname)}
              {...form.register("surname")}
            />
          </Field>
        </div>

        <Field
          label="Gender"
          required
          htmlFor="gender"
          error={form.formState.errors.gender?.message}
        >
          <Select
            id="gender"
            placeholder="Choose…"
            invalid={Boolean(form.formState.errors.gender)}
            {...form.register("gender")}
          >
            {GENDERS.map((g) => (
              <option key={g} value={g}>
                {GENDER_LABELS[g]}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          label="Age Group"
          required
          htmlFor="ageGroup"
          error={form.formState.errors.ageGroup?.message}
        >
          <Select
            id="ageGroup"
            placeholder="Choose…"
            invalid={Boolean(form.formState.errors.ageGroup)}
            {...form.register("ageGroup")}
          >
            {AGE_GROUPS.map((g) => (
              <option key={g} value={g}>
                {AGE_GROUP_LABELS[g]}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          label="Education Level"
          required
          htmlFor="educationLevel"
          error={form.formState.errors.educationLevel?.message}
        >
          <Select
            id="educationLevel"
            placeholder="Choose…"
            invalid={Boolean(form.formState.errors.educationLevel)}
            {...form.register("educationLevel")}
          >
            {EDUCATION_LEVELS.map((e) => (
              <option key={e} value={e}>
                {EDUCATION_LEVEL_LABELS[e]}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          label="Years of Experience"
          required
          htmlFor="yearsExperience"
          error={form.formState.errors.yearsExperience?.message}
        >
          <Select
            id="yearsExperience"
            placeholder="Choose…"
            invalid={Boolean(form.formState.errors.yearsExperience)}
            {...form.register("yearsExperience")}
          >
            {YEARS_EXPERIENCE.map((y) => (
              <option key={y} value={y}>
                {YEARS_EXPERIENCE_LABELS[y]}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          label="Main Work Focus"
          required
          hint="Select all that apply."
          error={form.formState.errors.mainWorkFocus?.message}
        >
          <Controller
            control={form.control}
            name="mainWorkFocus"
            render={({ field }) => {
              const raw = field.value;
              const selected: (typeof MAIN_WORK_FOCUS)[number][] = Array.isArray(
                raw,
              )
                ? raw
                : typeof raw === "string" && raw
                  ? [raw as (typeof MAIN_WORK_FOCUS)[number]]
                  : [];
              const toggle = (val: (typeof MAIN_WORK_FOCUS)[number]) => {
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
                  {MAIN_WORK_FOCUS.map((m) => {
                    const checked = selected.includes(m);
                    return (
                      <label
                        key={m}
                        className={`flex cursor-pointer items-start gap-2 rounded-lg border p-3 text-sm transition-colors ${
                          checked
                            ? "border-brand-600 bg-brand-50 text-slate-900"
                            : "border-slate-300 text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggle(m)}
                          onBlur={field.onBlur}
                          className="mt-0.5 accent-brand-600"
                        />
                        <span>{MAIN_WORK_FOCUS_LABELS[m]}</span>
                      </label>
                    );
                  })}
                </div>
              );
            }}
          />
        </Field>

        <ConditionalField show={mainFocus.includes("other")}>
          <Field
            label="Please describe your main work focus"
            required
            htmlFor="mainWorkFocusOther"
            error={form.formState.errors.mainWorkFocusOther?.message}
          >
            <Input
              id="mainWorkFocusOther"
              invalid={Boolean(form.formState.errors.mainWorkFocusOther)}
              {...form.register("mainWorkFocusOther")}
            />
          </Field>
        </ConditionalField>

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

        <Field label="GPS location">
          <Controller
            control={form.control}
            name="gpsLatitude"
            render={({ field: latField }) => (
              <Controller
                control={form.control}
                name="gpsLongitude"
                render={({ field: lngField }) => (
                  <Controller
                    control={form.control}
                    name="gpsAccuracyMeters"
                    render={({ field: accField }) => (
                      <GpsCapture
                        value={{
                          latitude: latField.value ?? null,
                          longitude: lngField.value ?? null,
                          accuracyMeters: accField.value ?? null,
                        }}
                        onChange={(next) => {
                          latField.onChange(next.latitude);
                          lngField.onChange(next.longitude);
                          accField.onChange(next.accuracyMeters);
                        }}
                      />
                    )}
                  />
                )}
              />
            )}
          />
        </Field>

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
