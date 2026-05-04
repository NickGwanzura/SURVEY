import { forwardRef } from "react";
import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { invalid, className, ...rest },
  ref,
) {
  return (
    <input
      ref={ref}
      className={cn(
        "block w-full min-h-[48px] rounded-xl border bg-white px-3.5 py-2.5",
        "text-slate-900 placeholder:text-slate-400",
        "transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-offset-1",
        invalid
          ? "border-red-400 focus:ring-red-400"
          : "border-slate-300 focus:border-brand-500 focus:ring-brand-500/30",
        "disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-200",
        className,
      )}
      {...rest}
    />
  );
});

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  invalid?: boolean;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ invalid, className, ...rest }, ref) {
    return (
      <textarea
        ref={ref}
        className={cn(
          "block w-full rounded-xl border bg-white px-3.5 py-2.5",
          "text-slate-900 placeholder:text-slate-400 min-h-[96px]",
          "transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-offset-1",
          invalid
            ? "border-red-400 focus:ring-red-400"
            : "border-slate-300 focus:border-brand-500 focus:ring-brand-500/30",
          "disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-200",
          className,
        )}
        {...rest}
      />
    );
  },
);
