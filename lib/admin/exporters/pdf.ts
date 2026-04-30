import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

import type { TechnicianSurvey } from "@/lib/schema";
import { PROVINCE_LABELS } from "@/lib/constants/provinces";
import { MAIN_WORK_FOCUS_LABELS } from "@/lib/constants/workFocus";
import { HAS_CERTIFICATION_LABELS } from "@/lib/constants/refrigerants";
import { stableHash, type ExportOptions, type ExportResult } from "./types";

type Province = keyof typeof PROVINCE_LABELS;
type MainWorkFocus = keyof typeof MAIN_WORK_FOCUS_LABELS;
type HasCertification = keyof typeof HAS_CERTIFICATION_LABELS;

// The 12 most useful columns for PDF (section-aware split)
const PDF_SECTION_COLUMNS: Record<string, { header: string; key: keyof TechnicianSurvey }[]> = {
  background: [
    { header: "Name / ID", key: "id" }, // overridden below
    { header: "Province", key: "province" },
    { header: "District", key: "district" },
    { header: "Gender", key: "gender" },
    { header: "Age group", key: "ageGroup" },
    { header: "Education", key: "educationLevel" },
    { header: "Yrs exp.", key: "yearsExperience" },
    { header: "Work focus", key: "mainWorkFocus" },
    { header: "Status", key: "status" },
    { header: "Submitted", key: "submittedAt" },
  ],
  skills: [
    { header: "Certification", key: "hasCertification" },
    { header: "Confidence trad.", key: "confidenceTraditionalRefrigerants" },
    { header: "Confidence LGW", key: "confidenceLowGwpRefrigerants" },
    { header: "Formal training", key: "hasFormalTraining" },
  ],
  tools: [
    { header: "Tools access", key: "accessToTools" },
    { header: "Parts access", key: "accessToSpareParts" },
    { header: "LGW refrig. access", key: "accessToLowGwpRefrigerants" },
  ],
  challenges: [
    { header: "Biggest challenge", key: "biggestDailyChallenge" },
    { header: "Load shedding", key: "loadSheddingFrequency" },
    { header: "PPE access", key: "ppeAccess" },
  ],
  energy: [
    { header: "EE installs", key: "installsEnergyEfficient" },
  ],
  consent: [
    { header: "Preferred lang.", key: "preferredLanguage" },
    { header: "Public registry", key: "consentToPublicRegistry" },
  ],
};

function labelValue(row: TechnicianSurvey, key: keyof TechnicianSurvey): string {
  const val = row[key];
  if (val === null || val === undefined) return "";
  if (key === "province") return PROVINCE_LABELS[val as Province] ?? String(val);
  if (key === "mainWorkFocus") {
    const arr = (val as MainWorkFocus[]) ?? [];
    return arr.map((f) => MAIN_WORK_FOCUS_LABELS[f] ?? f).join(", ");
  }
  if (key === "hasCertification") return HAS_CERTIFICATION_LABELS[val as HasCertification] ?? String(val);
  if (key === "submittedAt") {
    const d = val instanceof Date ? val : new Date(String(val));
    return d.toLocaleDateString("en-GB");
  }
  if (Array.isArray(val)) return val.join(", ");
  if (typeof val === "boolean") return val ? "Yes" : "No";
  return String(val);
}

export async function pdfExporter(
  rows: TechnicianSurvey[],
  opts: ExportOptions,
  filterSummary = "",
): Promise<ExportResult> {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  // Build columns from sections
  const activeCols: { header: string; key: keyof TechnicianSurvey }[] = [];
  for (const [section, cols] of Object.entries(PDF_SECTION_COLUMNS)) {
    if (opts.sections[section as keyof typeof opts.sections]) {
      activeCols.push(...cols);
    }
  }

  // Cap at 14 cols for readability
  const visibleCols = activeCols.slice(0, 14);

  const nameOrIdHeader = opts.anonymise ? "Anon ID" : "Name";

  const headers = visibleCols.map((c) => (c.key === "id" ? nameOrIdHeader : c.header));

  const bodyRows = await Promise.all(
    rows.map(async (row) => {
      return visibleCols.map((col) => {
        if (col.key === "id") {
          if (opts.anonymise) {
            // stableHash is async; we'll resolve in a second pass
            return "__HASH__" + row.id;
          }
          if (!opts.anonymise) {
            return `${row.firstName} ${row.surname}`;
          }
        }
        return labelValue(row, col.key);
      });
    }),
  );

  // Resolve hashes
  const resolvedRows = await Promise.all(
    bodyRows.map(async (cells) =>
      Promise.all(
        cells.map(async (cell) => {
          if (typeof cell === "string" && cell.startsWith("__HASH__")) {
            return stableHash(cell.slice(8));
          }
          return cell;
        }),
      ),
    ),
  );

  const now = new Date();
  const generatedAt = now.toLocaleString("en-GB", { timeZone: "Africa/Harare" });

  // Title
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Zimbabwe RAC Technician Registry — NOU / HEVACRAZ", 14, 14);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  const subtitle = [
    filterSummary ? `Filters: ${filterSummary}` : "Filters: none",
    `Generated: ${generatedAt}`,
    `Records: ${rows.length}`,
  ].join("   |   ");
  doc.text(subtitle, 14, 20);

  doc.setTextColor(0, 0, 0);

  autoTable(doc, {
    head: [headers],
    body: resolvedRows,
    startY: 25,
    styles: { fontSize: 7, cellPadding: 1.5, overflow: "ellipsize" },
    headStyles: { fillColor: [15, 118, 110], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    margin: { left: 14, right: 14 },
    didDrawPage: (data) => {
      // Footer
      const pageCount = (doc as jsPDF & { internal: { getNumberOfPages: () => number } }).internal.getNumberOfPages();
      doc.setFontSize(7);
      doc.setTextColor(120, 120, 120);
      doc.text(
        `Page ${data.pageNumber} of ${pageCount}`,
        doc.internal.pageSize.getWidth() - 14,
        doc.internal.pageSize.getHeight() - 6,
        { align: "right" },
      );
    },
  });

  const buffer = Buffer.from(doc.output("arraybuffer"));

  return {
    buffer,
    contentType: "application/pdf",
    filename: `technicians-${Date.now()}.pdf`,
  };
}
