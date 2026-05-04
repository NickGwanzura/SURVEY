"use client";

import { useEffect, useState } from "react";

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}

export function OfflineBanner() {
  const isOnline = useOnlineStatus();
  if (isOnline) return null;
  return (
    <div
      role="status"
      className="sticky top-0 z-30 flex items-center gap-2.5 border-b border-amber-300 bg-amber-50 px-4 py-2.5"
    >
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-400" aria-hidden>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M5 2v3M5 7v.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </span>
      <p className="text-sm font-medium text-amber-900">
        Offline — your answers are saved on this device and will sync when you reconnect.
      </p>
    </div>
  );
}
