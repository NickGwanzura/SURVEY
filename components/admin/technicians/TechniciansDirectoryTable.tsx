"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

import { Pagination } from "@/components/admin/Pagination";
import { EmptyState } from "@/components/admin/EmptyState";
import { Badge } from "@/components/admin/Badge";
import { PhotoModal } from "@/components/admin/responses/PhotoModal";
import type { TechniciansDirectoryRow } from "@/lib/admin/technicians-directory-data";
import { cn } from "@/lib/cn";

type Props = {
  rows: TechniciansDirectoryRow[];
  total: number;
  page: number;
  pageSize: number;
};

function maskPhone(phone: string): string {
  if (phone.length < 4) return "••••";
  const last4 = phone.slice(-4);
  return `•••• ${last4}`;
}

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
                <th className="w-14 px-4 py-3 text-center">Photo</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Surname</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Certification</th>
                <th className="px-4 py-3">Card number</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-center">
                    {row.profilePhotoUrl ? (
                      <PhotoModal src={row.profilePhotoUrl} alt={`${row.firstName} ${row.surname}`} size="sm" />
                    ) : (
                      <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-400">
                        {row.firstName.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {row.firstName}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {row.surname}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {row.email ?? "—"}
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-700 whitespace-nowrap">
                    {maskPhone(row.phone)}
                  </td>
                  <td className="px-4 py-3">
                    <CertificationBadge value={row.hasCertification} />
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-700 whitespace-nowrap">
                    {row.hevacrazMemberNumber ?? "—"}
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
