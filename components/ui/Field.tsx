import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type FieldProps = {
  label: string;
  htmlFor?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
  className?: string;
};

export function Field({
  label,
  htmlFor,
  required,
  hint,
  error,
  children,
  className,
}: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label
        htmlFor={htmlFor}
        className="flex items-center gap-1 text-sm font-semibold text-slate-800"
      >
        {label}
        {required ? (
          <span className="text-red-500" aria-hidden>
            *
          </span>
        ) : null}
        {!required ? (
          <span className="ml-0.5 text-xs font-normal text-slate-400">(optional)</span>
        ) : null}
      </label>
      {hint ? (
        <p className="text-xs leading-snug text-slate-500">{hint}</p>
      ) : null}
      {children}
      {error ? (
        <p
          className="flex items-center gap-1.5 text-xs font-medium text-red-600"
          role="alert"
          aria-live="polite"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
            <circle cx="6" cy="6" r="5.5" stroke="currentColor" />
            <path d="M6 3.5v3M6 8v.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          {error}
        </p>
      ) : null}
    </div>
  );
}

type FieldsetProps = {
  legend: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
  className?: string;
};

export function FieldGroup({
  legend,
  required,
  hint,
  error,
  children,
  className,
}: FieldsetProps) {
  return (
    <fieldset className={cn("flex flex-col gap-2", className)}>
      <legend className="flex items-center gap-1 text-sm font-semibold text-slate-800">
        {legend}
        {required ? (
          <span className="text-red-500" aria-hidden>
            *
          </span>
        ) : null}
      </legend>
      {hint ? (
        <p className="text-xs leading-snug text-slate-500">{hint}</p>
      ) : null}
      {children}
      {error ? (
        <p
          className="flex items-center gap-1.5 text-xs font-medium text-red-600"
          role="alert"
          aria-live="polite"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
            <circle cx="6" cy="6" r="5.5" stroke="currentColor" />
            <path d="M6 3.5v3M6 8v.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
