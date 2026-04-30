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
        className="text-sm font-medium text-slate-800"
      >
        {label}
        {required ? (
          <span className="ml-1 text-red-600" aria-hidden>
            *
          </span>
        ) : null}
      </label>
      {hint ? <p className="text-xs text-slate-500">{hint}</p> : null}
      {children}
      {error ? (
        <p
          className="text-xs text-red-600"
          role="alert"
          aria-live="polite"
        >
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
      <legend className="text-sm font-medium text-slate-800">
        {legend}
        {required ? (
          <span className="ml-1 text-red-600" aria-hidden>
            *
          </span>
        ) : null}
      </legend>
      {hint ? <p className="text-xs text-slate-500">{hint}</p> : null}
      {children}
      {error ? (
        <p
          className="text-xs text-red-600"
          role="alert"
          aria-live="polite"
        >
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
