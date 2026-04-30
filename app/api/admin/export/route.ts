import { NextRequest, NextResponse } from "next/server";
import { and, eq, gte, ilike, lte, or, sql } from "drizzle-orm";
import { z } from "zod";

import { getCurrentAdmin } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { exportLog, techniciansSurvey } from "@/lib/schema";
import { PROVINCES } from "@/lib/constants/provinces";
import { MAIN_WORK_FOCUS } from "@/lib/constants/workFocus";
import { SUBMISSION_STATUSES } from "@/lib/constants/challenges";
import { HAS_CERTIFICATION_OPTIONS } from "@/lib/constants/refrigerants";
import { YEARS_EXPERIENCE } from "@/lib/constants/ageGroups";
import { EDUCATION_LEVELS } from "@/lib/constants/educationLevels";

import { csvExporter } from "@/lib/admin/exporters/csv";
import { excelExporter } from "@/lib/admin/exporters/excel";
import { pdfExporter } from "@/lib/admin/exporters/pdf";
import { geojsonExporter } from "@/lib/admin/exporters/geojson";
import { spssExporter } from "@/lib/admin/exporters/spss";

// ─── Request schema ──────────────────────────────────────────────────────────

const exportRequestSchema = z.object({
  format: z.enum(["csv", "excel", "pdf", "geojson", "spss"]),
  filters: z
    .object({
      province: z.enum(PROVINCES).optional(),
      district: z.string().trim().max(100).optional(),
      mainWorkFocus: z.enum(MAIN_WORK_FOCUS).optional(),
      status: z.enum(SUBMISSION_STATUSES).optional(),
      hasCertification: z.enum(HAS_CERTIFICATION_OPTIONS).optional(),
      yearsExperience: z.enum(YEARS_EXPERIENCE).optional(),
      educationLevel: z.enum(EDUCATION_LEVELS).optional(),
      dateFrom: z.string().optional(),
      dateTo: z.string().optional(),
      q: z.string().trim().max(200).optional(),
    })
    .optional()
    .default({}),
  sections: z
    .object({
      background: z.boolean(),
      skills: z.boolean(),
      tools: z.boolean(),
      challenges: z.boolean(),
      energy: z.boolean(),
      consent: z.boolean(),
    })
    .optional()
    .default({
      background: true,
      skills: true,
      tools: true,
      challenges: true,
      energy: true,
      consent: true,
    }),
  anonymise: z.boolean().optional().default(false),
  includePhotos: z.boolean().optional().default(false),
});

export async function POST(request: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = exportRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { format, filters, sections, anonymise, includePhotos } = parsed.data;

  // ─── Build Drizzle where conditions ────────────────────────────────────────
  const conditions: ReturnType<typeof eq>[] = [];

  if (filters.q) {
    const pattern = `%${filters.q}%`;
    conditions.push(
      or(
        ilike(techniciansSurvey.firstName, pattern),
        ilike(techniciansSurvey.surname, pattern),
        ilike(techniciansSurvey.phone, pattern),
      ) as ReturnType<typeof eq>,
    );
  }
  if (filters.province) conditions.push(eq(techniciansSurvey.province, filters.province));
  if (filters.district) conditions.push(ilike(techniciansSurvey.district, `%${filters.district}%`) as ReturnType<typeof eq>);
  if (filters.mainWorkFocus) {
    conditions.push(
      sql`${techniciansSurvey.mainWorkFocus} @> ${JSON.stringify([filters.mainWorkFocus])}::jsonb` as ReturnType<typeof eq>,
    );
  }
  if (filters.hasCertification) conditions.push(eq(techniciansSurvey.hasCertification, filters.hasCertification));
  if (filters.status) conditions.push(eq(techniciansSurvey.status, filters.status));
  if (filters.yearsExperience) conditions.push(eq(techniciansSurvey.yearsExperience, filters.yearsExperience));
  if (filters.educationLevel) conditions.push(eq(techniciansSurvey.educationLevel, filters.educationLevel));
  if (filters.dateFrom) {
    conditions.push(gte(techniciansSurvey.submittedAt, new Date(filters.dateFrom)) as ReturnType<typeof eq>);
  }
  if (filters.dateTo) {
    const to = new Date(filters.dateTo);
    if (!filters.dateTo.includes("T")) to.setHours(23, 59, 59, 999);
    conditions.push(lte(techniciansSurvey.submittedAt, to) as ReturnType<typeof eq>);
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const rows = await db
    .select()
    .from(techniciansSurvey)
    .where(where)
    .orderBy(techniciansSurvey.submittedAt);

  const opts = { sections, anonymise, includePhotos };

  // ─── Build filter summary for PDF ─────────────────────────────────────────
  const filterParts: string[] = [];
  if (filters.province) filterParts.push(`province=${filters.province}`);
  if (filters.mainWorkFocus) filterParts.push(`focus=${filters.mainWorkFocus}`);
  if (filters.status) filterParts.push(`status=${filters.status}`);
  if (filters.hasCertification) filterParts.push(`cert=${filters.hasCertification}`);
  if (filters.dateFrom) filterParts.push(`from=${filters.dateFrom}`);
  if (filters.dateTo) filterParts.push(`to=${filters.dateTo}`);
  const filterSummary = filterParts.join(", ");

  // ─── Call exporter ─────────────────────────────────────────────────────────
  let result: { buffer: Buffer; contentType: string; filename: string };

  try {
    switch (format) {
      case "csv":
        result = await csvExporter(rows, opts);
        break;
      case "excel":
        result = await excelExporter(rows, opts);
        break;
      case "pdf":
        result = await pdfExporter(rows, opts, filterSummary);
        break;
      case "geojson":
        result = await geojsonExporter(rows, opts);
        break;
      case "spss":
        result = await spssExporter(rows, opts);
        break;
    }
  } catch (err) {
    console.error("[POST /api/admin/export] exporter error", err);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }

  // ─── Audit log ─────────────────────────────────────────────────────────────
  try {
    await db.insert(exportLog).values({
      actorAdminUserId: admin.user.id,
      format,
      filters: filters as Record<string, unknown>,
      rowCount: rows.length,
      anonymised: anonymise,
    });
  } catch (err) {
    // Non-fatal — don't fail the export if logging fails
    console.error("[POST /api/admin/export] log insert failed", err);
  }

  // ─── Return file ──────────────────────────────────────────────────────────
  // Copy Buffer into a plain ArrayBuffer to satisfy Response BodyInit typing
  const ab = result.buffer.buffer.slice(
    result.buffer.byteOffset,
    result.buffer.byteOffset + result.buffer.byteLength,
  ) as ArrayBuffer;
  return new Response(ab, {
    status: 200,
    headers: {
      "Content-Type": result.contentType,
      "Content-Disposition": `attachment; filename="${result.filename}"`,
      "Content-Length": String(result.buffer.length),
    },
  });
}
