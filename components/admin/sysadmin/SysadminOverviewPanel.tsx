"use client";

import { useState, useEffect, useRef } from "react";

import { EventTypePieChart } from "./EventTypePieChart";
import { EventsTimelineChart } from "./EventsTimelineChart";

type OverviewData = {
  total: number;
  last30Days: number;
  eventTypeCount: number;
  eventTypeDistribution: Array<{ eventType: string; count: number }>;
  eventsByDay: Array<{ date: string; count: number }>;
};

function formatTime(d: Date): string {
  return d.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function SysadminOverviewPanel({ adminRole }: { adminRole: string }) {
  const [data, setData] = useState<OverviewData | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const mountedRef = useRef(true);
  const loadingRef = useRef(false);

  const fetchOverview = async () => {
    // Skip if a fetch is already in-flight
    if (loadingRef.current) return;
    loadingRef.current = true;

    try {
      const res = await fetch("/api/admin/system-events?pageSize=1");
      if (!res.ok) return;
      const json = await res.json();
      if (!mountedRef.current) return;

      const last30 = (json.eventsByDay as Array<{ count: number }> | undefined) ?? [];
      const last30Count = last30.reduce((s: number, d: { count: number }) => s + d.count, 0);

      setData({
        total: json.total ?? 0,
        last30Days: last30Count,
        eventTypeCount: (json.eventTypeDistribution as unknown[] | undefined)?.length ?? 0,
        eventTypeDistribution: json.eventTypeDistribution ?? [],
        eventsByDay: json.eventsByDay ?? [],
      });
      setLastUpdated(new Date());
    } catch {
      // Silently ignore
    } finally {
      loadingRef.current = false;
    }
  };

  useEffect(() => {
    // Fetch immediately on mount
    fetchOverview();

    // Then poll every 30s
    const interval = setInterval(fetchOverview, 30_000);
    return () => {
      mountedRef.current = false;
      clearInterval(interval);
    };
  }, []);

  // Fallback to initial empty state while first fetch completes
  const totalEvents = data?.total ?? 0;
  const last30DaysCount = data?.last30Days ?? 0;
  const eventTypeCount = data?.eventTypeCount ?? 0;

  return (
    <>
      {/* Live indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </span>
          <span className="text-xs font-medium text-emerald-700">Live</span>
        </div>
        {lastUpdated && (
          <span className="text-xs tabular-nums text-slate-400">
            Updated {formatTime(lastUpdated)}
          </span>
        )}
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm card-hover">
          <div className="absolute left-0 top-0 h-full w-1 rounded-l-2xl bg-brand-400" aria-hidden />
          <div className="pl-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Total Events</p>
            <p className="mt-2 text-3xl font-bold tabular-nums leading-none text-slate-900">
              {totalEvents.toLocaleString()}
            </p>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm card-hover">
          <div className="absolute left-0 top-0 h-full w-1 rounded-l-2xl bg-emerald-400" aria-hidden />
          <div className="pl-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Last 30 Days</p>
            <p className="mt-2 text-3xl font-bold tabular-nums leading-none text-emerald-800">
              {last30DaysCount.toLocaleString()}
            </p>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm card-hover">
          <div className="absolute left-0 top-0 h-full w-1 rounded-l-2xl bg-violet-400" aria-hidden />
          <div className="pl-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Event Types</p>
            <p className="mt-2 text-3xl font-bold tabular-nums leading-none text-slate-900">
              {eventTypeCount}
            </p>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm card-hover">
          <div className="absolute left-0 top-0 h-full w-1 rounded-l-2xl bg-sky-400" aria-hidden />
          <div className="pl-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Your Role</p>
            <p className="mt-2 text-3xl font-bold tabular-nums leading-none capitalize text-slate-900">
              {adminRole.replace("_", " ")}
            </p>
          </div>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm card-hover">
          <h3 className="mb-1 text-sm font-semibold text-slate-700">Event Type Distribution</h3>
          <p className="mb-4 text-xs text-slate-400">Breakdown by system event category</p>
          <EventTypePieChart data={data?.eventTypeDistribution ?? []} />
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm card-hover">
          <h3 className="mb-1 text-sm font-semibold text-slate-700">Activity — Last 30 Days</h3>
          <p className="mb-4 text-xs text-slate-400">Daily system event count</p>
          <EventsTimelineChart data={data?.eventsByDay ?? []} />
        </div>
      </div>
    </>
  );
}
