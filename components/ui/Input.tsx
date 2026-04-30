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
        "block w-full min-h-[44px] rounded-lg border bg-white px-3 py-2",
        "text-slate-900 placeholder:text-slate-400",
        "focus:outline-2 focus:outline-offset-1",
        invalid
          ? "border-red-500 focus:outline-red-500"
          : "border-slate-300 focus:outline-brand-600",
        "disabled:bg-slate-100 disabled:text-slate-500",
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
          "block w-full rounded-lg border bg-white px-3 py-2",
          "text-slate-900 placeholder:text-slate-400 min-h-[88px]",
          "focus:outline-2 focus:outline-offset-1",
          invalid
            ? "border-red-500 focus:outline-red-500"
            : "border-slate-300 focus:outline-brand-600",
          "disabled:bg-slate-100 disabled:text-slate-500",
          className,
        )}
        {...rest}
      />
    );
  },
);
