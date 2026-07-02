import { redirect } from "next/navigation";
import { desc, sql } from "drizzle-orm";

import { getCurrentAdmin } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { retailersSurvey, techniciansSurvey } from "@/lib/schema";

export const dynamic = "force-dynamic";

type CertificateRow = {
  id: string;
  name: string;
  registrationNumber: string | null;
  status: string;
  type: "technician" | "retailer";
  submittedAt: Date | string;
};

async function getCertificates(): Promise<{
  rows: CertificateRow[];
  total: number;
}> {
  // Fetch verified technician submissions with registration numbers
  const techRows = await db
    .select({
      id: techniciansSurvey.id,
      firstName: techniciansSurvey.firstName,
      surname: techniciansSurvey.surname,
      registrationNumber: techniciansSurvey.registrationNumber,
      status: techniciansSurvey.status,
      submittedAt: techniciansSurvey.submittedAt,
    })
    .from(techniciansSurvey)
    .where(
      sql`${techniciansSurvey.registrationNumber} IS NOT NULL`,
    )
    .orderBy(desc(techniciansSurvey.submittedAt));

  const retRows = await db
    .select({
      id: retailersSurvey.id,
      contactPersonName: retailersSurvey.contactPersonName,
      businessName: retailersSurvey.businessName,
      registrationNumber: retailersSurvey.registrationNumber,
      status: retailersSurvey.status,
      submittedAt: retailersSurvey.submittedAt,
    })
    .from(retailersSurvey)
    .where(
      sql`${retailersSurvey.registrationNumber} IS NOT NULL`,
    )
    .orderBy(desc(retailersSurvey.submittedAt));

  const rows: CertificateRow[] = [
    ...techRows.map((r) => ({
      id: r.id,
      name: `${r.firstName} ${r.surname}`,
      registrationNumber: r.registrationNumber,
      status: r.status,
      type: "technician" as const,
      submittedAt: r.submittedAt,
    })),
    ...retRows.map((r) => ({
      id: r.id,
      name: `${r.contactPersonName} — ${r.businessName}`,
      registrationNumber: r.registrationNumber,
      status: r.status,
      type: "retailer" as const,
      submittedAt: r.submittedAt,
    })),
  ];

  // Sort by registration number descending (most recent first)
  rows.sort((a, b) => {
    const aNum = a.registrationNumber ?? "";
    const bNum = b.registrationNumber ?? "";
    return bNum.localeCompare(aNum);
  });

  return { rows, total: rows.length };
}

export default async function CertificatesPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const { rows, total } = await getCertificates();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Issued Certificates
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {total.toLocaleString()} certificate{total !== 1 ? "s" : ""} issued
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-4 py-3 font-semibold text-slate-700">
                Registration #
              </th>
              <th className="px-4 py-3 font-semibold text-slate-700">Name</th>
              <th className="px-4 py-3 font-semibold text-slate-700">Type</th>
              <th className="px-4 py-3 font-semibold text-slate-700">
                Status
              </th>
              <th className="px-4 py-3 font-semibold text-slate-700">
                Certificate
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-12 text-center text-slate-400"
                >
                  No certificates have been issued yet. Verify a submission to
                  generate a certificate.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.id}
                  className="transition-colors hover:bg-slate-50"
                >
                  <td className="px-4 py-3 font-mono text-sm font-semibold text-brand-600">
                    {row.registrationNumber ?? "—"}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {row.name}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        row.type === "technician"
                          ? "bg-blue-50 text-blue-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {row.type === "technician" ? "Technician" : "Retailer"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        row.status === "verified"
                          ? "bg-green-50 text-green-700"
                          : row.status === "flagged"
                            ? "bg-red-50 text-red-700"
                            : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {row.status === "verified" && row.registrationNumber ? (
                      <a
                        href={`/api/admin/certificates/${row.id}`}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-brand-700"
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 16 16"
                          fill="none"
                          aria-hidden
                        >
                          <path
                            d="M8 1.5L1.5 5v6L8 14.5l6.5-3.5V5L8 1.5z"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M8 1.5v7M1.5 5l6.5 3.5 6.5-3.5"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinejoin="round"
                          />
                        </svg>
                        Download PDF
                      </a>
                    ) : (
                      <span className="text-xs text-slate-400">Pending</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
