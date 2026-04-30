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
      <select
        ref={ref}
        className={cn(
          "block w-full min-h-[44px] rounded-lg border bg-white px-3 py-2",
          "text-slate-900",
          "focus:outline-2 focus:outline-offset-1",
          invalid
            ? "border-red-500 focus:outline-red-500"
            : "border-slate-300 focus:outline-brand-600",
          "disabled:bg-slate-100 disabled:text-slate-500",
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
    );
  },
);
