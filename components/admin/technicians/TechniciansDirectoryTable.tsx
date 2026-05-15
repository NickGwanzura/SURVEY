"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

import { Pagination } from "@/components/admin/Pagination";
import { EmptyState } from "@/components/admin/EmptyState";
import { Badge } from "@/components/admin/Badge";
import { PROVINCE_LABELS } from "@/lib/constants/provinces";
import type { Province } from "@/lib/constants/provinces";
import type { TechniciansDirectoryRow } from "@/lib/admin/technicians-directory-data";
import { cn } from "@/lib/cn";

type Props = {
  rows: TechniciansDirectoryRow[];
  total: number;
  page: number;
  pageSize: number;
};

function CertificationBadge({ value }: { value: string }) {
  if (value === "yes") {
    return (
      <Badge tone="success" className={cn("uppercase")}>
        Yes
      </Badge>
    );
  }

  if (value === "studying") {
    return (
      <Badge tone="info" className={cn("uppercase")}>
        Studying
      </Badge>
    );
  }

  return (
    <Badge tone="neutral" className={cn("uppercase")}>
      No
    </Badge>
  );
}

export function TechniciansDirectoryTable({ rows, total, page, pageSize }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handlePageChange(newPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.replace(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-3">
      {rows.length === 0 ? (
        <EmptyState
          title="No registered technicians found"
          description="Try adjusting your filters (or wait for new verified registrations)."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Province</th>
                <th className="px-4 py-3">Has certification</th>
                <th className="px-4 py-3">Submitted</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {row.firstName} {row.surname}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{PROVINCE_LABELS[row.province as Province] ?? row.province}</td>
                  <td className="px-4 py-3">
                    <CertificationBadge value={row.hasCertification} />
                  </td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                    {row.submittedAt
                      ? new Date(row.submittedAt).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "—"}
                  </td>
                </tr>
              ))}
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
