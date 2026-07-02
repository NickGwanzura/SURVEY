import "server-only";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";

export type DuplicateGroup = {
  key: string;
  count: number;
  ids: string[];
  names: string[];
  phones: string[];
  provinces: string[];
  matchType: "exact_phone" | "exact_name_location" | "fuzzy_name_phone";
  confidence: "high" | "medium" | "low";
};

export async function findDuplicates(): Promise<DuplicateGroup[]> {
  // Exact phone duplicates
  const phoneDups = await db.execute(sql`
    SELECT phone, ARRAY_AGG(id) AS ids, ARRAY_AGG(first_name || ' ' || surname) AS names,
           ARRAY_AGG(province) AS provinces, COUNT(*)::int AS count
    FROM technicians_survey
    WHERE status != 'duplicate'
    GROUP BY phone
    HAVING COUNT(*) > 1
  `);

  // Exact name + city + suburb duplicates
  const locationDups = await db.execute(sql`
    SELECT first_name || ' ' || surname || '|' || city || '|' || suburb AS key,
           ARRAY_AGG(id) AS ids, ARRAY_AGG(phone) AS phones,
           ARRAY_AGG(province) AS provinces, COUNT(*)::int AS count
    FROM technicians_survey
    WHERE status != 'duplicate'
    GROUP BY first_name, surname, city, suburb
    HAVING COUNT(*) > 1
  `);

  const groups: DuplicateGroup[] = [];

  for (const row of phoneDups.rows as Array<{
    phone: string; ids: string[]; names: string[]; provinces: string[]; count: number;
  }>) {
    groups.push({
      key: row.phone,
      count: row.count,
      ids: row.ids,
      names: row.names,
      phones: Array(row.count).fill(row.phone),
      provinces: row.provinces,
      matchType: "exact_phone",
      confidence: "high",
    });
  }

  for (const row of locationDups.rows as Array<{
    key: string; ids: string[]; phones: string[]; provinces: string[]; count: number;
  }>) {
    // Skip if already found by phone
    if (groups.some((g) => g.ids.some((id) => row.ids.includes(id)))) continue;
    groups.push({
      key: row.key,
      count: row.count,
      ids: row.ids,
      names: Array(row.count).fill(row.key.split("|")[0] ?? ""),
      phones: row.phones,
      provinces: row.provinces,
      matchType: "exact_name_location",
      confidence: "high",
    });
  }

  return groups.sort((a, b) => b.count - a.count);
}
