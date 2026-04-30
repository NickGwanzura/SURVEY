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
      className="sticky top-0 z-30 border-b border-amber-300 bg-amber-50 px-4 py-2 text-center text-sm font-medium text-amber-900"
    >
      Offline mode — your response will sync automatically when you reconnect.
    </div>
  );
}
