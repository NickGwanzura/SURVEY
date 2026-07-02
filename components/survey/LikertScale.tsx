"use client";

import { useId } from "react";

import { cn } from "@/lib/cn";

type LikertScaleProps = {
  name: string;
  value: number | undefined;
  onChange: (value: number) => void;
  labels: [string, string, string, string, string];
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
        "flex flex-col gap-2",
        invalid && "rounded-xl ring-2 ring-red-400 ring-offset-2",
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
              "flex min-h-[52px] cursor-pointer items-center gap-4 rounded-xl border px-4 py-3 transition-colors",
              checked
                ? "border-brand-600 bg-brand-50 ring-1 ring-brand-600"
                : "border-slate-200 bg-white hover:border-brand-300 hover:bg-brand-50/50",
              disabled && "cursor-not-allowed opacity-50",
            )}
          >
            <span
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors",
                checked
                  ? "border-brand-600 bg-brand-600 text-white"
                  : "border-slate-300 text-slate-600",
              )}
              aria-hidden
            >
              {v}
            </span>
            <input
              id={optionId}
              type="radio"
              name={name}
              value={v}
              checked={checked}
              disabled={disabled}
              onChange={() => onChange(v)}
              className="sr-only"
            />
            <span className={cn("text-sm leading-snug", checked ? "font-medium text-brand-800" : "text-slate-700")}>
              {label}
            </span>
            {checked ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className="ml-auto shrink-0 text-brand-600">
                <path d="M3 8l3.5 3.5L13 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : null}
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
