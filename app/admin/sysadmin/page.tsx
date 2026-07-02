import { Suspense } from "react";
import { redirect } from "next/navigation";

import { getCurrentAdmin } from "@/lib/auth-server";
import { SysadminOverviewPanel } from "@/components/admin/sysadmin/SysadminOverviewPanel";
import { AuditLogTable } from "@/components/admin/sysadmin/AuditLogTable";
import { Skeleton, SkeletonCard, SkeletonChart, SkeletonTable } from "@/components/ui/Skeleton";

export const dynamic = "force-dynamic";

const ALLOWED_EMAIL = process.env.SYSADMIN_EMAIL || "nicholas.gwanzura@outlook.com";

async function SysadminContent() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  // Only the designated sysadmin can access this page
  if (admin.user.email !== ALLOWED_EMAIL) {
    redirect("/admin/dashboard");
  }

  return (
    <div className="space-y-8 page-enter">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">
          System Administration
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900">
          Sysadmin Dashboard
        </h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Full system audit log — all events across the admin panel and survey pipeline.
        </p>
      </div>

      {/* Client-rendered overview panel with live polling */}
      <SysadminOverviewPanel adminRole={admin.user.role} />

      {/* Audit log */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">System Event Log</h2>
        <AuditLogTable />
      </div>
    </div>
  );
}

export default async function SysadminPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");
  if (admin.user.email !== ALLOWED_EMAIL) redirect("/admin/dashboard");

  return (
    <Suspense
      fallback={
        <div className="space-y-8">
          <div className="pb-6">
            <Skeleton className="mb-2 h-3 w-32" />
            <Skeleton className="mb-1 h-7 w-56" />
            <Skeleton className="h-4 w-80" />
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <SkeletonChart />
            <SkeletonChart />
          </div>
          <div>
            <Skeleton className="mb-4 h-5 w-40" />
            <SkeletonTable rows={6} cols={5} />
          </div>
        </div>
      }
    >
      <SysadminContent />
    </Suspense>
  );
}
