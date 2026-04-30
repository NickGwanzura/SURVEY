import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";

import { getCurrentAdmin } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { auditLog, techniciansSurvey } from "@/lib/schema";
import {
  getResponseById,
  patchResponseSchema,
} from "@/lib/admin/responses-data";

const idSchema = z.string().uuid();

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(
  _request: NextRequest,
  { params }: RouteContext,
) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!idSchema.safeParse(id).success) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  try {
    const data = await getResponseById(id);
    if (!data) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(data);
  } catch (err) {
    console.error("[GET /api/admin/responses/[id]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteContext,
) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!idSchema.safeParse(id).success) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = patchResponseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const updates = parsed.data;

  // Fetch existing row to build before/after diff
  const existing = await db
    .select()
    .from(techniciansSurvey)
    .where(eq(techniciansSurvey.id, id))
    .limit(1);

  if (existing.length === 0 || !existing[0]) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const before = existing[0];
  const changes: Record<string, { before: unknown; after: unknown }> = {};

  if (updates.status !== undefined && updates.status !== before.status) {
    changes["status"] = { before: before.status, after: updates.status };
  }
  if ("notes" in updates && updates.notes !== before.notes) {
    changes["notes"] = { before: before.notes, after: updates.notes };
  }
  if (updates.flagReason !== undefined && updates.status === "flagged") {
    changes["flagReason"] = { before: null, after: updates.flagReason };
  }

  if (Object.keys(changes).length === 0) {
    // Nothing actually changed
    return NextResponse.json(before);
  }

  try {
    const now = new Date();
    const updateData: Partial<typeof techniciansSurvey.$inferInsert> = {
      updatedAt: now,
    };
    if (updates.status !== undefined) updateData.status = updates.status;
    if ("notes" in updates) {
      // null means "clear notes"; undefined means "not provided" (no change)
      updateData.notes = updates.notes === null ? null : (updates.notes ?? undefined);
    }

    const updatedRows = await db
      .update(techniciansSurvey)
      .set(updateData)
      .where(eq(techniciansSurvey.id, id))
      .returning();

    const updated = updatedRows[0];
    if (!updated) {
      return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }

    // Write audit log entries for each changed field
    for (const [field, diff] of Object.entries(changes)) {
      const action =
        field === "status" ? `status:${String(diff.after)}` : `${field}:updated`;
      await db.insert(auditLog).values({
        surveyId: id,
        actorAdminUserId: admin.user.id,
        action,
        payload: { field, before: diff.before, after: diff.after },
      });
    }

    return NextResponse.json(updated);
  } catch (err) {
    console.error("[PATCH /api/admin/responses/[id]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: RouteContext,
) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!idSchema.safeParse(id).success) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const existing = await db
    .select()
    .from(techniciansSurvey)
    .where(eq(techniciansSurvey.id, id))
    .limit(1);

  if (existing.length === 0 || !existing[0]) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const survey = existing[0];

  try {
    // NOTE: The audit log row written here will be cascade-deleted when the
    // survey row is deleted (FK: audit_log.survey_id → technicians_survey.id
    // ON DELETE CASCADE). This is a known limitation — soft-delete is preferred
    // but the schema does not have a deletedAt column. The survey ID is
    // captured in the payload for forensic purposes.
    console.warn(
      `[DELETE /api/admin/responses/${id}] Audit trail will be lost due to cascade FK. Survey ID captured in payload only.`,
    );

    await db.insert(auditLog).values({
      surveyId: id,
      actorAdminUserId: admin.user.id,
      action: "deleted",
      payload: {
        surveyId: id,
        firstName: survey.firstName,
        surname: survey.surname,
        phone: survey.phone,
        status: survey.status,
        submittedAt: survey.submittedAt,
      },
    });

    await db.delete(techniciansSurvey).where(eq(techniciansSurvey.id, id));

    return NextResponse.json({ deleted: true });
  } catch (err) {
    console.error("[DELETE /api/admin/responses/[id]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
