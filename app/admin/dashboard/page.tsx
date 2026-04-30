import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentAdmin } from "@/lib/auth-server";
import { getStatsData } from "@/lib/admin/stats-data";
import { StatsGrid } from "@/components/admin/dashboard/StatsGrid";
import { ChartsSection } from "@/components/admin/dashboard/ChartsSection";
import { RecentTable } from "@/components/admin/dashboard/RecentTable";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const stats = await getStatsData();

  const lastLogin = admin.user.lastLoginAt
    ? new Date(admin.user.lastLoginAt).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Welcome, {admin.user.name}
          </h1>
          {lastLogin ? (
            <p className="mt-0.5 text-sm text-slate-500">
              Last sign-in: {lastLogin}
            </p>
          ) : null}
        </div>
        <Link
          href="/admin/insights"
          className="inline-flex items-center gap-1.5 rounded-lg border border-brand-200 bg-brand-50 px-4 py-2 text-sm font-medium text-brand-700 hover:bg-brand-100 transition-colors"
        >
          View Insights
        </Link>
      </div>

      {/* Stats cards */}
      <StatsGrid cards={stats.cards} />

      {/* Charts */}
      <ChartsSection
        byProvince={stats.byProvince}
        byWorkFocus={stats.byWorkFocus}
        byCertification={stats.byCertification}
        submissionsByDay={stats.submissionsByDay}
      />

      {/* Recent submissions */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">
            Recent Submissions
          </h2>
          <Link
            href="/admin/responses"
            className="text-sm font-medium text-brand-600 hover:underline"
          >
            View all
          </Link>
        </div>
        <RecentTable rows={stats.recent} />
      </section>
    </div>
  );
}
