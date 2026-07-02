import "server-only";

import { db } from "@/lib/db";
import { systemEvents, adminUsers } from "@/lib/schema";
import { desc, gte, lte, eq, and, like, count, sql } from "drizzle-orm";

export type SystemEventType =
  | "admin.login"
  | "admin.logout"
  | "admin.invite_sent"
  | "admin.password_reset"
  | "admin.password_changed"
  | "survey.submitted"
  | "survey.verified"
  | "survey.flagged"
  | "survey.deleted"
  | "survey.edited"
  | "export.created"
  | "messaging.sent"
  | "report.analyzed";

export const SYSTEM_EVENT_TYPES: SystemEventType[] = [
  "admin.login",
  "admin.logout",
  "admin.invite_sent",
  "admin.password_reset",
  "admin.password_changed",
  "survey.submitted",
  "survey.verified",
  "survey.flagged",
  "survey.deleted",
  "survey.edited",
  "export.created",
  "messaging.sent",
  "report.analyzed",
];

type LogSystemEventParams = {
  actorAdminUserId?: string | null;
  eventType: SystemEventType;
  description: string;
  metadata?: Record<string, unknown> | null;
  ipAddress?: string | null;
};

export async function logSystemEvent(
  params: LogSystemEventParams,
): Promise<void> {
  try {
    await db.insert(systemEvents).values({
      actorAdminUserId: params.actorAdminUserId ?? null,
      eventType: params.eventType,
      description: params.description,
      metadata: params.metadata ?? null,
      ipAddress: params.ipAddress ?? null,
    });
  } catch (err) {
    console.error("[system-events] Failed to log event:", err);
  }
}

export type SystemEventRow = {
  id: string;
  actorAdminUserId: string | null;
  actorName: string | null;
  actorEmail: string | null;
  eventType: string;
  description: string;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: Date;
};

export type ListSystemEventsParams = {
  page?: number;
  pageSize?: number;
  eventType?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
};

export type ListSystemEventsResult = {
  rows: SystemEventRow[];
  total: number;
  page: number;
  pageSize: number;
  eventTypeDistribution: Array<{ eventType: string; count: number }>;
  eventsByDay: Array<{ date: string; count: number }>;
};

/**
 * Build a WHERE clause from the filter params. Returns [conditions, where].
 * The `excludeSearch` flag allows the caller to get conditions without the
 * description LIKE filter (useful for charts that should honour date/type
 * filters but not full-text search).
 */
function buildFilters(
  params: ListSystemEventsParams,
  opts?: { excludeSearch?: boolean },
): { conditions: ReturnType<typeof eq>[]; where: ReturnType<typeof and> | undefined } {
  const conditions: ReturnType<typeof eq>[] = [];

  if (params.eventType) {
    conditions.push(eq(systemEvents.eventType, params.eventType) as unknown as ReturnType<typeof eq>);
  }
  if (params.dateFrom) {
    conditions.push(gte(systemEvents.createdAt, new Date(params.dateFrom)) as unknown as ReturnType<typeof eq>);
  }
  if (params.dateTo) {
    conditions.push(lte(systemEvents.createdAt, new Date(params.dateTo)) as unknown as ReturnType<typeof eq>);
  }
  if (params.search && !opts?.excludeSearch) {
    conditions.push(like(systemEvents.description, `%${params.search}%`) as unknown as ReturnType<typeof eq>);
  }

  return {
    conditions,
    where: conditions.length > 0 ? (and(...conditions) as ReturnType<typeof and>) : undefined,
  };
}

export async function listSystemEvents(
  params: ListSystemEventsParams = {},
): Promise<ListSystemEventsResult> {
  const page = params.page ?? 1;
  const pageSize = Math.min(params.pageSize ?? 50, 200);
  const offset = (page - 1) * pageSize;

  const { where } = buildFilters(params);

  // ── Count total matching events ────────────────────────────────────
  const [totalResult] = await db
    .select({ total: count() })
    .from(systemEvents)
    .where(where);
  const total = totalResult?.total ?? 0;

  // ── Fetch page with actor enrichment via a join ─────────────────────
  const rows = await db
    .select({
      id: systemEvents.id,
      actorAdminUserId: systemEvents.actorAdminUserId,
      eventType: systemEvents.eventType,
      description: systemEvents.description,
      metadata: systemEvents.metadata,
      ipAddress: systemEvents.ipAddress,
      createdAt: systemEvents.createdAt,
      actorName: adminUsers.name,
      actorEmail: adminUsers.email,
    })
    .from(systemEvents)
    .leftJoin(adminUsers, eq(systemEvents.actorAdminUserId, adminUsers.id))
    .where(where)
    .orderBy(desc(systemEvents.createdAt))
    .limit(pageSize)
    .offset(offset);

  const enriched: SystemEventRow[] = rows.map((row) => ({
    id: row.id,
    actorAdminUserId: row.actorAdminUserId,
    eventType: row.eventType,
    description: row.description,
    metadata: row.metadata as Record<string, unknown> | null,
    ipAddress: row.ipAddress,
    createdAt: row.createdAt,
    actorName: row.actorName,
    actorEmail: row.actorEmail,
  }));

  // ── Aggregation: event type distribution ───────────────────────────
  // Use same date/type filters but exclude search so charts aren't affected by text query
  const { where: aggWhere } = buildFilters(params, { excludeSearch: true });

  const distributionRows = await db
    .select({
      eventType: systemEvents.eventType,
      count: count(),
    })
    .from(systemEvents)
    .where(aggWhere)
    .groupBy(systemEvents.eventType)
    .orderBy(desc(count()));

  // ── Aggregation: events by day (last 30 days) ──────────────────────
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const dayConditions: ReturnType<typeof eq>[] = [
    gte(systemEvents.createdAt, thirtyDaysAgo) as unknown as ReturnType<typeof eq>,
  ];
  // Carry over eventType filter to the day chart
  if (params.eventType) {
    dayConditions.push(eq(systemEvents.eventType, params.eventType) as unknown as ReturnType<typeof eq>);
  }
  const dayWhere =
    dayConditions.length > 0
      ? (and(...dayConditions) as ReturnType<typeof and>)
      : undefined;

  const dayRows = await db
    .select({
      date: sql<string>`DATE(${systemEvents.createdAt})`,
      count: count(),
    })
    .from(systemEvents)
    .where(dayWhere)
    .groupBy(sql`DATE(${systemEvents.createdAt})`)
    .orderBy(sql`DATE(${systemEvents.createdAt})`);

  return {
    rows: enriched,
    total,
    page,
    pageSize,
    eventTypeDistribution: distributionRows.map((r) => ({
      eventType: r.eventType,
      count: r.count,
    })),
    eventsByDay: dayRows.map((r) => ({
      date: r.date,
      count: r.count,
    })),
  };
}
