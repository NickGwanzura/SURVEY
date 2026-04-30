import { and, count, desc, gte, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { PROVINCE_LABELS } from "@/lib/constants/provinces";
import { MAIN_WORK_FOCUS_LABELS } from "@/lib/constants/workFocus";
import { HAS_CERTIFICATION_LABELS } from "@/lib/constants/refrigerants";
import { techniciansSurvey } from "@/lib/schema";
import type { Province } from "@/lib/constants/provinces";
import type { MainWorkFocus } from "@/lib/constants/workFocus";
import type { HasCertification } from "@/lib/constants/refrigerants";
import type { SubmissionStatus } from "@/lib/constants/challenges";

export type StatsData = {
  cards: {
    total: number;
    today: number;
    thisWeek: number;
    verified: number;
    pending: number;
    flagged: number;
  };
  byProvince: Array<{ province: Province; label: string; count: number }>;
  // byWorkFocus counts how many technicians selected each focus. Since a
  // technician may pick more than one, the sum can exceed total respondents.
  byWorkFocus: Array<{ value: MainWorkFocus; label: string; count: number }>;
  byCertification: Array<{
    value: HasCertification;
    label: string;
    count: number;
  }>;
  submissionsByDay: Array<{ date: string; count: number }>;
  recent: Array<{
    id: string;
    firstName: string;
    surname: string;
    province: Province;
    mainWorkFocus: MainWorkFocus[];
    status: SubmissionStatus;
    submittedAt: Date;
  }>;
};

export async function getStatsData(): Promise<StatsData> {
  const now = new Date();
  const todayStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  const weekStart = new Date(
    todayStart.getTime() - 6 * 24 * 60 * 60 * 1000,
  );
  const thirtyDaysAgo = new Date(
    todayStart.getTime() - 29 * 24 * 60 * 60 * 1000,
  );

  const [
    totalRows,
    todayRows,
    weekRows,
    verifiedRows,
    pendingRows,
    flaggedRows,
    byProvinceRows,
    workFocusSelectionRows,
    byCertRows,
    recentRows,
    submissionDayRows,
  ] = await Promise.all([
    db.select({ count: count() }).from(techniciansSurvey),
    db
      .select({ count: count() })
      .from(techniciansSurvey)
      .where(gte(techniciansSurvey.submittedAt, todayStart)),
    db
      .select({ count: count() })
      .from(techniciansSurvey)
      .where(gte(techniciansSurvey.submittedAt, weekStart)),
    db
      .select({ count: count() })
      .from(techniciansSurvey)
      .where(and(sql`${techniciansSurvey.status} = 'verified'`)),
    db
      .select({ count: count() })
      .from(techniciansSurvey)
      .where(and(sql`${techniciansSurvey.status} = 'pending'`)),
    db
      .select({ count: count() })
      .from(techniciansSurvey)
      .where(and(sql`${techniciansSurvey.status} = 'flagged'`)),
    db
      .select({ province: techniciansSurvey.province, count: count() })
      .from(techniciansSurvey)
      .groupBy(techniciansSurvey.province)
      .orderBy(desc(count())),
    db
      .select({ mainWorkFocus: techniciansSurvey.mainWorkFocus })
      .from(techniciansSurvey),
    db
      .select({ value: techniciansSurvey.hasCertification, count: count() })
      .from(techniciansSurvey)
      .groupBy(techniciansSurvey.hasCertification)
      .orderBy(desc(count())),
    db
      .select({
        id: techniciansSurvey.id,
        firstName: techniciansSurvey.firstName,
        surname: techniciansSurvey.surname,
        province: techniciansSurvey.province,
        mainWorkFocus: techniciansSurvey.mainWorkFocus,
        status: techniciansSurvey.status,
        submittedAt: techniciansSurvey.submittedAt,
      })
      .from(techniciansSurvey)
      .orderBy(desc(techniciansSurvey.submittedAt))
      .limit(10),
    db
      .select({
        date: sql<string>`DATE(${techniciansSurvey.submittedAt} AT TIME ZONE 'UTC')`.as(
          "date",
        ),
        count: count(),
      })
      .from(techniciansSurvey)
      .where(gte(techniciansSurvey.submittedAt, thirtyDaysAgo))
      .groupBy(
        sql`DATE(${techniciansSurvey.submittedAt} AT TIME ZONE 'UTC')`,
      )
      .orderBy(
        sql`DATE(${techniciansSurvey.submittedAt} AT TIME ZONE 'UTC')`,
      ),
  ]);

  const dayMap = new Map<string, number>();
  for (const row of submissionDayRows) {
    dayMap.set(row.date, row.count);
  }
  const submissionsByDay: Array<{ date: string; count: number }> = [];
  for (let i = 0; i < 30; i++) {
    const d = new Date(thirtyDaysAgo.getTime() + i * 24 * 60 * 60 * 1000);
    const dateStr = d.toISOString().slice(0, 10);
    submissionsByDay.push({ date: dateStr, count: dayMap.get(dateStr) ?? 0 });
  }

  return {
    cards: {
      total: totalRows[0]?.count ?? 0,
      today: todayRows[0]?.count ?? 0,
      thisWeek: weekRows[0]?.count ?? 0,
      verified: verifiedRows[0]?.count ?? 0,
      pending: pendingRows[0]?.count ?? 0,
      flagged: flaggedRows[0]?.count ?? 0,
    },
    byProvince: byProvinceRows.slice(0, 10).map((r) => ({
      province: r.province as Province,
      label: PROVINCE_LABELS[r.province as Province] ?? r.province,
      count: r.count,
    })),
    byWorkFocus: (() => {
      const counts = new Map<MainWorkFocus, number>();
      for (const row of workFocusSelectionRows) {
        for (const focus of row.mainWorkFocus ?? []) {
          counts.set(focus, (counts.get(focus) ?? 0) + 1);
        }
      }
      return Array.from(counts.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([value, count]) => ({
          value,
          label: MAIN_WORK_FOCUS_LABELS[value] ?? value,
          count,
        }));
    })(),
    byCertification: byCertRows.map((r) => ({
      value: r.value as HasCertification,
      label:
        HAS_CERTIFICATION_LABELS[r.value as HasCertification] ?? r.value,
      count: r.count,
    })),
    submissionsByDay,
    recent: recentRows.map((r) => ({
      id: r.id,
      firstName: r.firstName,
      surname: r.surname,
      province: r.province as Province,
      mainWorkFocus: (r.mainWorkFocus ?? []) as MainWorkFocus[],
      status: r.status as SubmissionStatus,
      submittedAt: r.submittedAt,
    })),
  };
}
