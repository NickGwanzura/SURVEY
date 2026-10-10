import ExcelJS from "exceljs";

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

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Technicians");
  worksheet.addRow(headers);
  for (const row of dataRows) worksheet.addRow(row);

  // Keep the exported columns readable without letting long values dominate.
  headers.forEach((header, index) => {
    worksheet.getColumn(index + 1).width = Math.min(
      Math.max(header.length + 2, 12),
      40,
    );
  });

  const xlsxBuffer = Buffer.from(await workbook.xlsx.writeBuffer());

  return {
    buffer: xlsxBuffer,
    contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    filename: `technicians-${Date.now()}.xlsx`,
  };
}
