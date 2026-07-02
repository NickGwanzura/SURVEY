import type { TechnicianSurvey } from "@/lib/schema";
import { cellValue, selectColumns, stableHash, type ExportOptions, type ExportResult } from "./types";

function escapeCsv(val: string): string {
  if (val.includes('"') || val.includes(",") || val.includes("\n") || val.includes("\r")) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

export async function csvExporter(
  rows: TechnicianSurvey[],
  opts: ExportOptions,
): Promise<ExportResult> {
  const cols = selectColumns(opts);

  // If anonymise, add anonymous_id col at front, remove id
  const includeAnonId = opts.anonymise;

  const headerRow = [
    ...(includeAnonId ? ["anonymous_id"] : []),
    ...cols.filter((c) => c.key !== "id" || !includeAnonId).map((c) => c.header),
  ];

  const dataRows = await Promise.all(
    rows.map(async (row) => {
      const anonId = includeAnonId ? await stableHash(row.id) : null;
      const cells = cols
        .filter((c) => c.key !== "id" || !includeAnonId)
        .map((c) => escapeCsv(cellValue(row, c.key)));
      return anonId !== null ? [anonId, ...cells] : cells;
    }),
  );

  const csvLines = [headerRow.map(escapeCsv).join(","), ...dataRows.map((r) => r.join(","))];
  // UTF-8 BOM for Excel compat
  const csv = "﻿" + csvLines.join("\r\n");

  const buffer = Buffer.from(csv, "utf-8");

  return {
    buffer,
    contentType: "text/csv; charset=utf-8",
    filename: `technicians-${Date.now()}.csv`,
  };
}
