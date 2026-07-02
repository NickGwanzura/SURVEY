import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

import { AGE_GROUP_LABELS, GENDER_LABELS, YEARS_EXPERIENCE_LABELS } from "@/lib/constants/ageGroups";
import { EDUCATION_LEVEL_LABELS } from "@/lib/constants/educationLevels";
import { PROVINCE_LABELS } from "@/lib/constants/provinces";
import {
  BIGGEST_DAILY_CHALLENGE_LABELS,
  ENERGY_EFFICIENT_INSTALL_LABELS,
  LOAD_SHEDDING_FREQUENCY_LABELS,
  PPE_ACCESS_LABELS,
  RECOVERY_EQUIPMENT_USE_LABELS,
} from "@/lib/constants/challenges";
import {
  CERTIFICATION_TYPE_LABELS,
  HAS_CERTIFICATION_LABELS,
} from "@/lib/constants/refrigerants";
import { MAIN_WORK_FOCUS_LABELS } from "@/lib/constants/workFocus";

// ─── Brand constants ────────────────────────────────────────────────────────

const BRAND_COLOR: [number, number, number] = [15, 118, 110];   // #0F7670
const BRAND_LIGHT: [number, number, number] = [234, 247, 246];   // #EAF7F6
const SLATE_900: [number, number, number] = [15, 23, 42];
const SLATE_500: [number, number, number] = [100, 116, 139];
const SLATE_300: [number, number, number] = [203, 213, 225];
const WHITE: [number, number, number] = [255, 255, 255];

// ─── Chart color palette (monochromatic teal scale + accent) ─────────────────

const CHART_COLORS: [number, number, number][] = [
  [15, 118, 110],   // #0F7670 — brand
  [44, 162, 152],   // lighter teal 1
  [73, 193, 183],   // lighter teal 2
  [115, 213, 206],  // lighter teal 3
  [157, 228, 223],  // lighter teal 4
  [194, 240, 237],  // lighter teal 5
  [215, 248, 246],  // lighter teal 6
  [233, 251, 250],  // lighter teal 7
  [245, 253, 252],  // lighter teal 8
  [250, 254, 254],  // lighter teal 9
];

function getChartColor(i: number): [number, number, number] {
  return CHART_COLORS[i % CHART_COLORS.length];
}

// ─── Label helpers ──────────────────────────────────────────────────────────

const LABEL_MAPS: Record<string, Record<string, string>> = {
  ageGroup: AGE_GROUP_LABELS,
  gender: GENDER_LABELS,
  educationLevel: EDUCATION_LEVEL_LABELS,
  yearsExperience: YEARS_EXPERIENCE_LABELS,
  province: PROVINCE_LABELS,
  hasFormalTraining: { true: "Yes", false: "No" },
  hasCertification: HAS_CERTIFICATION_LABELS,
  biggestDailyChallenge: BIGGEST_DAILY_CHALLENGE_LABELS,
  loadSheddingFrequency: LOAD_SHEDDING_FREQUENCY_LABELS,
  refrigerantRecoveryEquipmentUse: RECOVERY_EQUIPMENT_USE_LABELS,
  ppeAccess: PPE_ACCESS_LABELS,
  installsEnergyEfficient: ENERGY_EFFICIENT_INSTALL_LABELS,
  mainWorkFocus: MAIN_WORK_FOCUS_LABELS,
  certificationType: CERTIFICATION_TYPE_LABELS,
};

function resolveLabel(key: string, value: string | number | boolean): string {
  const labelMap = LABEL_MAPS[key];
  if (labelMap) {
    const strVal = String(value);
    return labelMap[strVal] ?? strVal.replace(/_/g, " ");
  }
  return String(value).replace(/_/g, " ");
}

// ─── Report metadata ────────────────────────────────────────────────────────

type ReportMeta = {
  title: string;
  subtitle: string;
  tableGroups: {
    title: string;
    rows: { label: string; count: number; percent: string }[];
  }[];
};

// ─── Build report meta from raw data ────────────────────────────────────────

