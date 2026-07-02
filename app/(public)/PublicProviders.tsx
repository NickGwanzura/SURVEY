"use client";

import type { ReactNode } from "react";

import { InstallPrompt } from "@/components/survey/InstallPrompt";
import { SyncWatcher } from "@/components/survey/SyncWatcher";
import { ToastProvider } from "@/components/ui/Toast";

export function PublicProviders({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <SyncWatcher />
      {children}
      <InstallPrompt />
    </ToastProvider>
  );
}
