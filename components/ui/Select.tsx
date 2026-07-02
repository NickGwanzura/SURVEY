import { forwardRef } from "react";
import type { SelectHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  invalid?: boolean;
  placeholder?: string;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select({ invalid, className, children, placeholder, ...rest }, ref) {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            "block w-full min-h-[48px] appearance-none rounded-xl border bg-white px-3.5 py-2.5 pr-10",
            "text-slate-900",
            "transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-offset-1",
            invalid
              ? "border-red-400 focus:ring-red-400"
              : "border-slate-300 focus:border-brand-500 focus:ring-brand-500/30",
            "disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-200",
            className,
          )}
          {...rest}
        >
          {placeholder ? (
            <option value="" disabled>
              {placeholder}
            </option>
          ) : null}
          {children}
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>
    );
  },
);