function buildReportMeta(
  reportType: string,
  data: Record<string, { label: any; count: number }[]>,
): ReportMeta {
  const titles: Record<string, string> = {
    methodology: "Methodology & Readiness Report",
    "skills-gap": "Skills Gap Analysis",
    "tools-needs": "Tools & Equipment Needs",
    "barrier-analysis": "Barrier Analysis",
    "geo-mapping": "Geo Mapping",
    "achievement-gaps": "Confirmation of Achievement and Residual Gaps",
  };

  const subtitles: Record<string, string> = {
    methodology: "Respondent demographics and readiness indicators",
    "skills-gap": "Analysis of current skills versus required competencies",
    "tools-needs": "Assessment of required tools and equipment based on survey data",
    "barrier-analysis": "Analysis of barriers to entry and operational challenges",
    "geo-mapping": "Geographic distribution of survey participants and findings",
    "achievement-gaps": "Evaluation of achievements against goals and identification of remaining gaps",
  };

  const tableTitles: Record<string, Record<string, string>> = {
    methodology: {
      ageGroup: "Age Group Distribution",
      gender: "Gender Breakdown",
      educationLevel: "Education Level",
      yearsExperience: "Years of Experience",
    },
    "skills-gap": {
      training: "Formal Training Status",
      certification: "Certification Status",
      confTraditional: "Confidence: Traditional Refrigerants",
      confLowGwp: "Confidence: Low-GWP Refrigerants",
    },
    "tools-needs": {
      tools: "Access to Tools",
      parts: "Access to Spare Parts",
      lowGwp: "Access to Low-GWP Refrigerants",
      recoveryUse: "Refrigerant Recovery Equipment Use",
      ppe: "PPE Access",
    },
    "barrier-analysis": {
      dailyChallenges: "Biggest Daily Challenge",
      importCosts: "Obstacle: High Import Costs",
      forex: "Obstacle: Forex Shortages",
      loadShedding: "Load Shedding Frequency",
    },
    "geo-mapping": {
      provinces: "Submissions by Province",
      cities: "Submissions by City",
    },
    "achievement-gaps": {
      energyInstalls: "Energy Efficient Installations",
      statuses: "Overall Survey Completion Status",
    },
  };

  const title = titles[reportType] ?? "Report";
  const subtitle = subtitles[reportType] ?? "";
  const tableTitleMap = tableTitles[reportType] ?? {};

  const tableGroups = Object.entries(data).map(([key, rows]) => {
    const total = rows.reduce((sum, r) => sum + r.count, 0);
    return {
      title: tableTitleMap[key] ?? key.replace(/_/g, " "),
      rows: rows.map((r) => ({
        label: resolveLabel(key, r.label),
        count: r.count,
        percent: total > 0 ? ((r.count / total) * 100).toFixed(1) : "0.0",
      })),
    };
  });

  return { title, subtitle, tableGroups };
}

// ─── Draw branded header on each page ───────────────────────────────────────

function drawHeader(doc: jsPDF, reportMeta: ReportMeta): void {
  // Brand bar at top
  doc.setFillColor(...BRAND_COLOR);
  doc.rect(0, 0, doc.internal.pageSize.getWidth(), 3, "F");

  // Logo area — simple brand mark
  doc.setFillColor(...BRAND_COLOR);
  doc.circle(18, 14, 4, "F");

  doc.setFillColor(...WHITE);
  doc.circle(18, 14, 2, "F");

  // Title
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...BRAND_COLOR);
  doc.text("Zimbabwe RAC Technician Registry", 27, 12);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...SLATE_500);
  doc.text("NOU / HEVACRAZ  •  National Survey Report", 27, 17);

  // Report title on right side
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...SLATE_900);
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.text(reportMeta.title, pageWidth - 20, 12, { align: "right" });

  // Divider
  doc.setDrawColor(...SLATE_300);
  doc.line(14, 22, pageWidth - 14, 22);
}

// ─── Draw footer on each page ────────────────────────────────────────────────

