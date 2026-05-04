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
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">
            Dashboard
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">
            Welcome back, {admin.user.name.split(" ")[0]}
          </h1>
          {lastLogin ? (
            <p className="mt-0.5 text-sm text-slate-500">
              Last sign-in: {lastLogin}
            </p>
          ) : null}
        </div>
        <Link
          href="/admin/insights"
          className="inline-flex items-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-4 py-2.5 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-100"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M2 12l3-4 2.5 2 3-5 3 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M2 14h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          View Insights
        </Link>
      </div>

      <StatsGrid cards={stats.cards} />

      <ChartsSection
        byProvince={stats.byProvince}
        byWorkFocus={stats.byWorkFocus}
        byCertification={stats.byCertification}
        submissionsByDay={stats.submissionsByDay}
      />

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Recent Submissions
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">Last 10 registrations</p>
          </div>
          <Link
            href="/admin/responses"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:underline"
          >
            View all
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
        <div className="p-5">
          <RecentTable rows={stats.recent} />
        </div>
      </section>
    </div>
  );
}
