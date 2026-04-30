import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
};

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-brand-600 text-white hover:bg-brand-700 disabled:bg-brand-600/60 active:bg-brand-700",
  secondary:
    "bg-white text-slate-900 border border-slate-300 hover:bg-slate-50 disabled:opacity-60 active:bg-slate-100",
  ghost:
    "bg-transparent text-slate-700 hover:bg-slate-100 disabled:opacity-60 active:bg-slate-200",
  danger:
    "bg-red-600 text-white hover:bg-red-700 disabled:bg-red-600/60 active:bg-red-700",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-10 px-3 text-sm",
  md: "h-11 px-4 text-base",
  lg: "h-12 px-6 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { variant = "primary", size = "md", loading, disabled, className, children, ...rest },
    ref,
  ) {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600",
          "disabled:cursor-not-allowed",
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...rest}
      >
        {loading ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children}
      </button>
    );
  },
);
