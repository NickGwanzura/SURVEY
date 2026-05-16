"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export function NotificationBell() {
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    firstName: string;
    surname: string;
    status: string;
    submittedAt: Date | string;
  }>>([]);
  const [lastCheck, setLastCheck] = useState(new Date().toISOString());

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch(`/api/admin/notifications?since=${encodeURIComponent(lastCheck)}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.submissions?.length > 0 && !cancelled) {
          setCount((c) => c + data.submissions.length);
          setNotifications((prev) => [...data.submissions.slice(0, 5), ...prev].slice(0, 10));
        }
        if (!cancelled) setLastCheck(data.since);
      } catch {
        // silent fail
      }
    }

    const id = setInterval(poll, 15000); // Poll every 15s
    poll(); // initial
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [lastCheck]);

  const clearCount = () => {
    setCount(0);
    setOpen((v) => !v);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={clearCount}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
        aria-label={`${count} new notifications`}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
          <path d="M9 2a5 5 0 0 1 5 5v2.5l2 2.5v1H2v-1l2-2.5V7a5 5 0 0 1 5-5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M6.5 14.5a2.5 2.5 0 0 0 5 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        {count > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-40 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Recent Activity</p>
            {notifications.length === 0 ? (
              <p className="py-4 text-center text-sm text-slate-400">No new activity</p>
            ) : (
              <div className="space-y-1">
                {notifications.map((n) => (
                  <Link
                    key={n.id}
                    href={`/admin/responses/${n.id}`}
                    className="flex items-center gap-2 rounded-lg p-2 text-sm hover:bg-slate-50"
                    onClick={() => setOpen(false)}
                  >
                    <span className={`h-2 w-2 shrink-0 rounded-full ${
                      n.status === "verified" ? "bg-emerald-500" :
                      n.status === "flagged" ? "bg-red-500" :
                      n.status === "duplicate" ? "bg-slate-400" :
                      "bg-amber-500"
                    }`} />
                    <span className="truncate text-slate-700">
                      {n.firstName} {n.surname}
                    </span>
                    <span className="ml-auto shrink-0 text-xs capitalize text-slate-400">{n.status}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
