import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { getCurrentAdmin } from "@/lib/auth-server";
import { db } from "@/lib/db";

const ALLOWED_FIELDS = new Set([
  "firstName",
  "surname",
  "phone",
  "email",
  "province",
  "city",
  "suburb",
  "gender",
  "ageGroup",
  "educationLevel",
  "yearsExperience",
  "mainWorkFocus",
  "hasCertification",
  "hasFormalTraining",
  "confidenceTraditionalRefrigerants",
  "confidenceLowGwpRefrigerants",
  "status",
  "submittedAt",
  "submissionSource",
  "consentToContact",
  "consentToPublicRegistry",
  "installsEnergyEfficient",
]);

const DB_COLUMN_MAP: Record<string, string> = {
  firstName: "first_name",
  surname: "surname",
  phone: "phone",
  email: "email",
  province: "province",
  city: "city",
  suburb: "suburb",
  gender: "gender",
  ageGroup: "age_group",
  educationLevel: "education_level",
  yearsExperience: "years_experience",
  mainWorkFocus: "main_work_focus",
  hasCertification: "has_certification",
  hasFormalTraining: "has_formal_training",
  confidenceTraditionalRefrigerants: "confidence_traditional_refrigerants",
  confidenceLowGwpRefrigerants: "confidence_low_gwp_refrigerants",
  status: "status",
  submittedAt: "submitted_at",
  submissionSource: "submission_source",
  consentToContact: "consent_to_contact",
  consentToPublicRegistry: "consent_to_public_registry",
  installsEnergyEfficient: "installs_energy_efficient",
};

const VALID_STATUSES = ["pending", "verified", "flagged", "duplicate"];

export async function GET(req: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const fields = searchParams
      .getAll("fields")
      .filter((f) => ALLOWED_FIELDS.has(f));
    const groupBy = searchParams.get("groupBy");
    const statusFilter = searchParams.get("status");
    const provinceFilter = searchParams.get("province");

    if (fields.length === 0) {
      return NextResponse.json(
        { error: "No fields selected" },
        { status: 400 },
      );
    }

    const statusCond =
      statusFilter && VALID_STATUSES.includes(statusFilter)
        ? sql`status = ${statusFilter}`
        : sql`1 = 1`;
    const provinceCond = provinceFilter
      ? sql`province = ${provinceFilter}`
      : sql`1 = 1`;

    if (groupBy && groupBy !== "none" && ALLOWED_FIELDS.has(groupBy)) {
      const groupCol = DB_COLUMN_MAP[groupBy] ?? groupBy;
      const query = sql`
        SELECT ${sql.raw(groupCol)} AS "_groupKey", COUNT(*)::int AS count
        FROM technicians_survey
        WHERE ${statusCond} AND ${provinceCond}
        GROUP BY ${sql.raw(groupCol)}
        ORDER BY count DESC
      `;
      const result = await db.execute(query);
      return NextResponse.json({ results: result.rows });
    }

    const cols = fields.map((f) => DB_COLUMN_MAP[f] ?? f);
    const selectCols = cols.join(", ");
    const query = sql`
      SELECT ${sql.raw(selectCols)}
      FROM technicians_survey
      WHERE ${statusCond} AND ${provinceCond}
      LIMIT 500
    `;
    const result = await db.execute(query);
    return NextResponse.json({ results: result.rows });
  } catch (err) {
    console.error("[GET /api/admin/report-builder]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
