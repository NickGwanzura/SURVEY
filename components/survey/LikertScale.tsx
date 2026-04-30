"use client";

import { useId } from "react";

import { cn } from "@/lib/cn";

type LikertScaleProps = {
  name: string;
  value: number | undefined;
  onChange: (value: number) => void;
  labels: [string, string, string, string, string]; // 1..5
  invalid?: boolean;
  disabled?: boolean;
};

export function LikertScale({
  name,
  value,
  onChange,
  labels,
  invalid,
  disabled,
}: LikertScaleProps) {
  const groupId = useId();
  return (
    <div
      role="radiogroup"
      className={cn(
        "grid grid-cols-1 gap-2 sm:grid-cols-5",
        invalid && "ring-1 ring-red-300 rounded-lg p-1",
      )}
    >
      {labels.map((label, i) => {
        const v = i + 1;
        const checked = value === v;
        const optionId = `${groupId}-${v}`;
        return (
          <label
            key={v}
            htmlFor={optionId}
            className={cn(
              "flex min-h-[64px] cursor-pointer items-start gap-3 rounded-lg border p-3 sm:flex-col sm:items-center sm:justify-center sm:text-center",
              checked
                ? "border-brand-600 bg-brand-50 ring-2 ring-brand-600"
                : "border-slate-300 bg-white hover:border-brand-500",
              disabled && "opacity-50 cursor-not-allowed",
            )}
          >
            <input
              id={optionId}
              type="radio"
              name={name}
              value={v}
              checked={checked}
              disabled={disabled}
              onChange={() => onChange(v)}
              className="mt-0.5 h-5 w-5 shrink-0 accent-brand-600 sm:mt-0"
            />
            <span className="flex flex-col">
              <span
                className={cn(
                  "text-base font-semibold",
                  checked ? "text-brand-700" : "text-slate-900",
                )}
              >
                {v}
              </span>
              <span className="text-xs leading-snug text-slate-600">
                {label}
              </span>
            </span>
          </label>
        );
      })}
    </div>
  );
}

export const LIKERT_CONFIDENCE_LABELS: [
  string,
  string,
  string,
  string,
  string,
] = [
  "Not confident at all",
  "Slightly confident",
  "Moderately confident",
  "Confident",
  "Very confident",
];

export const LIKERT_ACCESS_LABELS: [string, string, string, string, string] = [
  "No access",
  "Very limited access",
  "Moderate access",
  "Good access",
  "Full access",
];

export const LIKERT_OBSTACLE_LABELS: [string, string, string, string, string] =
  [
    "Not an obstacle",
    "Minor obstacle",
    "Moderate obstacle",
    "Significant obstacle",
    "Severe obstacle",
  ];
