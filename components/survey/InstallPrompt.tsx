"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";

const DISMISSED_KEY = "zw-rac-install-dismissed-v1";
const DISMISS_TTL_DAYS = 14;

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari
    (window.navigator as Navigator & { standalone?: boolean }).standalone ===
      true
  );
}

function wasRecentlyDismissed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = window.localStorage.getItem(DISMISSED_KEY);
    if (!raw) return false;
    const ts = Number(raw);
    if (!Number.isFinite(ts)) return false;
    return Date.now() - ts < DISMISS_TTL_DAYS * 24 * 3600 * 1000;
  } catch {
    return false;
  }
}

export function InstallPrompt() {
  const [evt, setEvt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isStandalone() || wasRecentlyDismissed()) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setEvt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    const onInstalled = () => setVisible(false);

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const dismiss = () => {
    setVisible(false);
    try {
      window.localStorage.setItem(DISMISSED_KEY, String(Date.now()));
    } catch {
      /* ignore */
    }
  };

  const install = async () => {
    if (!evt) return;
    await evt.prompt();
    const { outcome } = await evt.userChoice;
    if (outcome === "accepted") {
      setVisible(false);
    } else {
      dismiss();
    }
    setEvt(null);
  };

  if (!visible || !evt) return null;

  return (
    <div
      role="dialog"
      aria-label="Install RAC Registry app"
      className="fixed inset-x-0 bottom-0 z-40 px-4 pb-4 sm:bottom-4"
    >
      <div className="mx-auto flex max-w-md items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl ring-1 ring-slate-900/5 backdrop-blur">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700" aria-hidden>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M10 2.5v9M6.5 8l3.5 3.5L13.5 8"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M3 14v2a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900">
            Install for offline use
          </p>
          <p className="mt-0.5 text-xs leading-relaxed text-slate-600">
            Add the survey to your home screen to keep working without
            internet.
          </p>
          <div className="mt-3 flex gap-2">
            <Button size="sm" onClick={install}>
              Install
            </Button>
            <Button size="sm" variant="ghost" onClick={dismiss}>
              Not now
            </Button>
          </div>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss install prompt"
          className="-mr-1 -mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path d="M3.5 3.5l7 7M10.5 3.5l-7 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
