import type { ExportResult } from "./types";

export type TechniciansDirectoryCsvRow = {
  firstName: string;
  surname: string;
};

function escapeCsv(val: string): string {
  if (val.includes('"') || val.includes(",") || val.includes("\n") || val.includes("\r")) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

export async function techniciansDirectoryCsvExporter(
  rows: TechniciansDirectoryCsvRow[],
): Promise<ExportResult> {
  const headerRow = ["first_name", "surname"];
  const dataRows = rows.map((row) => [
    escapeCsv(row.firstName),
    escapeCsv(row.surname),
  ]);

  const csvLines = [headerRow.join(","), ...dataRows.map((r) => r.join(","))];

  // UTF-8 BOM for Excel compat
  const csv = "﻿" + csvLines.join("\r\n");
  const buffer = Buffer.from(csv, "utf-8");

  return {
    buffer,
    contentType: "text/csv; charset=utf-8",
    filename: `registered-technicians-${Date.now()}.csv`,
  };
}