function drawFooter(doc: jsPDF, pageNumber: number, totalPages: number): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  doc.setDrawColor(...SLATE_300);
  doc.line(14, pageHeight - 12, pageWidth - 14, pageHeight - 12);

  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...SLATE_500);

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Africa/Harare",
  });

  doc.text(`Generated: ${dateStr}`, 14, pageHeight - 6);
  doc.text(`Page ${pageNumber} of ${totalPages}`, pageWidth - 14, pageHeight - 6, { align: "right" });
}

// ─── Chart drawing functions ────────────────────────────────────────────────

/**
 * Draw a horizontal bar chart on the PDF.
 * Each bar is sized by its percentage, with a label on the left and value on the right.
 */
function drawBarChart(
  doc: jsPDF,
  rows: { label: string; count: number; percent: string }[],
  x: number,
  topY: number,
  maxChartWidth: number,
): number {
  const barHeight = 4.5;
  const gap = 2.5;
  const labelWidth = 55;
  const valueWidth = 18;
  const chartH = rows.length * (barHeight + gap) - gap;
  const totalMaxWidth = maxChartWidth - labelWidth - valueWidth;
  const maxPct = Math.max(...rows.map((r) => parseFloat(r.percent)), 5);

  // Section label
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...SLATE_500);
  doc.text("Distribution", x, topY - 0.5);

  doc.setFont("helvetica", "normal");
  const startY = topY + 2;

  // Light background for chart area
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(x - 1, startY - 1, maxChartWidth + 2, chartH + 4, 1, 1, "F");

  rows.forEach((row, i) => {
    const pct = parseFloat(row.percent);
    const y = startY + i * (barHeight + gap);
    const barW = Math.max((pct / maxPct) * totalMaxWidth, 2); // min 2mm
    const color = getChartColor(i);

    // Label
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...SLATE_900);
    const label = row.label.length > 22 ? row.label.slice(0, 20) + "…" : row.label;
    doc.text(label, x, y + barHeight - 0.5);

    // Bar
    doc.setFillColor(...color);
    doc.roundedRect(x + labelWidth, y, barW, barHeight, 1, 1, "F");

    // Value
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...BRAND_COLOR);
    doc.text(`${row.percent}%`, x + labelWidth + barW + 1.5, y + barHeight - 0.5);

    // Light grid line
    if (i < rows.length - 1) {
      doc.setDrawColor(230, 235, 240);
      doc.setLineWidth(0.15);
      doc.line(x + labelWidth, y + barHeight + gap / 2, x + maxChartWidth, y + barHeight + gap / 2);
    }
  });

  return startY + chartH + 3;
}

/**
 * Draw a pie chart on the PDF using polygon arc approximation.
 * Each slice is a filled polygon from center → arc points → back to center.
 */
function drawPieChart(
  doc: jsPDF,
  rows: { label: string; count: number; percent: string }[],
  cx: number,
  cy: number,
  radius: number,
  legendX: number,
  legendTopY: number,
): void {
  const total = rows.reduce((s, r) => s + parseFloat(r.percent), 0);
  if (total === 0) return;

  let currentAngle = -Math.PI / 2; // start at 12 o'clock

  rows.forEach((row, i) => {
    const sliceAngle = (parseFloat(row.percent) / 100) * 2 * Math.PI;
    if (sliceAngle <= 0) return;

    const steps = Math.max(6, Math.ceil(sliceAngle * 180 / Math.PI / 3));
    const color = getChartColor(i);

    doc.setFillColor(...color);
    doc.setDrawColor(...WHITE);
    doc.setLineWidth(0.3);

    // Build polygon: center → arc points → back to center
    const pts: [number, number][] = [];

    // First offset: from center to first point on arc
    const firstDx = radius * Math.cos(currentAngle);
    const firstDy = radius * Math.sin(currentAngle);
    pts.push([firstDx, firstDy]);

    let prevX = firstDx;
    let prevY = firstDy;

    for (let s = 1; s <= steps; s++) {
      const t = s / steps;
      const angle = currentAngle + sliceAngle * t;
      const px = radius * Math.cos(angle);
      const py = radius * Math.sin(angle);
      pts.push([px - prevX, py - prevY]);
      prevX = px;
      prevY = py;
    }

    // Close back to center
    pts.push([-prevX, -prevY]);

    doc.lines(pts, cx, cy, [1, 1], "DF");

    // Legend entry (to the right)
    const ly = legendTopY + i * 5;
    doc.setFillColor(...color);
    doc.rect(legendX, ly, 3.5, 3.5, "F");
    doc.setDrawColor(...SLATE_300);
    doc.rect(legendX, ly, 3.5, 3.5, "S");

    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...SLATE_900);
    const label = row.label.length > 26 ? row.label.slice(0, 24) + "…" : row.label;
    doc.text(label, legendX + 5, ly + 2.7);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(...BRAND_COLOR);
    doc.text(`${row.percent}%`, legendX + 5 + doc.getTextWidth(label) + 3, ly + 2.7);

    currentAngle += sliceAngle;
  });

  // Center dot for aesthetics
  doc.setFillColor(...WHITE);
  doc.circle(cx, cy, 1.5, "F");
}

