"use client";

import { createContext, useCallback, useContext, useState } from "react";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type ToastVariant = "success" | "error" | "info";

type Toast = {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
};

type ToastContextValue = {
  push: (t: Omit<Toast, "id">) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used inside <ToastProvider>");
  }
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((t: Omit<Toast, "id">) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { ...t, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== id));
    }, 5000);
  }, []);

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div
        className="pointer-events-none fixed top-3 left-1/2 z-50 flex w-[min(92vw,420px)] -translate-x-1/2 flex-col gap-2"
        aria-live="polite"
        aria-atomic="true"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto rounded-lg border px-4 py-3 shadow-lg",
              t.variant === "success" &&
                "border-emerald-200 bg-emerald-50 text-emerald-900",
              t.variant === "error" &&
                "border-red-200 bg-red-50 text-red-900",
              t.variant === "info" &&
                "border-slate-200 bg-white text-slate-900",
            )}
          >
            <p className="text-sm font-semibold">{t.title}</p>
            {t.description ? (
              <p className="mt-0.5 text-sm">{t.description}</p>
            ) : null}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
