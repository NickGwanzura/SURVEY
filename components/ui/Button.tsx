import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "inverse";
type Size = "sm" | "md" | "lg" | "icon";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
};

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 disabled:bg-brand-600/50 shadow-sm",
  secondary:
    "bg-white text-slate-800 border border-slate-300 hover:bg-slate-50 active:bg-slate-100 disabled:opacity-50 shadow-sm",
  ghost:
    "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200 disabled:opacity-50",
  danger:
    "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 disabled:bg-red-600/50 shadow-sm",
  inverse:
    "bg-white text-brand-700 hover:bg-brand-50 active:bg-brand-100 disabled:opacity-60 shadow-sm focus-visible:outline-white",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-9 px-3 text-sm rounded-lg",
  md: "h-11 px-4 text-sm rounded-xl",
  lg: "h-12 px-6 text-base rounded-xl",
  icon: "h-9 w-9 rounded-lg",
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
          "inline-flex items-center justify-center gap-2 font-medium transition-colors",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600",
          "disabled:cursor-not-allowed",
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...rest}
      >
        {loading ? (
          <span
            className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent"
            aria-hidden
          />
        ) : null}
        {children}
      </button>
    );
  },
);
