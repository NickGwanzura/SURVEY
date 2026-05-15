import "server-only";

import { and, count, desc, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/lib/db";
import { techniciansSurvey } from "@/lib/schema";

export const listTechniciansDirectoryParamsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
});

export type ListTechniciansDirectoryParams = z.infer<
  typeof listTechniciansDirectoryParamsSchema
>;

export type TechniciansDirectoryRow = {
  id: string;
  firstName: string;
  surname: string;
  province: string;
  hasCertification: string;
  submittedAt: Date | string;
};

export type ListTechniciansDirectoryResult = {
  rows: TechniciansDirectoryRow[];
  total: number;
  page: number;
  pageSize: number;
};

const REGISTERED_CONDITIONS = [
  eq(techniciansSurvey.status, "verified"),
  eq(techniciansSurvey.consentToPublicRegistry, true),
];

export async function listRegisteredTechniciansDirectory(
  params: ListTechniciansDirectoryParams,
): Promise<ListTechniciansDirectoryResult> {
  const { page, pageSize } = params;

  const offset = (page - 1) * pageSize;

  const where = and(...REGISTERED_CONDITIONS);

  const [rowsResult, [{ total }]] = await Promise.all([
    db
      .select({
        id: techniciansSurvey.id,
        firstName: techniciansSurvey.firstName,
        surname: techniciansSurvey.surname,
        province: techniciansSurvey.province,
        hasCertification: techniciansSurvey.hasCertification,
        submittedAt: techniciansSurvey.submittedAt,
      })
      .from(techniciansSurvey)
      .where(where)
      .orderBy(desc(techniciansSurvey.submittedAt))
      .limit(pageSize)
      .offset(offset),
    db.select({ total: count() }).from(techniciansSurvey).where(where),
  ]);

  return {
    rows: rowsResult,
    total: Number(total),
    page,
    pageSize,
  };
}

export type ExportRegisteredTechniciansRow = {
  firstName: string;
  surname: string;
};

export async function listRegisteredTechniciansForCsvExport(): Promise<
  ExportRegisteredTechniciansRow[]
> {
  const where = and(...REGISTERED_CONDITIONS);

  const rows = await db
    .select({
      firstName: techniciansSurvey.firstName,
      surname: techniciansSurvey.surname,
    })
    .from(techniciansSurvey)
    .where(where)
    .orderBy(desc(techniciansSurvey.submittedAt));

  // Deduplicate by name+surname to keep the directory export stable if
  // multiple submissions exist for the same person.
  const seen = new Set<string>();
  const unique: ExportRegisteredTechniciansRow[] = [];
  for (const row of rows) {
    const key = `${row.firstName} ${row.surname}`.trim().toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(row);
  }

  return unique;
}
