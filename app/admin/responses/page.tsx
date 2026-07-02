import type { Metadata } from "next";
import { Suspense } from "react";

import { FilterBar } from "@/components/admin/responses/FilterBar";
import { ResponsesTable } from "@/components/admin/responses/ResponsesTable";
import {
  listResponses,
  listResponsesParamsSchema,
} from "@/lib/admin/responses-data";

export const metadata: Metadata = {
  title: "Responses | Admin",
};

// Next 16: searchParams is a Promise
type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ResponsesPage({ searchParams }: PageProps) {
  const raw = await searchParams;

  // Flatten arrays to single strings (take first value)
  const flat: Record<string, string> = {};
  for (const [key, val] of Object.entries(raw)) {
    if (typeof val === "string") flat[key] = val;
    else if (Array.isArray(val) && val.length > 0) flat[key] = val[0]!;
  }

  const parsed = listResponsesParamsSchema.safeParse(flat);
  const params = parsed.success ? parsed.data : listResponsesParamsSchema.parse({});
  const result = await listResponses(params);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Responses</h1>
        <p className="mt-1 text-sm text-slate-500">
          {result.total.toLocaleString()} submission
          {result.total !== 1 ? "s" : ""} total
        </p>
      </div>

      {/* FilterBar is a client component that manages URL searchParams */}
      <Suspense>
        <FilterBar />
      </Suspense>

      <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-slate-100" />}>
        <ResponsesTable
          rows={result.rows}
          total={result.total}
          page={result.page}
          pageSize={result.pageSize}
        />
      </Suspense>
    </div>
  );
}
