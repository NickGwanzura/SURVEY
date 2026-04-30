import { desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";

import { getCurrentAdmin } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { adminUsers, exportLog } from "@/lib/schema";
import { ExportPanel } from "@/components/admin/export/ExportPanel";

export default async function ExportPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  // Last 20 export log entries with actor name
  const recentExports = await db
    .select({
      id: exportLog.id,
      format: exportLog.format,
      rowCount: exportLog.rowCount,
      anonymised: exportLog.anonymised,
      createdAt: exportLog.createdAt,
      actorName: adminUsers.name,
    })
    .from(exportLog)
    .innerJoin(adminUsers, eq(exportLog.actorAdminUserId, adminUsers.id))
    .orderBy(desc(exportLog.createdAt))
    .limit(20);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Export Data</h1>
        <p className="mt-1 text-sm text-slate-500">
          Download technician survey data in your preferred format.
        </p>
      </div>

      <ExportPanel />

      {/* Recent exports */}
      {recentExports.length > 0 && (
        <section className="mt-8 rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-sm font-semibold text-slate-900">Recent exports</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500">
                <tr>
                  <th className="px-4 py-2.5 text-left font-medium">Format</th>
                  <th className="px-4 py-2.5 text-right font-medium">Rows</th>
                  <th className="px-4 py-2.5 text-center font-medium">Anonymised</th>
                  <th className="px-4 py-2.5 text-left font-medium">By</th>
                  <th className="px-4 py-2.5 text-left font-medium">When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentExports.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50">
                    <td className="px-4 py-2.5">
                      <span className="inline-flex items-center rounded-md border border-slate-200 px-2 py-0.5 text-xs font-medium uppercase text-slate-600">
                        {entry.format}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-slate-700">
                      {entry.rowCount.toLocaleString()}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      {entry.anonymised ? (
                        <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                          Yes
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">No</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-slate-700">{entry.actorName}</td>
                    <td className="px-4 py-2.5 text-slate-500">
                      {entry.createdAt
                        ? new Date(entry.createdAt).toLocaleString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {recentExports.length === 0 && (
        <div className="mt-8 rounded-xl border border-slate-200 bg-white px-5 py-10 text-center">
          <p className="text-sm text-slate-500">No exports yet. Download your first export above.</p>
        </div>
      )}
    </div>
  );
}
