import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth-server";
import { listRegisteredTechniciansDirectory } from "@/lib/admin/technicians-directory-data";
import { Badge } from "@/components/admin/Badge";

export const dynamic = "force-dynamic";

export default async function RegistryPreviewPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const result = await listRegisteredTechniciansDirectory({ page: 1, pageSize: 50 });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Public Registry Preview</h1>
        <p className="mt-1 text-sm text-slate-500">
          This is exactly what the public sees — {result.total.toLocaleString()} verified technician{result.total !== 1 ? "s" : ""} who consented to public listing.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M8 1.5L1.5 5v6L8 14.5l6.5-3.5V5L8 1.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M8 1.5v7M1.5 5l6.5 3.5 6.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-900">RAC Technician Registry</p>
            <p className="text-xs text-slate-500">NOU · HEVACRAZ · Public Directory</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {result.rows.map((row) => (
            <div
              key={row.id}
              className="flex items-center gap-3 rounded-lg border border-slate-200 p-3"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                {row.firstName.charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-900">
                  {row.firstName} {row.surname}
                </p>
                <p className="text-xs text-slate-500">{row.province}</p>
              </div>
              {row.hasCertification === "yes" && (
                <Badge tone="success" className="ml-auto shrink-0 text-[10px]">Certified</Badge>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
