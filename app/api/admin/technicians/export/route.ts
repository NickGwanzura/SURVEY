import { NextRequest, NextResponse } from "next/server";

import { getCurrentAdmin } from "@/lib/auth-server";
import { listRegisteredTechniciansForCsvExport } from "@/lib/admin/technicians-directory-data";
import { techniciansDirectoryCsvExporter } from "@/lib/admin/exporters/technicians-directory-csv";

export async function GET(_request: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await listRegisteredTechniciansForCsvExport();
  const result = await techniciansDirectoryCsvExporter(rows);

  // Copy Buffer into a plain ArrayBuffer to satisfy Response typing
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
