import type { Metadata } from "next";
import Link from "next/link";
import { and, count, desc, eq, ilike, or, type SQL } from "drizzle-orm";

import { db } from "@/lib/db";
import { techniciansSurvey } from "@/lib/schema";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Public Technician Registry — RAC Registry Zimbabwe",
  description: "Find verified RAC technicians who have chosen to be listed in Zimbabwe’s public registry.",
};

type SearchParams = Promise<{ q?: string; page?: string }>;

export default async function RegistryPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const search = (params.q ?? "").trim().slice(0, 80);
  const page = Math.max(1, Math.min(10_000, Number.parseInt(params.page ?? "1", 10) || 1));
  const pageSize = 24;
  const conditions: (SQL | undefined)[] = [
    eq(techniciansSurvey.status, "verified"),
    eq(techniciansSurvey.consentToPublicRegistry, true),
  ];
  if (search) {
    const pattern = `%${search.replace(/[\\%_]/g, "\\$&")}%`;
    conditions.push(or(
      ilike(techniciansSurvey.firstName, pattern),
      ilike(techniciansSurvey.surname, pattern),
      ilike(techniciansSurvey.province, pattern),
    ));
  }
  const where = and(...conditions);
  const [rows, [{ total }]] = await Promise.all([
    db.select({
      firstName: techniciansSurvey.firstName,
      surname: techniciansSurvey.surname,
      province: techniciansSurvey.province,
      hasCertification: techniciansSurvey.hasCertification,
    })
      .from(techniciansSurvey)
      .where(where)
      .orderBy(desc(techniciansSurvey.surname), desc(techniciansSurvey.firstName))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db.select({ total: count() }).from(techniciansSurvey).where(where),
  ]);
  const totalPages = Math.max(1, Math.ceil(Number(total) / pageSize));

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 sm:py-14">
      <section className="relative overflow-hidden rounded-3xl bg-brand-700 px-6 py-9 text-white shadow-sm sm:px-10 sm:py-12">
        <div className="pointer-events-none absolute -right-10 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" aria-hidden />
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-100">NOU · HEVACRAZ</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Public technician registry</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-brand-50 sm:text-base">
          Browse verified RAC technicians who explicitly agreed to appear in this public directory. Contact details and precise locations are kept private.
        </p>
      </section>

      <section aria-labelledby="registry-list-heading" className="flex flex-col gap-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2 id="registry-list-heading" className="text-xl font-semibold text-slate-900">Verified technicians</h2>
            <p className="mt-1 text-sm text-slate-500">{Number(total).toLocaleString()} public listing{Number(total) === 1 ? "" : "s"}</p>
          </div>
          <form action="/registry" className="flex w-full gap-2 sm:max-w-md">
            <label htmlFor="registry-search" className="sr-only">Search by name or province</label>
            <input id="registry-search" name="q" defaultValue={search} placeholder="Search by name or province" className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
            <button className="rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-800 focus:outline-none focus:ring-2 focus:ring-brand-300">Search</button>
          </form>
        </div>

        {rows.length ? (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map((row, index) => (
              <li key={`${row.firstName}-${row.surname}-${index}`} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <span aria-hidden className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-base font-semibold text-brand-700 ring-1 ring-brand-100">{row.firstName.charAt(0)}{row.surname.charAt(0)}</span>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-900">{row.firstName} {row.surname}</p>
                  <p className="mt-0.5 text-sm text-slate-500">{row.province}</p>
                  <p className="mt-2 text-xs font-medium text-emerald-700">{row.hasCertification === "yes" ? "Certification reported" : "Verified registry member"}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
            <p className="font-medium text-slate-800">No public listings found</p>
            <p className="mt-1 text-sm text-slate-500">Try another name or province.</p>
          </div>
        )}

        <nav aria-label="Registry pages" className="flex items-center justify-between border-t border-slate-200 pt-4 text-sm">
          <span className="text-slate-500">Page {Math.min(page, totalPages)} of {totalPages}</span>
          <div className="flex gap-2">
            {page > 1 && <Link href={{ pathname: "/registry", query: { ...(search ? { q: search } : {}), page: page - 1 } }} className="rounded-lg border border-slate-300 px-3 py-2 font-medium text-slate-700 hover:bg-slate-50">Previous</Link>}
            {page < totalPages && <Link href={{ pathname: "/registry", query: { ...(search ? { q: search } : {}), page: page + 1 } }} className="rounded-lg border border-slate-300 px-3 py-2 font-medium text-slate-700 hover:bg-slate-50">Next</Link>}
          </div>
        </nav>
      </section>
    </div>
  );
}
