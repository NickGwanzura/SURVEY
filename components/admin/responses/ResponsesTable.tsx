"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

import { Badge, StatusBadge } from "@/components/admin/Badge";
import { Pagination } from "@/components/admin/Pagination";
import { EmptyState } from "@/components/admin/EmptyState";
import { BulkActions } from "@/components/admin/responses/BulkActions";
import {
  PROVINCE_LABELS,
  MAIN_WORK_FOCUS_LABELS,
  YEARS_EXPERIENCE_LABELS,
} from "@/lib/admin/labels";
import type { Province } from "@/lib/constants/provinces";
import type { MainWorkFocus } from "@/lib/constants/workFocus";
import type { YearsExperience } from "@/lib/constants/ageGroups";
import type { SubmissionStatus } from "@/lib/constants/challenges";
import type { ResponseRow } from "@/lib/admin/responses-data";
import { cn } from "@/lib/cn";

function maskPhone(phone: string): string {
  if (phone.length < 4) return "••••";
  const last4 = phone.slice(-4);
  // Build the mask to the same total width
  const masked = phone.slice(0, -4).replace(/[+\d]/g, "•");
  return masked + last4;
}

function relativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const diff = Date.now() - d.getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function CertBadge({ value }: { value: string }) {
  if (value === "yes") return <Badge tone="success">Yes</Badge>;
  if (value === "studying") return <Badge tone="info">Studying</Badge>;
  return <Badge tone="neutral">No</Badge>;
}

type Props = {
  rows: ResponseRow[];
  total: number;
  page: number;
  pageSize: number;
};

export function ResponsesTable({ rows, total, page, pageSize }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const allSelected = rows.length > 0 && rows.every((r) => selectedIds.has(r.id));

  function toggleAll() {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(rows.map((r) => r.id)));
    }
  }

  function toggleRow(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handlePageChange(newPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.replace(`${pathname}?${params.toString()}`);
  }

  const selectedArray = Array.from(selectedIds);

  return (
    <div className="flex flex-col gap-3">
      <BulkActions
        selectedIds={selectedArray}
        onClearSelection={() => setSelectedIds(new Set())}
      />

      {rows.length === 0 ? (
        <EmptyState
          title="No responses found"
          description="Try adjusting the filters above to find what you're looking for."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    aria-label="Select all on this page"
                    className="rounded border-slate-300"
                  />
                </th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Province</th>
                <th className="px-4 py-3">District</th>
                <th className="px-4 py-3">Work focus</th>
                <th className="px-4 py-3">Experience</th>
                <th className="px-4 py-3">Cert.</th>
                <th className="px-4 py-3">Submitted</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row) => {
                const isSelected = selectedIds.has(row.id);
                return (
                  <tr
                    key={row.id}
                    className={cn(
                      "transition-colors",
                      isSelected ? "bg-brand-50" : "hover:bg-slate-50",
                    )}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleRow(row.id)}
                        aria-label={`Select ${row.firstName} ${row.surname}`}
                        className="rounded border-slate-300"
                      />
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {row.firstName} {row.surname}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-600">
                      {maskPhone(row.phone)}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {PROVINCE_LABELS[row.province as Province] ?? row.province}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{row.district}</td>
                    <td className="px-4 py-3 text-slate-700 max-w-[160px] truncate">
                      {MAIN_WORK_FOCUS_LABELS[row.mainWorkFocus as MainWorkFocus] ?? row.mainWorkFocus}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {YEARS_EXPERIENCE_LABELS[row.yearsExperience as YearsExperience] ?? row.yearsExperience}
                    </td>
                    <td className="px-4 py-3">
                      <CertBadge value={row.hasCertification} />
                    </td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                      <time
                        dateTime={
                          typeof row.submittedAt === "string"
                            ? row.submittedAt
                            : row.submittedAt.toISOString()
                        }
                        title={
                          typeof row.submittedAt === "string"
                            ? new Date(row.submittedAt).toLocaleString()
                            : row.submittedAt.toLocaleString()
                        }
                      >
                        {relativeTime(row.submittedAt)}
                      </time>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={row.status as SubmissionStatus} />
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/responses/${row.id}`}
                        className="rounded text-sm font-medium text-brand-600 hover:underline focus-visible:outline-2 focus-visible:outline-brand-600"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="border-t border-slate-100">
            <Pagination
              page={page}
              pageSize={pageSize}
              total={total}
              onChange={handlePageChange}
            />
          </div>
        </div>
      )}
    </div>
  );
}
