import * as XLSX from "xlsx";

import type { TechnicianSurvey } from "@/lib/schema";
import { cellValue, selectColumns, stableHash, type ExportOptions, type ExportResult } from "./types";

export async function excelExporter(
  rows: TechnicianSurvey[],
  opts: ExportOptions,
): Promise<ExportResult> {
  const cols = selectColumns(opts);
  const includeAnonId = opts.anonymise;

  const headers = [
    ...(includeAnonId ? ["anonymous_id"] : []),
    ...cols.filter((c) => c.key !== "id" || !includeAnonId).map((c) => c.header),
  ];

  const dataRows = await Promise.all(
    rows.map(async (row) => {
      const anonId = includeAnonId ? await stableHash(row.id) : null;
      const cells = cols
        .filter((c) => c.key !== "id" || !includeAnonId)
        .map((c) => cellValue(row, c.key));
      return anonId !== null ? [anonId, ...cells] : cells;
    }),
  );

  const aoa = [headers, ...dataRows];
  const ws = XLSX.utils.aoa_to_sheet(aoa);

  // Reasonable column widths
  const colWidths = headers.map((h) => {
    const w = Math.max(h.length + 2, 12);
    return { wch: Math.min(w, 40) };
  });
  ws["!cols"] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Technicians");

  const xlsxBuffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;

  return {
    buffer: xlsxBuffer,
    contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    filename: `technicians-${Date.now()}.xlsx`,
  };
}
