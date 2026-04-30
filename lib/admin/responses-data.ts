import "server-only";

import { and, count, desc, eq, gte, ilike, lte, or, sql, type SQL } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/lib/db";
import { MAIN_WORK_FOCUS } from "@/lib/constants/workFocus";
import { PROVINCES } from "@/lib/constants/provinces";
import { YEARS_EXPERIENCE } from "@/lib/constants/ageGroups";
import { EDUCATION_LEVELS } from "@/lib/constants/educationLevels";
import { SUBMISSION_STATUSES } from "@/lib/constants/challenges";
import { HAS_CERTIFICATION_OPTIONS } from "@/lib/constants/refrigerants";
import { adminUsers, auditLog, techniciansSurvey } from "@/lib/schema";

// ---------------------------------------------------------------------------
// Query param schema
// ---------------------------------------------------------------------------

export const listResponsesParamsSchema = z.object({
  q: z.string().trim().max(200).optional(),
  province: z.enum(PROVINCES).optional(),
  district: z.string().trim().max(100).optional(),
  mainWorkFocus: z.enum(MAIN_WORK_FOCUS).optional(),
  hasCertification: z.enum(HAS_CERTIFICATION_OPTIONS).optional(),
  status: z.enum(SUBMISSION_STATUSES).optional(),
  yearsExperience: z.enum(YEARS_EXPERIENCE).optional(),
  educationLevel: z.enum(EDUCATION_LEVELS).optional(),
  dateFrom: z.string().datetime({ offset: true }).optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()),
  dateTo: z.string().datetime({ offset: true }).optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
});

export type ListResponsesParams = z.infer<typeof listResponsesParamsSchema>;

export type ResponseRow = {
  id: string;
  firstName: string;
  surname: string;
  phone: string;
  province: string;
  district: string;
  mainWorkFocus: string[];
  yearsExperience: string;
  hasCertification: string;
  status: string;
  submittedAt: Date | string;
};

export type ListResponsesResult = {
  rows: ResponseRow[];
  total: number;
  page: number;
  pageSize: number;
};

// ---------------------------------------------------------------------------
// List query
// ---------------------------------------------------------------------------

export async function listResponses(
  params: ListResponsesParams,
): Promise<ListResponsesResult> {
  const { q, province, district, mainWorkFocus, hasCertification, status, yearsExperience, educationLevel, dateFrom, dateTo, page, pageSize } = params;

  const conditions: (SQL | undefined)[] = [];

  if (q) {
    const pattern = `%${q}%`;
    conditions.push(
      or(
        ilike(techniciansSurvey.firstName, pattern),
        ilike(techniciansSurvey.surname, pattern),
        ilike(techniciansSurvey.phone, pattern),
      ),
    );
  }
  if (province) conditions.push(eq(techniciansSurvey.province, province));
  if (district) conditions.push(ilike(techniciansSurvey.district, `%${district}%`));
  if (mainWorkFocus) {
    conditions.push(
      sql`${techniciansSurvey.mainWorkFocus} @> ${JSON.stringify([mainWorkFocus])}::jsonb`,
    );
  }
  if (hasCertification) conditions.push(eq(techniciansSurvey.hasCertification, hasCertification));
  if (status) conditions.push(eq(techniciansSurvey.status, status));
  if (yearsExperience) conditions.push(eq(techniciansSurvey.yearsExperience, yearsExperience));
  if (educationLevel) conditions.push(eq(techniciansSurvey.educationLevel, educationLevel));
  if (dateFrom) conditions.push(gte(techniciansSurvey.submittedAt, new Date(dateFrom)));
  if (dateTo) {
    const to = new Date(dateTo);
    // If it's a date-only string, advance to end of that day
    if (!dateTo.includes("T")) to.setHours(23, 59, 59, 999);
    conditions.push(lte(techniciansSurvey.submittedAt, to));
  }

  const where = and(...conditions);
  const offset = (page - 1) * pageSize;

  const [rows, [{ total }]] = await Promise.all([
    db
      .select({
        id: techniciansSurvey.id,
        firstName: techniciansSurvey.firstName,
        surname: techniciansSurvey.surname,
        phone: techniciansSurvey.phone,
        province: techniciansSurvey.province,
        district: techniciansSurvey.district,
        mainWorkFocus: techniciansSurvey.mainWorkFocus,
        yearsExperience: techniciansSurvey.yearsExperience,
        hasCertification: techniciansSurvey.hasCertification,
        status: techniciansSurvey.status,
        submittedAt: techniciansSurvey.submittedAt,
      })
      .from(techniciansSurvey)
      .where(where)
      .orderBy(desc(techniciansSurvey.submittedAt))
      .limit(pageSize)
      .offset(offset),
    db
      .select({ total: count() })
      .from(techniciansSurvey)
      .where(where),
  ]);

  return { rows, total: Number(total), page, pageSize };
}

// ---------------------------------------------------------------------------
// Full detail query
// ---------------------------------------------------------------------------

export type AuditLogWithActor = {
  id: string;
  surveyId: string;
  actorAdminUserId: string;
  actorName: string;
  actorEmail: string;
  action: string;
  payload: unknown;
  createdAt: Date;
};

export type ResponseDetail = typeof techniciansSurvey.$inferSelect & {
  audit: AuditLogWithActor[];
};

export async function getResponseById(id: string): Promise<ResponseDetail | null> {
  const rows = await db
    .select()
    .from(techniciansSurvey)
    .where(eq(techniciansSurvey.id, id))
    .limit(1);

  if (rows.length === 0 || !rows[0]) return null;
  const survey = rows[0];

  const auditRows = await db
    .select({
      id: auditLog.id,
      surveyId: auditLog.surveyId,
      actorAdminUserId: auditLog.actorAdminUserId,
      actorName: adminUsers.name,
      actorEmail: adminUsers.email,
      action: auditLog.action,
      payload: auditLog.payload,
      createdAt: auditLog.createdAt,
    })
    .from(auditLog)
    .innerJoin(adminUsers, eq(auditLog.actorAdminUserId, adminUsers.id))
    .where(eq(auditLog.surveyId, id))
    .orderBy(desc(auditLog.createdAt));

  return { ...survey, audit: auditRows };
}

// ---------------------------------------------------------------------------
// PATCH schema
// ---------------------------------------------------------------------------

export const patchResponseSchema = z.object({
  status: z.enum(SUBMISSION_STATUSES).optional(),
  notes: z.string().trim().max(5000).nullable().optional(),
  flagReason: z.string().trim().max(1000).optional(),
});

export type PatchResponseBody = z.infer<typeof patchResponseSchema>;
