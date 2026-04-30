import Link from "next/link";

import { StatusBadge } from "@/components/admin/Badge";
import { PROVINCE_LABELS } from "@/lib/constants/provinces";
import { MAIN_WORK_FOCUS_LABELS } from "@/lib/constants/workFocus";
import type { Province } from "@/lib/constants/provinces";
import type { MainWorkFocus } from "@/lib/constants/workFocus";
import type { SubmissionStatus } from "@/lib/constants/challenges";

type RecentRow = {
  id: string;
  firstName: string;
  surname: string;
  province: Province;
  mainWorkFocus: MainWorkFocus;
  status: SubmissionStatus;
  submittedAt: Date | string;
};

export function RecentTable({ rows }: { rows: RecentRow[] }) {
  if (rows.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-slate-500">
        No submissions yet.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
            <th className="pb-2 pr-4">Name</th>
            <th className="pb-2 pr-4">Province</th>
            <th className="pb-2 pr-4">Work Focus</th>
            <th className="pb-2 pr-4">Status</th>
            <th className="pb-2">Submitted</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((r) => (
            <tr key={r.id} className="hover:bg-slate-50">
              <td className="py-2.5 pr-4 font-medium text-slate-900">
                <Link
                  href={`/admin/responses/${r.id}`}
                  className="hover:underline"
                >
                  {r.firstName} {r.surname}
                </Link>
              </td>
              <td className="py-2.5 pr-4 text-slate-600">
                {PROVINCE_LABELS[r.province] ?? r.province}
              </td>
              <td className="py-2.5 pr-4 text-slate-600">
                {MAIN_WORK_FOCUS_LABELS[r.mainWorkFocus] ?? r.mainWorkFocus}
              </td>
              <td className="py-2.5 pr-4">
                <StatusBadge status={r.status} />
              </td>
              <td className="py-2.5 text-slate-500">
                {new Date(r.submittedAt).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