/**
 * Decide whether to show a bar chart or a pie chart for a data group.
 * Pie charts work well for 2–8 categories with distinct shares;
 * bar charts are used for larger or more granular datasets.
 */
function shouldUsePieChart(rows: { label: string; percent: string }[]): boolean {
  return rows.length >= 2 && rows.length <= 8;
}

// ─── Main export function ────────────────────────────────────────────────────

export function generateReportPdf(
  reportType: string,
  data: Record<string, { label: any; count: number }[]>,
): Buffer {
  const meta = buildReportMeta(reportType, data);
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();

  // ── Page 1: Cover page ──
  const pageHeight = doc.internal.pageSize.getHeight();

  // Full brand background
  doc.setFillColor(...BRAND_COLOR);
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  // Subtle circle decoration (lighter brand tones, since jsPDF doesn't support fill alpha)
  doc.setFillColor(200, 225, 224);
  doc.circle(pageWidth / 2, pageHeight * 0.35, 70, "F");
  doc.setFillColor(180, 210, 208);
  doc.circle(pageWidth * 0.8, pageHeight * 0.7, 50, "F");

  // Brand mark
  doc.setFillColor(...WHITE);
  doc.circle(28, 50, 6, "F");
  doc.setFillColor(...BRAND_COLOR);
  doc.circle(28, 50, 3, "F");

  // Title block
  doc.setFontSize(26);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...WHITE);
  doc.text("Zimbabwe RAC", 28, 72);
  doc.text("Technician Registry", 28, 94);

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...BRAND_LIGHT);
  doc.text("NOU / HEVACRAZ", 28, 110);

  // Report title
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...WHITE);
  doc.text(meta.title, 28, 145);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(200, 225, 224);
  doc.text(meta.subtitle, 28, 158);

  // Meta info
  doc.setFontSize(9);
  doc.setTextColor(180, 210, 208);
  const now = new Date();
  doc.text(
    `Generated: ${now.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Africa/Harare",
    })}`,
    28,
    180,
  );

  const totalRows = meta.tableGroups.reduce((sum, g) => sum + g.rows.length, 0);
  doc.text(`Tables: ${meta.tableGroups.length}  •  Data points: ${totalRows}`, 28, 192);

  // Separator
  doc.setDrawColor(...WHITE);
  doc.setLineWidth(0.5);
  doc.line(28, 205, pageWidth - 28, 205);

  doc.setFontSize(8);
  doc.setTextColor(180, 210, 208);
  doc.text("Confidential — For authorized use only", 28, 215);

  // ── Data pages ──
  for (let i = 0; i < meta.tableGroups.length; i++) {
    const group = meta.tableGroups[i];
    doc.addPage();

    // Header on each data page
    drawHeader(doc, meta);

    // Table title
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...SLATE_900);
    doc.text(group.title, 14, 32);

    // Table
    const tableHeaders = ["Category", "Count", "%"];
    const tableBody = group.rows.map((r) => [r.label, String(r.count), `${r.percent}%`]);

    autoTable(doc, {
      head: [tableHeaders],
      body: tableBody,
      startY: 37,
      styles: {
        fontSize: 9,
        cellPadding: 3,
        overflow: "ellipsize",
        font: "helvetica",
      },
      headStyles: {
        fillColor: BRAND_COLOR,
        textColor: 255,
        fontStyle: "bold",
        fontSize: 9,
        halign: "left",
      },
      columnStyles: {
        0: { cellWidth: "auto" },
        1: { cellWidth: 30, halign: "right" },
        2: { cellWidth: 30, halign: "right" },
      },
      alternateRowStyles: { fillColor: BRAND_LIGHT },
      margin: { left: 14, right: 14 },
      didDrawPage: (tableData) => {
        // Footer on each data page
            drawFooter(doc, tableData.pageNumber, doc.getNumberOfPages());
      },
    });

    // Summary bar at bottom of table
    const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY ?? 50;
    const totalCount = group.rows.reduce((sum, r) => sum + r.count, 0);

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...BRAND_COLOR);

    if (group.rows.length > 1) {
      doc.setDrawColor(...BRAND_COLOR);
      doc.setLineWidth(0.3);

      const summaryY = finalY + 8;
      doc.line(14, summaryY, pageWidth - 14, summaryY);
      doc.text(`Total respondents: ${totalCount}`, 14, summaryY + 5);

      // ── Draw chart ──
      const chartTopY = summaryY + 10;
      const pageBottom = doc.internal.pageSize.getHeight() - 16;
      const chartRows = group.rows.filter((r) => parseFloat(r.percent) > 0);

      const chartHeight = shouldUsePieChart(chartRows)
        ? 90  // pie chart needs room for legend
        : chartRows.length * 7 + 12;

      const fitsOnPage = chartTopY + chartHeight < pageBottom;

      if (!fitsOnPage) {
        doc.addPage();
        drawHeader(doc, meta);
        drawFooter(doc, doc.getNumberOfPages(), doc.getNumberOfPages());
      }

      const actualTopY = fitsOnPage ? chartTopY : 32;

      if (shouldUsePieChart(chartRows)) {
        // Pie chart — centered, with legend on the right
        const pieCx = 55;
        const pieCy = actualTopY + 32;
        const pieR = Math.min(30, (chartRows.length * 5));
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...SLATE_900);
        doc.text("Distribution by Category", 14, actualTopY + 2);

        drawPieChart(doc, chartRows, pieCx, pieCy, pieR, 105, actualTopY + 12);
      } else {
        // Bar chart
        const chartWidth = pageWidth - 14 - 14; // ~182mm
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...SLATE_900);
        doc.text("Distribution by Category", 14, actualTopY + 2);

        drawBarChart(doc, chartRows, 14, actualTopY + 8, chartWidth);
      }
    }
  }

  // ── Final page: Notes ──
  doc.addPage();
  drawHeader(doc, meta);

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...SLATE_900);
  doc.text("About This Report", 14, 35);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...SLATE_500);

  const notes = [
    `Report: ${meta.title}`,
    `Generated: ${now.toLocaleString("en-GB", { timeZone: "Africa/Harare" })}`,
    `Source: Zimbabwe RAC Technician Registry survey data`,
    `Methodology: Data collected via technician survey administered by NOU / HEVACRAZ.`,
    "",
    "This report contains aggregated, anonymised data. Individual responses are",
    "not identified. Figures represent counts and percentages of valid responses.",
    "",
    "For questions or clarifications, contact the NOU / HEVACRAZ secretariat.",
  ];

  notes.forEach((line, idx) => {
    doc.text(line, 14, 48 + idx * 5);
  });

  // Footer
  drawFooter(doc, doc.getNumberOfPages(), doc.getNumberOfPages());

  const buffer = Buffer.from(doc.output("arraybuffer"));
  return buffer;
}
