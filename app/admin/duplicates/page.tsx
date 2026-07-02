import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentAdmin } from "@/lib/auth-server";
import { findDuplicates } from "@/lib/admin/duplicates-data";
import { Badge } from "@/components/admin/Badge";
import { EmptyState } from "@/components/admin/EmptyState";

export const dynamic = "force-dynamic";

export default async function DuplicatesPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const groups = await findDuplicates();
  const totalDupes = groups.reduce((s, g) => s + g.count, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Duplicate Detection</h1>
        <p className="mt-1 text-sm text-slate-500">
          {groups.length} group{groups.length !== 1 ? "s" : ""} · {totalDupes} potential duplicate record{totalDupes !== 1 ? "s" : ""}
        </p>
      </div>

      {groups.length === 0 ? (
        <EmptyState
          title="No duplicates found"
          description="No potential duplicates detected across phone numbers, names, and locations."
        />
      ) : (
        <div className="space-y-4">
          {groups.map((g) => (
            <div key={g.key} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge tone={g.confidence === "high" ? "danger" : "warning"}>{g.confidence}</Badge>
                  <Badge tone="info">{g.matchType.replace(/_/g, " ")}</Badge>
                  <span className="text-sm font-semibold text-slate-900">{g.count} records</span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-xs font-medium text-slate-500">
                      <th className="pb-2 pr-4">Name</th>
                      <th className="pb-2 pr-4">Phone</th>
                      <th className="pb-2 pr-4">Province</th>
                      <th className="pb-2">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {g.ids.map((id, i) => (
                      <tr key={id} className="hover:bg-slate-50">
                        <td className="py-2 pr-4 font-medium text-slate-900">{g.names[i] ?? "—"}</td>
                        <td className="py-2 pr-4 text-slate-600">{g.phones[i] ?? "—"}</td>
                        <td className="py-2 pr-4 text-slate-600">{g.provinces[i] ?? "—"}</td>
                        <td className="py-2">
                          <Link href={`/admin/responses/${id}`} className="text-sm font-medium text-brand-600 hover:underline">
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
