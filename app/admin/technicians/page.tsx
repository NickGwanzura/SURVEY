import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";

import Link from "next/link";

import { getCurrentAdmin } from "@/lib/auth-server";
import { listRegisteredTechniciansDirectory, listTechniciansDirectoryParamsSchema } from "@/lib/admin/technicians-directory-data";
import type { ListTechniciansDirectoryParams } from "@/lib/admin/technicians-directory-data";
import { TechniciansDirectoryTable } from "@/components/admin/technicians/TechniciansDirectoryTable";
import { TechniciansDirectoryFilterBar } from "@/components/admin/technicians/TechniciansDirectoryFilterBar";
import { Button } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Technicians | Admin",
};

// Next 16: searchParams is a Promise
type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function TechniciansDirectoryPage({ searchParams }: PageProps) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const raw = await searchParams;

  // Flatten arrays to single strings (take first value)
  const flat: Record<string, string> = {};
  for (const [key, val] of Object.entries(raw)) {
    if (typeof val === "string") flat[key] = val;
    else if (Array.isArray(val) && val.length > 0) flat[key] = val[0]!;
  }

  const parsed = listTechniciansDirectoryParamsSchema.safeParse(flat);
  const params: ListTechniciansDirectoryParams = parsed.success
    ? parsed.data
    : listTechniciansDirectoryParamsSchema.parse({});

  const result = await listRegisteredTechniciansDirectory(params);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Technicians directory</h1>
          <p className="mt-1 text-sm text-slate-500">
            {result.total.toLocaleString()} verified technician{result.total === 1 ? "" : "s"} who consented to the public registry.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/api/admin/technicians/export" aria-label="Export registered technicians as CSV">
            <Button type="button" variant="secondary" size="lg">
              Export CSV
            </Button>
          </Link>
        </div>
      </div>

      {/* TechniciansDirectoryFilterBar is a client component that manages URL searchParams */}
      <Suspense>
        <TechniciansDirectoryFilterBar />
      </Suspense>

      <TechniciansDirectoryTable
        rows={result.rows}
        total={result.total}
        page={result.page}
        pageSize={result.pageSize}
      />
    </div>
  );
}
