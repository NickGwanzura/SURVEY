"use client";

import { useState, useEffect, useCallback, useRef, Fragment } from "react";

type SystemEventRow = {
  id: string;
  actorName: string | null;
  actorEmail: string | null;
  eventType: string;
  description: string;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: string;
};

type FilterState = {
  eventType: string;
  search: string;
  dateFrom: string;
  dateTo: string;
};

const EVENT_TYPE_LABELS: Record<string, string> = {
  "admin.login": "Admin Login",
  "admin.logout": "Admin Logout",
  "admin.invite_sent": "Invite Sent",
  "admin.password_reset": "Password Reset Requested",
  "admin.password_changed": "Password Changed",
  "survey.verified": "Survey Verified",
  "survey.flagged": "Survey Flagged",
  "survey.deleted": "Survey Deleted",
  "export.created": "Export Created",
  "messaging.sent": "Message Sent",
  "report.analyzed": "Report Analyzed",
};

export function AuditLogTable() {
  const [events, setEvents] = useState<SystemEventRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    eventType: "",
    search: "",
    dateFrom: "",
    dateTo: "",
  });

  const pageSize = 30;
  const pollingRef = useRef(false);
  const pageRef = useRef(page);
  const filtersRef = useRef(filters);

  // Keep refs in sync with state so polling closure always reads current values
  useEffect(() => { pageRef.current = page; }, [page]);
  useEffect(() => { filtersRef.current = filters; }, [filters]);

  const fetchEvents = useCallback(async (silent = false) => {
    // Prevent concurrent in-flight requests
    if (pollingRef.current) return;
    pollingRef.current = true;

    if (!silent) {
      setLoading(true);
      setExpandedId(null);
    }

    // Always read the latest page/filters via refs (critical for polling)
    const currentPage = silent ? pageRef.current : page;
    const currentFilters = silent ? filtersRef.current : filters;

    try {
      const params = new URLSearchParams();
      params.set("page", String(currentPage));
      params.set("pageSize", String(pageSize));
      if (currentFilters.eventType) params.set("eventType", currentFilters.eventType);
      if (currentFilters.search) params.set("search", currentFilters.search);
      if (currentFilters.dateFrom) params.set("dateFrom", currentFilters.dateFrom);
      if (currentFilters.dateTo) params.set("dateTo", currentFilters.dateTo);

      const res = await fetch(`/api/admin/system-events?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        if (!silent || json.rows) {
          setEvents(json.rows ?? []);
          setTotal(json.total ?? 0);
        }
      }
    } catch {
      // Silently fail
    } finally {
      pollingRef.current = false;
      if (!silent) setLoading(false);
    }
  }, [page, filters]);

  // Initial fetch on mount
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Auto-poll every 30s
  useEffect(() => {
    const interval = setInterval(() => {
      fetchEvents(true);
    }, 30_000);
    return () => clearInterval(interval);
  }, [fetchEvents]);

  const totalPages = Math.ceil(total / pageSize);

  function handleFilterChange(key: keyof FilterState, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  }

  function toggleExpand(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Event type</label>
          <select
            value={filters.eventType}
            onChange={(e) => handleFilterChange("eventType", e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-2 focus:outline-brand-600"
          >
            <option value="">All events</option>
            {Object.entries(EVENT_TYPE_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Search</label>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            placeholder="Search description..."
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm w-48 focus:outline-2 focus:outline-brand-600"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">From</label>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-2 focus:outline-brand-600"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">To</label>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => handleFilterChange("dateTo", e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-2 focus:outline-brand-600"
          />
        </div>
        <button
          type="button"
          onClick={() => {
            setFilters({ eventType: "", search: "", dateFrom: "", dateTo: "" });
            setPage(1);
          }}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
        >
          Clear
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm card-hover">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
              <th className="w-8 px-4 py-3" />
              <th className="whitespace-nowrap px-4 py-3">Time</th>
              <th className="whitespace-nowrap px-4 py-3">Event</th>
              <th className="whitespace-nowrap px-4 py-3">Actor</th>
              <th className="px-4 py-3">Description</th>
              <th className="whitespace-nowrap px-4 py-3">IP Address</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                  Loading events...
                </td>
              </tr>
            ) : events.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                  No events found
                </td>
              </tr>
            ) : (
              events.map((event) => (
                <Fragment key={event.id}>
                  <tr
                    className="cursor-pointer hover:bg-slate-50"
                    onClick={() => toggleExpand(event.id)}
                  >
                    <td className="px-4 py-3 text-slate-400">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        aria-hidden
                        className={`transition-transform duration-150 ${expandedId === event.id ? "rotate-90" : ""}`}
                      >
                        <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                      {new Date(event.createdAt).toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                        {EVENT_TYPE_LABELS[event.eventType] ?? event.eventType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {event.actorName ? (
                        <span>
                          {event.actorName}
                          <span className="text-slate-400"> ({event.actorEmail})</span>
                        </span>
                      ) : (
                        <span className="text-slate-400">System</span>
                      )}
                    </td>
                    <td className="max-w-xs truncate px-4 py-3 text-slate-600">
                      {event.description}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-400">
                      {event.ipAddress ?? "—"}
                    </td>
                  </tr>
                  {expandedId === event.id && event.metadata && Object.keys(event.metadata).length > 0 && (
                    <tr className="bg-slate-50/80">
                      <td colSpan={6} className="px-4 py-4">
                        <div className="animate-in rounded-lg border border-slate-200 bg-white p-4">
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Event Metadata
                          </p>
                          <pre className="overflow-x-auto text-xs leading-relaxed text-slate-700">
                            {JSON.stringify(event.metadata, null, 2)}
                          </pre>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-slate-500">
          <span>
            Page {page} of {totalPages} ({total.toLocaleString()} events)
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm disabled:opacity-40 hover:bg-slate-50"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm disabled:opacity-40 hover:bg-slate-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
