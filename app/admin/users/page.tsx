import { redirect } from "next/navigation";

import { getCurrentAdmin } from "@/lib/auth-server";
import { listAdminUsers } from "@/lib/admin/admin-users-data";
import { Badge } from "@/components/admin/Badge";
import { EmptyState } from "@/components/admin/EmptyState";

export const dynamic = "force-dynamic";

function relativeTime(date: Date | string | null): string {
  if (!date) return "Never";
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
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

export default async function AdminUsersPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const users = await listAdminUsers();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Admin Users</h1>
        <p className="mt-1 text-sm text-slate-500">
          {users.length} account{users.length !== 1 ? "s" : ""} with portal access
        </p>
      </div>

      {users.length === 0 ? (
        <EmptyState
          title="No admin accounts"
          description="There are no registered admin users in the system."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                <th className="px-3 py-3 sm:px-4">Name</th>
                <th className="px-3 py-3 sm:px-4">Email</th>
                <th className="px-3 py-3 sm:px-4">Role</th>
                <th className="px-3 py-3 sm:px-4">Status</th>
                <th className="px-3 py-3 sm:px-4">Last Login</th>
                <th className="px-3 py-3 sm:px-4">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="px-3 py-3 font-medium text-slate-900 sm:px-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700 sm:h-8 sm:w-8">
                        {u.name.charAt(0).toUpperCase()}
                      </span>
                      <span className="truncate max-w-[120px] sm:max-w-none">
                        {u.name}
                      </span>
                      {u.id === admin.user.id && (
                        <Badge tone="brand" className="shrink-0 text-[10px]">You</Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-3 text-slate-600 sm:px-4">
                    <span className="block max-w-[140px] truncate sm:max-w-[200px]" title={u.email}>
                      {u.email}
                    </span>
                  </td>
                  <td className="px-3 py-3 sm:px-4">
                    <span className="capitalize text-slate-700">
                      {u.role.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-3 py-3 sm:px-4">
                    {u.isActive ? (
                      <Badge tone="success">Active</Badge>
                    ) : (
                      <Badge tone="neutral">Inactive</Badge>
                    )}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-slate-600 sm:px-4">
                    {u.lastLoginAt ? (
                      <span title={new Date(u.lastLoginAt).toLocaleString("en-GB")}>
                        {relativeTime(u.lastLoginAt)}
                      </span>
                    ) : (
                      <span className="text-slate-400">Never</span>
                    )}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-slate-500 sm:px-4">
                    {new Date(u.createdAt).toLocaleDateString("en-GB", {
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
      )}
    </div>
  );
}
