import ExcelJS from "exceljs";
import { describe, expect, it } from "vitest";

import type { TechnicianSurvey } from "@/lib/schema";
import { excelExporter } from "../excel";

describe("excelExporter", () => {
  it("writes the selected survey data into a readable XLSX workbook", async () => {
    const result = await excelExporter(
      [{ id: "survey-1", firstName: "Amina" } as TechnicianSurvey],
      {
        sections: {
          background: true,
          skills: false,
          tools: false,
          challenges: false,
          energy: false,
          consent: false,
        },
        anonymise: false,
        includePhotos: false,
      },
    );

    const workbook = new ExcelJS.Workbook();
    const xlsxData = new Uint8Array(result.buffer.byteLength);
    xlsxData.set(result.buffer);
    await workbook.xlsx.load(xlsxData.buffer);
    const worksheet = workbook.getWorksheet("Technicians");

    expect(result.buffer.subarray(0, 2).toString()).toBe("PK");
    expect(result.contentType).toBe(
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    expect(worksheet?.getCell("A1").value).toBe("ID");
    expect(worksheet?.getCell("B1").value).toBe("First name");
    expect(worksheet?.getCell("A2").value).toBe("survey-1");
    expect(worksheet?.getCell("B2").value).toBe("Amina");
  });
});
