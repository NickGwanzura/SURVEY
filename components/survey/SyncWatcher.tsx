"use client";

import { useEffect, useRef } from "react";

import { useToast } from "@/components/ui/Toast";
import {
  flushQueuedSubmissions,
  listQueuedSubmissions,
} from "@/lib/offline-sync";

export function SyncWatcher() {
  const toast = useToast();
  const inFlight = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const tryFlush = async (origin: "load" | "online") => {
      if (cancelled || inFlight.current) return;
      inFlight.current = true;
      try {
        const queue = await listQueuedSubmissions().catch(() => []);
        if (queue.length === 0) return;
        const result = await flushQueuedSubmissions();
        if (cancelled) return;
        if (result.succeeded > 0) {
          toast.push({
            variant: "success",
            title: "Synced",
            description: `${result.succeeded} response${result.succeeded === 1 ? "" : "s"} sent to the server.`,
          });
        }
        if (result.failed > 0 && origin === "online") {
          toast.push({
            variant: "info",
            title: "Will retry later",
            description: `${result.failed} response${result.failed === 1 ? "" : "s"} could not sync yet.`,
          });
        }
      } finally {
        inFlight.current = false;
      }
    };

    const pingServiceWorker = () => {
      if (typeof navigator !== "undefined" && navigator.serviceWorker?.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: "FLUSH_SURVEY_QUEUE",
        });
      }
    };

    if (typeof navigator !== "undefined" && navigator.onLine) {
      tryFlush("load");
      pingServiceWorker();
    }

    const onOnline = () => {
      tryFlush("online");
      pingServiceWorker();
    };
    window.addEventListener("online", onOnline);
    return () => {
      cancelled = true;
      window.removeEventListener("online", onOnline);
    };
  }, [toast]);

  return null;
}
