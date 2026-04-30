"use client";

import type { ReactNode } from "react";

import { SyncWatcher } from "@/components/survey/SyncWatcher";
import { ToastProvider } from "@/components/ui/Toast";

export function PublicProviders({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <SyncWatcher />
      {children}
    </ToastProvider>
  );
}
