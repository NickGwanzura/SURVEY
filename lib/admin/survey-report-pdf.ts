import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const BRAND: [number, number, number] = [15, 118, 110];
const BRAND_DARK: [number, number, number] = [10, 85, 80];
const BRAND_LIGHT: [number, number, number] = [234, 247, 246];
const S900: [number, number, number] = [15, 23, 42];
const S800: [number, number, number] = [30, 41, 59];
const S700: [number, number, number] = [51, 65, 85];
const S600: [number, number, number] = [71, 85, 105];
const S500: [number, number, number] = [100, 116, 139];
const S300: [number, number, number] = [203, 213, 225];
const S200: [number, number, number] = [226, 232, 240];
const WHITE: [number, number, number] = [255, 255, 255];
const AMBER: [number, number, number] = [245, 158, 11];
const RED: [number, number, number] = [220, 38, 38];
const GREEN: [number, number, number] = [22, 163, 74];

const CC: [number, number, number][] = [
  [15, 118, 110], [44, 162, 152], [73, 193, 183], [115, 213, 206],
  [157, 228, 223], [194, 240, 237], [215, 248, 246], [233, 251, 250],
];

const M = 14;
const MAX_Y = 258;
const PW = 210;
const PH = 297;
const CW = PW - M - M;

function gc(i: number): [number, number, number] { return CC[i % CC.length]; }

function cpb(doc: jsPDF, y: number): number {
  if (y > MAX_Y) { addPage(doc); return 30; }
  return y;
}

function hdr(doc: jsPDF): void {
  doc.setFillColor(...BRAND); doc.rect(0, 0, PW, 3, "F");
  doc.setFillColor(...BRAND); doc.circle(18, 13, 3.5, "F");
  doc.setFillColor(...WHITE); doc.circle(18, 13, 1.5, "F");
  doc.setFontSize(13); doc.setFont("helvetica", "bold"); doc.setTextColor(...BRAND);
  doc.text("Zimbabwe RAC Technician Registry", 26, 10);
  doc.setFontSize(6); doc.setFont("helvetica", "normal"); doc.setTextColor(...S600);
  doc.text("HEVACRAZ . UNEP . NOU . Technician Survey Report", 26, 15);
  doc.setDrawColor(...S200); doc.line(M, 19, PW - M, 19);
}

function ftr(doc: jsPDF, pn: number, tp: number): void {
  doc.setDrawColor(...S200); doc.line(M, PH - 13, PW - M, PH - 13);
  doc.setFontSize(5.5); doc.setFont("helvetica", "normal"); doc.setTextColor(...S500);
  doc.text("HEVACRAZ working under the guidance of UNEP and NOU", PW / 2, PH - 7, { align: "center" });
  doc.text("Page " + pn + " of " + tp, PW - M, PH - 7, { align: "right" });
}

function addPage(doc: jsPDF): void { doc.addPage(); hdr(doc); }

function st(doc: jsPDF, title: string, y: number): number {
  doc.setFontSize(13); doc.setFont("helvetica", "bold"); doc.setTextColor(...BRAND);
  doc.text(title, M, y);
  doc.setDrawColor(...BRAND); doc.setLineWidth(0.4); doc.line(M, y + 1.5, PW - M, y + 1.5);
  return y + 7;
}

function sst(doc: jsPDF, title: string, y: number): number {
  doc.setFontSize(10); doc.setFont("helvetica", "bold"); doc.setTextColor(...S800);
  doc.text(title, M, y); return y + 5;
}

function bt(doc: jsPDF, text: string, y: number): number {
  doc.setFontSize(8.5); doc.setFont("helvetica", "normal"); doc.setTextColor(...S700);
  const l = doc.splitTextToSize(text, CW);
  for (const ln of l) { y = cpb(doc, y); doc.text(ln, M, y); y += 4; }
  return y + 1.5;
}

function ab(doc: jsPDF, text: string, y: number): number {
  doc.setFontSize(7.5); doc.setFont("helvetica", "italic"); doc.setTextColor(...S600);
  const l = doc.splitTextToSize(text, CW - 4);
  for (const ln of l) { y = cpb(doc, y); doc.text(ln, M + 2, y); y += 3.8; }
  return y + 2;
}

function ah(doc: jsPDF, y: number): number {
  doc.setDrawColor(...BRAND); doc.setLineWidth(0.25); doc.line(M, y - 1, M + 35, y - 1);
  doc.setFontSize(7.5); doc.setFont("helvetica", "bold"); doc.setTextColor(...BRAND);
  doc.text("Interpretation", M, y); return y + 4;
}

function barChart(doc: jsPDF, rows: { label: string; count: number; percent: string }[], x: number, ty: number, mw: number): number {
  const bh = 4; const gap = 1.5; const lw = 46;
  const ch = rows.length * (bh + gap) - gap;
  const tmw = mw - lw - 18;
  const mp = Math.max(...rows.map((r) => parseFloat(r.percent)), 5);
  if (ty + ch + 8 > PH - 14) { addPage(doc); ty = 30; }
  const sy = ty;
  doc.setFillColor(248, 250, 252); doc.roundedRect(x - 1, sy - 1, mw + 2, ch + 3, 1, 1, "F");
  rows.forEach((row, i) => {
    const pct = parseFloat(row.percent);
    const y = sy + i * (bh + gap);
    const bw = Math.max((pct / mp) * tmw, 2);
    doc.setFontSize(6.5); doc.setFont("helvetica", "normal"); doc.setTextColor(...S800);
    doc.text(row.label.length > 18 ? row.label.slice(0, 16) + ".." : row.label, x, y + bh - 0.5);
    doc.setFillColor(...gc(i)); doc.roundedRect(x + lw, y, bw, bh, 1, 1, "F");
    doc.setFontSize(6.5); doc.setFont("helvetica", "bold"); doc.setTextColor(...BRAND);
    doc.text(row.percent + "%", x + lw + bw + 1.5, y + bh - 0.5);
    if (i < rows.length - 1) { doc.setDrawColor(232, 237, 242); doc.setLineWidth(0.12); doc.line(x + lw, y + bh + gap / 2, x + mw, y + bh + gap / 2); }
  });
  return sy + ch + 3;
}

function pieChart(doc: jsPDF, rows: { label: string; count: number; percent: string }[], cx: number, cy: number, r: number, lx: number, lty: number): void {
  const total = rows.reduce((s, r) => s + parseFloat(r.percent), 0);
  if (total === 0) return;
  let a = -Math.PI / 2;
  rows.forEach((row, i) => {
    const sa = (parseFloat(row.percent) / 100) * 2 * Math.PI;
    if (sa <= 0) return;
    const steps = Math.max(6, Math.ceil((sa * 180) / Math.PI / 3));
    const color = gc(i);
    doc.setFillColor(...color); doc.setDrawColor(...WHITE); doc.setLineWidth(0.3);
    const pts: [number, number][] = [];
    const fdx = r * Math.cos(a); const fdy = r * Math.sin(a);
    pts.push([fdx, fdy]);
    let px = fdx; let py = fdy;
    for (let s = 1; s <= steps; s++) {
      const t = s / steps; const angle = a + sa * t;
      const nx = r * Math.cos(angle); const ny = r * Math.sin(angle);
      pts.push([nx - px, ny - py]); px = nx; py = ny;
    }
    pts.push([-px, -py]);
    doc.lines(pts, cx, cy, [1, 1], "DF");
    const ly = lty + i * 4.5;
    doc.setFillColor(...color); doc.rect(lx, ly, 3, 3, "F");
    doc.setDrawColor(...S300); doc.rect(lx, ly, 3, 3, "S");
    doc.setFontSize(6); doc.setFont("helvetica", "normal"); doc.setTextColor(...S800);
    const lbl = row.label.length > 20 ? row.label.slice(0, 18) + ".." : row.label;
    doc.text(lbl, lx + 4.5, ly + 2.2);
    doc.setFont("helvetica", "bold"); doc.setTextColor(...BRAND);
    doc.text(row.percent + "%", lx + 4.5 + doc.getTextWidth(lbl) + 2, ly + 2.2);
    a += sa;
  });
  doc.setFillColor(...WHITE); doc.circle(cx, cy, 1.5, "F");
}

function shouldUsePie(rows: { label: string; percent: string }[]): boolean {
  return rows.length >= 2 && rows.length <= 7;
}

function rt(doc: jsPDF, title: string, headers: string[], body: string[][], sy: number): number {
  let y = cpb(doc, sy);
  if (title) { doc.setFontSize(9); doc.setFont("helvetica", "bold"); doc.setTextColor(...S700); doc.text(title, M, y); y += 2; }
  autoTable(doc, {
    head: [headers], body, startY: y + 1,
    styles: { fontSize: 7, cellPadding: 1.8, overflow: "ellipsize", font: "helvetica" },
    headStyles: { fillColor: BRAND, textColor: 255, fontStyle: "bold", fontSize: 7, halign: "left" },
    alternateRowStyles: { fillColor: BRAND_LIGHT },
    margin: { left: M, right: M },
    tableLineColor: S200, tableLineWidth: 0.12,
  });
  return (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 3;
}

function rtc(doc: jsPDF, title: string, rows: { label: string; count: number; percent: string }[], show: boolean, sy: number): number {
  const hdrs = ["Category", "Count", "%"];
  const body = rows.map((r) => [r.label, String(r.count), r.percent + "%"]);
  let y = rt(doc, title, hdrs, body, sy);
  if (show && rows.length > 1) {
    const cr = rows.filter((r) => parseFloat(r.percent) > 0);
    if (cr.length > 0) {
      if (y > PH - 48) { addPage(doc); y = 30; }
      if (shouldUsePie(cr)) {
        doc.setFontSize(8); doc.setFont("helvetica", "bold"); doc.setTextColor(...S500);
        doc.text("Distribution", M, y);
        pieChart(doc, cr, 42, y + 24, Math.min(20, cr.length * 3), 80, y + 5);
        y = y + 24 + Math.min(20, cr.length * 3) + 3;
      } else {
        doc.setFontSize(8); doc.setFont("helvetica", "bold"); doc.setTextColor(...S500);
        doc.text("Distribution", M, y);
        y = barChart(doc, cr, M, y + 3, CW);
      }
    }
  }
  return y + 1;
}

export type ProvinceTrainingRow = {
  province: string; noFormalTraining: number; total: number; rate: number;
};
export type ProvinceCertRow = {
  province: string; certified: number; total: number; rate: number;
};
export type ProvincePpeRow = {
  province: string; noPpe: number; total: number; rate: number;
};

export type SurveyReportPdfInput = {
  reportTitle: string; surveyName: string;
  reportingPeriodStart: string; reportingPeriodEnd: string;
  totalResponses: number; generatedDate: string; organizationName: string;
  data: {
    demographics: {
      ageGroup: { label: string; count: number; percent: string }[];
      gender: { label: string; count: number; percent: string }[];
      educationLevel: { label: string; count: number; percent: string }[];
      yearsExperience: { label: string; count: number; percent: string }[];
    };
    location: { province: { label: string; count: number; percent: string }[] };
    skills: {
      mainWorkFocus: { label: string; count: number; percent: string }[];
      hasFormalTraining: { label: string; count: number; percent: string }[];
      hasCertification: { label: string; count: number; percent: string }[];
      certificationsHeld: { label: string; count: number; percent: string }[];
      confidenceTraditional: { label: string; count: number; percent: string }[];
      confidenceLowGwp: { label: string; count: number; percent: string }[];
    };
    trainingNeeds: { missingCertifications: { label: string; count: number; percent: string }[] };
    tools: {
      accessToTools: { label: string; count: number; percent: string }[];
      accessToSpareParts: { label: string; count: number; percent: string }[];
      accessToLowGwpRefrigerants: { label: string; count: number; percent: string }[];
      recoveryEquipmentUse: { label: string; count: number; percent: string }[];
      ppeAccess: { label: string; count: number; percent: string }[];
    };
    safety: {
      ppeAccess: { label: string; count: number; percent: string }[];
      ehsBarriers: { label: string; count: number; percent: string }[];
      recoveryEquipmentUse: { label: string; count: number; percent: string }[];
    };
    challenges: {
      biggestDailyChallenge: { label: string; count: number; percent: string }[];
      loadSheddingFrequency: { label: string; count: number; percent: string }[];
      obstacleHighImportCosts: { label: string; count: number; percent: string }[];
      obstacleForexShortages: { label: string; count: number; percent: string }[];
      obstacleUnreliableSuppliers: { label: string; count: number; percent: string }[];
      obstacleCounterfeitProducts: { label: string; count: number; percent: string }[];
      ehsBarriers: { label: string; count: number; percent: string }[];
    };
    energy: { installsEnergyEfficient: { label: string; count: number; percent: string }[] };
  };
  provinceAnalytics?: {
    trainingByProvince: ProvinceTrainingRow[];
    certificationByProvince: ProvinceCertRow[];
    ppeAccessByProvince: ProvincePpeRow[];
  };
  insights?: {
    overview: string; keyFindings: string[]; riskAreas: string[];
    opportunities: string[]; recommendedInterventions: string[]; priorityActions: string[];
  } | null;
};

export function generateSurveyReportPdf(input: SurveyReportPdfInput): Buffer {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  // ===================== PAGE 1: COVER =====================
  doc.setFillColor(...WHITE); doc.rect(0, 0, PW, PH, "F");
  doc.setFillColor(...BRAND); doc.rect(0, 0, PW, 3.5, "F");
  doc.setFillColor(...BRAND_LIGHT); doc.rect(0, 3.5, PW, 2, "F");

  doc.setFillColor(...BRAND); doc.circle(28, 38, 6.5, "F");
  doc.setFillColor(...WHITE); doc.circle(28, 38, 3, "F");
  doc.setFillColor(...BRAND); doc.circle(28, 38, 1.2, "F");

  doc.setFontSize(22); doc.setFont("helvetica", "bold"); doc.setTextColor(...BRAND_DARK);
  doc.text("Zimbabwe RAC", 28, 60);
  doc.text("Technician Registry", 28, 78);

  doc.setDrawColor(...BRAND); doc.setLineWidth(0.6); doc.line(28, 85, PW - 28, 85);
  doc.setFontSize(10); doc.setFont("helvetica", "normal"); doc.setTextColor(...S600);
  doc.text("HEVACRAZ working under the guidance of UNEP and NOU", 28, 97);

  doc.setFontSize(20); doc.setFont("helvetica", "bold"); doc.setTextColor(...BRAND);
  doc.text("Technician Survey Report", 28, 128);

  doc.setDrawColor(...S200); doc.setLineWidth(0.25); doc.line(28, 136, PW - 28, 136);

  doc.setFontSize(8.5); doc.setFont("helvetica", "normal"); doc.setTextColor(...S700);
  const mi = [
    ["Survey:", input.surveyName],
    ["Period:", input.reportingPeriodStart + " to " + input.reportingPeriodEnd],
    ["Generated:", input.generatedDate],
    ["Technicians:", String(input.totalResponses.toLocaleString()) + " respondents"],
    ["Organization:", input.organizationName],
  ];
  let my = 150;
  for (const [lbl, val] of mi) {
    doc.setFont("helvetica", "bold"); doc.setTextColor(...BRAND); doc.text(lbl, 28, my);
    doc.setFont("helvetica", "normal"); doc.setTextColor(...S700); doc.text(val, 58, my);
    my += 6.5;
  }

  doc.setDrawColor(...S200); doc.setLineWidth(0.4); doc.line(28, 200, PW - 28, 200);
  doc.setFontSize(7.5); doc.setFont("helvetica", "italic"); doc.setTextColor(...S500);
  doc.text("Confidential -- For authorized use only", 28, 210);
  doc.setFontSize(6.5); doc.setFont("helvetica", "normal"); doc.setTextColor(...S500);
  doc.text("This report contains confidential survey data collected from RAC technicians across Zimbabwe.", 28, 218);
  doc.text("Distribution is restricted to authorized personnel of HEVACRAZ, UNEP, and NOU.", 28, 225);

  // ===================== PAGE 2: EXECUTIVE SUMMARY =====================
  addPage(doc);
  let y = st(doc, "1. Executive Summary", 30);

  const wt = input.data.skills.hasFormalTraining.find((r) => r.label === "Yes");
  const tp = wt ? wt.percent : "0.0";
  const cert = input.data.skills.hasCertification.find((r) => r.label === "Yes");
  const cp = cert ? cert.percent : "0.0";

  const meta = [
    "Survey: " + input.surveyName,
    "Period: " + input.reportingPeriodStart + " to " + input.reportingPeriodEnd,
    "Total Technicians Surveyed: " + input.totalResponses.toLocaleString(),
    "Formal Training: " + tp + "%  |  Certified: " + cp + "%",
    "Generated: " + input.generatedDate,
  ];
  doc.setFontSize(8); doc.setFont("helvetica", "bold"); doc.setTextColor(...S800);
  for (const ln of meta) { doc.text(ln, M, y); y += 4.2; }
  y += 2;

  if (input.insights) {
    y = bt(doc, input.insights.overview, y); y += 1;
    if (input.insights.keyFindings.length > 0) {
      y = sst(doc, "Key Findings", y);
      for (const finding of input.insights.keyFindings) {
        const l = doc.splitTextToSize("- " + finding, CW - 6);
        doc.setFontSize(7.5); doc.setFont("helvetica", "normal"); doc.setTextColor(...S700);
        for (const ln of l) { y = cpb(doc, y); doc.text(ln, M + 4, y); y += 3.8; }
      }
      y += 2;
    }
    doc.setDrawColor(...BRAND); doc.setLineWidth(0.25); doc.line(M, y, M + 35, y);
    doc.setFontSize(7); doc.setFont("helvetica", "italic"); doc.setTextColor(...S600);
    const note = "This executive summary is prepared by HEVACRAZ, working under the guidance of UNEP and the National Ozone Unit (NOU), as part of the Zimbabwe RAC Technician Registry initiative.";
    const nl = doc.splitTextToSize(note, CW);
    for (const ln of nl) { doc.text(ln, M, y + 3); y += 3.8; }
    y += 3;
  } else {
    y = bt(doc, "Insufficient data to generate an executive summary. Key data points are presented in the sections below.", y);
  }

  // ===================== PAGE 3: NATIONAL OVERVIEW =====================
  addPage(doc);
  y = st(doc, "2. National Overview", 30);

  const topProv = input.data.location.province[0];
  const topChal = input.data.challenges.biggestDailyChallenge[0];
  const studying = input.data.skills.hasCertification.find((r) => r.label === "Currently studying for one");
  const sp = studying ? studying.percent : "0.0";
  const noPpe = input.data.safety.ppeAccess.find((r) => r.label === "No PPE access");
  const npp = noPpe ? noPpe.percent : "0.0";

  doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.setTextColor(...S700);
  doc.text("Total Responses: " + input.totalResponses, M, y); y += 4.5;
  doc.text("Formal Training Rate: " + tp + "% of technicians", M, y); y += 4.5;
  doc.text("Certification Rate: " + cp + "% certified, " + sp + "% studying", M, y); y += 4.5;
  if (topProv) { doc.text("Top Region: " + topProv.label + " (" + topProv.percent + "%)", M, y); y += 4.5; }
  if (topChal) { doc.text("Top Challenge: " + topChal.label + " (" + topChal.percent + "%)", M, y); y += 4.5; }
  doc.text("PPE Gap: " + npp + "% without PPE access", M, y); y += 7;

  y = rtc(doc, "Years of Experience", input.data.demographics.yearsExperience, true, y);
  y = ah(doc, y + 1);
  const expTop = input.data.demographics.yearsExperience[0];
  const expInt = "The experience profile shows that the majority of respondents have " + (expTop ? expTop.label.toLowerCase() : "varying") + " experience. This distribution informs workforce planning: less experienced technicians require structured mentorship and foundational training, while experienced cohorts represent an opportunity for advanced certification and low-GWP upskilling. HEVACRAZ, with support from UNEP and NOU, should develop tiered programmes addressing both entry-level and advanced skill needs.";
  y = ab(doc, expInt, y);

  // ===================== PAGE 4: PROVINCE DISTRIBUTION =====================
  addPage(doc);
  y = st(doc, "3. Province Distribution Analysis", 30);

  y = bt(doc, "This section provides a detailed breakdown of technician respondents by province, including geographic distribution, training gaps, certification rates, and PPE access indicators across Zimbabwe.", y);
  y += 1;

  doc.setFontSize(8.5); doc.setFont("helvetica", "bold"); doc.setTextColor(...S600);
  doc.text("Respondent Distribution by Province", M, y);
  y = barChart(doc, input.data.location.province, M, y + 3, CW);
  y += 2;

  y = ah(doc, y);
  const pCount = input.data.location.province.length;
  const pTop = input.data.location.province[0];
  const pInt = "Survey respondents are distributed across " + pCount + " provinces, with " + (pTop ? pTop.label + " accounting for " + pTop.percent + "%" : "varying representation") + ". This geographic spread is essential for planning provincial outreach. Provinces with lower representation may require targeted awareness campaigns and mobile registration drives to improve coverage and ensure inclusive sector development.";
  y = ab(doc, pInt, y);

  // Province ranking table
  if (input.provinceAnalytics && input.provinceAnalytics.trainingByProvince.length > 0) {
    const sorted = [...input.provinceAnalytics.trainingByProvince].sort((a, b) => b.rate - a.rate);
    const certMap = new Map(input.provinceAnalytics.certificationByProvince.map((r) => [r.province, r.rate]));
    const ppeMap = new Map(input.provinceAnalytics.ppeAccessByProvince.map((r) => [r.province, r.rate]));

    const tableBody = sorted.map((r, idx) => {
      const certRate = certMap.get(r.province) ?? 0;
      const ppeGap = ppeMap.get(r.province) ?? 0;
      const risk = r.rate >= 50 ? "High" : r.rate >= 30 ? "Medium" : "Low";
      return [
        String(idx + 1),
        r.province,
        String(r.total),
        r.rate.toFixed(1) + "%",
        certRate.toFixed(1) + "%",
        ppeGap.toFixed(1) + "%",
        risk,
      ];
    });

    y = cpb(doc, y + 1);
    y = rt(doc, "", ["#", "Province", "Techs", "Train Gap", "Cert Rate", "PPE Gap", "Risk"], tableBody, y);
    y += 1;

    y = ah(doc, y);
    const highestGap = sorted[0];
    const lowestGap = sorted[sorted.length - 1];
    const highRisk = sorted.filter((r) => r.rate >= 50).length;
    const trainGapInt = "Of " + pCount + " provinces, " + highRisk + " show a high-risk training gap (above 50%). " + highestGap.province + " has the highest training deficit at " + highestGap.rate.toFixed(1) + "%, while " + lowestGap.province + " has the lowest at " + lowestGap.rate.toFixed(1) + "%. These disparities directly affect the sector's ability to achieve uniform national competence standards. Under the Kigali Amendment phase-down schedule, every province must reach minimum certification thresholds. HEVACRAZ and NOU should prioritise mobile training units and provincial training hubs in high-risk areas, using low-gap provinces as regional centres of excellence.";
    y = ab(doc, trainGapInt, y);

    y = ah(doc, y);
    const univInt = "Certification rates and PPE access vary significantly by province, reflecting differences in training infrastructure, equipment availability, and enforcement of safety standards. Provinces with low certification rates require targeted examination centre establishment and recognition of prior learning pathways. Those with high PPE access gaps need immediate equipment distribution programmes supported by safety training and compliance monitoring.";
    y = ab(doc, univInt, y);
  }

  // ===================== PAGE 5: DEMOGRAPHICS =====================
  addPage(doc);
  y = st(doc, "4. Technician Demographics", 30);

  y = rtc(doc, "Age Group Distribution", input.data.demographics.ageGroup, true, y);
  y = ah(doc, y + 1);
  const aTop = input.data.demographics.ageGroup[0];
  const aInt = "The workforce is concentrated in the " + (aTop ? aTop.label.toLowerCase() : "middle") + " age bracket. A younger distribution signals strong long-term potential and the need for structured apprenticeship programmes. An older skew would indicate an urgent requirement for youth recruitment and succession planning to ensure sector continuity. Training curricula should be designed to accommodate the predominant age profile while remaining accessible across all age groups.";
  y = ab(doc, aInt, y);

  y = rtc(doc, "Gender Breakdown", input.data.demographics.gender, true, y);
  y = ah(doc, y + 1);
  const maleR = input.data.demographics.gender.find((r) => r.label === "Male");
  const femaleR = input.data.demographics.gender.find((r) => r.label === "Female");
  const mPct = maleR ? maleR.percent : "0";
  const fPct = femaleR ? femaleR.percent : "0";
  const gInt = "The gender distribution shows " + mPct + "% male and " + fPct + "% female participation. This gap reflects a broader industry-wide underrepresentation of women in technical trades. Targeted interventions such as female-focused training cohorts, mentorship schemes, scholarship programmes, and workplace diversity policies can help improve gender balance over time, aligning with UNEP and national gender equity goals.";
  y = ab(doc, gInt, y);

  y = rtc(doc, "Education Level", input.data.demographics.educationLevel, true, y);
  y = ah(doc, y + 1);
  const eTop = input.data.demographics.educationLevel[0];
  const eInt = "Most technicians hold " + (eTop ? eTop.label.toLowerCase() : "secondary") + " education qualifications. This shapes training design: programmes must balance practical hands-on instruction with theoretical components, ensuring accessibility for technicians at varying literacy levels while maintaining rigorous technical standards. Competency-based assessment and visual learning aids are recommended.";
  y = ab(doc, eInt, y);

  y = rtc(doc, "Years of Experience", input.data.demographics.yearsExperience, true, y);
  y = ah(doc, y + 1);
  const xeInt = "Experience distribution reflects sector maturity. A significant cohort of experienced technicians preserves institutional knowledge critical for mentoring and quality assurance. Incoming technicians require structured onboarding and mentorship. Both groups need differentiated support: advanced certification and supervisory training for veterans, and foundational skills development for newcomers.";
  y = ab(doc, xeInt, y);

  // ===================== PAGE 6: SKILLS =====================
  addPage(doc);
  y = st(doc, "5. Skills & Specializations", 30);

  y = rtc(doc, "Technical Trades / Work Focus", input.data.skills.mainWorkFocus, true, y);
  y = ah(doc, y + 1);
  const fTop = input.data.skills.mainWorkFocus[0];
  const fInt = "The most common specialization is " + (fTop ? fTop.label : "general practice") + ". Understanding specialization distribution enables HEVACRAZ and training providers to align course offerings with market demand. Under-represented specializations may indicate either market saturation or untapped growth potential requiring awareness and capacity building. A diversified skills base is essential for sector resilience.";
  y = ab(doc, fInt, y);

  y = cpb(doc, y + 2);
  y = rtc(doc, "Formal Training Status", input.data.skills.hasFormalTraining, true, y);
  y = ah(doc, y + 1);
  const tInt = "With " + tp + "% of technicians formally trained, a significant portion of the workforce operates without structured technical education. This gap affects service quality, safety compliance, and environmental outcomes. Expanding accredited training programmes across all provinces is one of the highest-impact interventions available to NOU and HEVACRAZ. Partnerships with technical colleges and industry associations can accelerate training delivery.";
  y = ab(doc, tInt, y);

  y = cpb(doc, y + 2);
  y = rtc(doc, "Certification Status", input.data.skills.hasCertification, true, y);
  y = ah(doc, y + 1);
  const cInt = "Certification rates directly affect compliance with the Montreal Protocol and Kigali Amendment. Uncertified technicians may lack awareness of proper refrigerant handling procedures, increasing leakage risk and environmental harm. A national certification drive with accessible examination centres in every province, combined with recognition of prior learning pathways, can accelerate certification coverage and strengthen the registry's credibility.";
  y = ab(doc, cInt, y);

  y = cpb(doc, y + 2);
  y = rtc(doc, "Certifications Held", input.data.skills.certificationsHeld, true, y);
  y = ah(doc, y + 1);
  const chInt = "The range of certifications held by technicians maps the current qualification landscape. Under-represented certifications signal opportunities for targeted course development and examination centre establishment. Aligning certification offerings with international standards is essential for workforce mobility, sector professionalisation, and compliance with evolving refrigerant regulations under the Kigali Amendment.";
  y = ab(doc, chInt, y);

  const avgTrad = input.data.skills.confidenceTraditional.reduce(
    (s, r) => s + parseInt(r.label.replace("Level ", "")) * parseInt(r.count.toString()), 0,
  ) / Math.max(input.data.skills.confidenceTraditional.reduce((s, r) => s + r.count, 0), 1);

  y = cpb(doc, y + 2);
  y = rtc(doc, "Confidence: Traditional Refrigerants", input.data.skills.confidenceTraditional, true, y);
  y = ah(doc, y + 1);
  const ctInt = "Average confidence in traditional refrigerants is " + avgTrad.toFixed(1) + "/5. This baseline reflects long-established industry practice, but high confidence in traditional refrigerants does not necessarily translate to competence with alternatives. It may indicate potential resistance to transitioning to low-GWP technologies, requiring targeted change management and hands-on training in new systems.";
  y = ab(doc, ctInt, y);

  y = cpb(doc, y + 2);
  y = rtc(doc, "Confidence: Low-GWP Refrigerants", input.data.skills.confidenceLowGwp, true, y);

  // ===================== PAGE 7: TRAINING NEEDS =====================
  addPage(doc);
  y = st(doc, "6. Training Needs Analysis", 30);

  y = bt(doc, "This section examines certification gaps, skills confidence disparities, and provincial training requirements to identify priority areas for upskilling interventions.", y);

  y = rtc(doc, "Certification Status", input.data.trainingNeeds.missingCertifications, true, y);
  y = ah(doc, y + 1);
  const mc = input.data.trainingNeeds.missingCertifications;
  const nc = mc.find((r) => r.label === "No");
  const ncp = nc ? nc.percent : "0";
  const cnInt = ncp + "% of technicians lack certification. This critical gap must be addressed to ensure safe and competent refrigerant handling, particularly as Zimbabwe transitions to low-GWP alternatives. Fast-track certification programmes, recognition of prior learning, and mobile examination centres in each province can accelerate gap closure and strengthen the national registry.";
  y = ab(doc, cnInt, y);

  y += 1;
  y = sst(doc, "Skills Confidence Gap", y);

  const avgLow = input.data.skills.confidenceLowGwp.reduce(
    (s, r) => s + parseInt(r.label.replace("Level ", "")) * parseInt(r.count.toString()), 0,
  ) / Math.max(input.data.skills.confidenceLowGwp.reduce((s, r) => s + r.count, 0), 1);

  doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.setTextColor(...S700);
  doc.text("Average confidence in traditional refrigerants: " + avgTrad.toFixed(1) + " / 5", M, y); y += 4.5;
  doc.text("Average confidence in low-GWP refrigerants: " + avgLow.toFixed(1) + " / 5", M, y); y += 4.5;
  const g = avgTrad - avgLow;
  const gt = g > 0
    ? "Technicians are " + g.toFixed(1) + " points more confident in traditional refrigerants, indicating a skills gap in newer technologies."
    : "Technicians report similar confidence levels across both refrigerant types.";
  doc.text(gt, M, y); y += 6;

  y = ah(doc, y);
  const cgInt = "The confidence gap of " + Math.abs(g).toFixed(1) + " points between traditional and low-GWP refrigerants is a key workforce readiness indicator. A gap exceeding 1.5 points signals an urgent need for practical training on low-GWP systems. This is critical for Zimbabwe's compliance with the Kigali Amendment phase-down schedule. HEVACRAZ and NOU should prioritise hands-on demonstration centres where technicians can gain direct experience with alternative refrigerants.";
  y = ab(doc, cgInt, y);

  // ===================== PAGE 8: TOOLS & EQUIPMENT =====================
  addPage(doc);
  y = st(doc, "7. Tools & Equipment Access", 30);

  y = bt(doc, "This section analyzes technician access to essential tools, spare parts, low-GWP refrigerants, recovery equipment, and personal protective equipment (PPE). These factors directly affect service quality, safety, regulatory compliance, and environmental outcomes.", y);

  y = rtc(doc, "Access to Tools", input.data.tools.accessToTools, true, y);
  y = ah(doc, y + 1);
  const tHi = input.data.tools.accessToTools.filter((r) => r.label === "Level 4" || r.label === "Level 5").reduce((s, r) => s + r.count, 0);
  const tLo = input.data.tools.accessToTools.filter((r) => r.label === "Level 1" || r.label === "Level 2").reduce((s, r) => s + r.count, 0);
  const tHiP = input.totalResponses > 0 ? (tHi / input.totalResponses * 100).toFixed(1) : "0.0";
  const tLoP = input.totalResponses > 0 ? (tLo / input.totalResponses * 100).toFixed(1) : "0.0";
  const tInt2 = "Only " + tHiP + "% of technicians report high tool access (Level 4-5), while " + tLoP + "% report low access (Level 1-2). This directly affects service quality, safety, and the ability to perform proper refrigerant recovery. Subsidised toolkits, tool-lending programmes, and cooperative equipment ownership models could significantly improve technician effectiveness and environmental compliance.";
  y = ab(doc, tInt2, y);

  y = cpb(doc, y + 2);
  y = rtc(doc, "Access to Spare Parts", input.data.tools.accessToSpareParts, true, y);
  y = ah(doc, y + 1);
  const spInt = "Spare parts availability is critical for timely repairs. Limited access leads to extended downtime and may force technicians to use substandard alternatives, compromising system efficiency and increasing refrigerant leakage. Strengthening the spare parts supply chain, particularly in underserved provinces, is essential for service quality and environmental protection.";
  y = ab(doc, spInt, y);

  y = cpb(doc, y + 2);
  y = rtc(doc, "Access to Low-GWP Refrigerants", input.data.tools.accessToLowGwpRefrigerants, true, y);
  y = ah(doc, y + 1);
  const lgInt = "Low-GWP refrigerant access is essential for the Kigali Amendment transition. Limited availability creates a barrier to practical experience, slowing adoption. Improving import channels, distribution networks, and affordability of alternative refrigerants must proceed alongside training to ensure technicians can apply new skills in practice.";
  y = ab(doc, lgInt, y);

  y = cpb(doc, y + 2);
  y = rtc(doc, "Refrigerant Recovery Equipment", input.data.tools.recoveryEquipmentUse, true, y);
  y = ah(doc, y + 1);
  const nr = input.data.tools.recoveryEquipmentUse.find((r) => r.label.includes("no access") || r.label.includes("No access"));
  const rvInt = "Recovery equipment prevents refrigerant release to the atmosphere. Technicians without access cannot comply with basic environmental regulations. This gap represents a significant emissions risk. Equipment distribution programmes paired with recovery training and compliance enforcement through the registry framework are recommended.";
  y = ab(doc, rvInt, y);

  y = cpb(doc, y + 2);
  y = rtc(doc, "PPE Access", input.data.tools.ppeAccess, true, y);
  y = ah(doc, y + 1);
  const ppInt = npp + "% of technicians lack PPE access. This is a serious safety concern for those working with pressurised systems and potentially hazardous refrigerants. Immediate PPE distribution drives, mandatory safety training for registry membership, and workplace safety enforcement are required to address this gap and prevent occupational injuries.";
  y = ab(doc, ppInt, y);

  // ===================== PAGE 9: SAFETY & COMPLIANCE =====================
  addPage(doc);
  y = st(doc, "8. Safety & Compliance", 30);

  y = bt(doc, "An assessment of technician safety practices, PPE availability, compliance barriers, and recovery equipment usage. Note: This section consolidates safety-related indicators previously presented separately to reduce redundancy and provide a focused view of compliance risks.", y);

  y = rtc(doc, "PPE Access", input.data.safety.ppeAccess, true, y);
  y = ah(doc, y + 1);
  const spInt2 = "PPE access is the foundation of workplace safety in the RAC sector. As noted in the Tools section, the PPE gap directly affects technician well-being and regulatory compliance. Integrating PPE provision with registry membership and making safety training mandatory would strengthen the sector's safety culture and reduce occupational hazards.";
  y = ab(doc, spInt2, y);

  y = cpb(doc, y + 2);
  y = rtc(doc, "EHS Compliance Barriers", input.data.safety.ehsBarriers, true, y);
  y = ah(doc, y + 1);
  const ehInt = "Environmental, Health, and Safety compliance barriers identified by technicians reveal systemic obstacles to best-practice adoption. These barriers span training gaps, equipment shortages, cost constraints, and awareness deficits. Addressing them through a coordinated programme of training, equipment provision, and policy enforcement will be essential for meeting national and international compliance standards.";
  y = ab(doc, ehInt, y);

  y = cpb(doc, y + 2);
  y = rtc(doc, "Recovery Equipment Use", input.data.safety.recoveryEquipmentUse, true, y);
  y = ah(doc, y + 1);
  const srInt = "Recovery equipment usage is a key Montreal Protocol compliance indicator. Data from this section and the Tools section both highlight the same underlying issue: technicians without recovery equipment cannot prevent refrigerant emissions. This cross-sectional finding reinforces the urgency of equipment distribution and training programmes across all provinces.";
  y = ab(doc, srInt, y);

  // ===================== PAGE 10: CHALLENGES =====================
  addPage(doc);
  y = st(doc, "9. Key Challenges", 30);

  y = bt(doc, "This section summarises the most common operational, market, and regulatory challenges facing RAC technicians in Zimbabwe, based on survey responses.", y);

  y = rtc(doc, "Biggest Daily Challenges", input.data.challenges.biggestDailyChallenge, true, y);
  y = ah(doc, y + 1);
  const ct = input.data.challenges.biggestDailyChallenge[0];
  const chInt2 = "The most frequently cited challenge is " + (ct ? '"' + ct.label + '" (' + ct.percent + '%)' : "unknown") + ". This directly informs where HEVACRAZ and partners should focus operational support. Understanding root causes enables interventions that address systemic issues rather than symptoms. Regular challenge tracking through the registry can monitor whether conditions improve over time.";
  y = ab(doc, chInt2, y);

  y = cpb(doc, y + 2);
  y = rtc(doc, "Load Shedding Frequency", input.data.challenges.loadSheddingFrequency, true, y);
  y = ah(doc, y + 1);
  const ldInt = "Load shedding patterns directly affect service delivery, equipment lifespan, and technician productivity. Training curricula should incorporate off-grid system design, battery storage integration, and solar-powered RAC solutions to build resilience against power supply disruptions. This is both an operational necessity and an opportunity to advance sustainable cooling technologies.";
  y = ab(doc, ldInt, y);

  y = cpb(doc, y + 2);
  y = rtc(doc, "Obstacle: High Import Costs", input.data.challenges.obstacleHighImportCosts, true, y);
  y = cpb(doc, y + 2);
  y = rtc(doc, "Obstacle: Forex Shortages", input.data.challenges.obstacleForexShortages, true, y);
  y = cpb(doc, y + 2);
  y = rtc(doc, "Obstacle: Unreliable Suppliers", input.data.challenges.obstacleUnreliableSuppliers, true, y);
  y = cpb(doc, y + 2);
  y = rtc(doc, "Obstacle: Counterfeit Products", input.data.challenges.obstacleCounterfeitProducts, true, y);
  y = cpb(doc, y + 2);
  y = rtc(doc, "EHS Compliance Barriers", input.data.challenges.ehsBarriers, true, y);

  y = ah(doc, y + 1);
  const mkInt = "High import costs, forex shortages, unreliable suppliers, and counterfeit products create a challenging operating environment that affects service quality, safety, and business viability. Policy advocacy for improved RAC equipment import channels, combined with technician education on counterfeit detection and quality assurance, would help mitigate these compounded market obstacles.";
  y = ab(doc, mkInt, y);

  // ===================== PAGE 11: STRATEGIC INSIGHTS =====================
  addPage(doc);
  y = st(doc, "10. Strategic Insights", 30);

  if (input.insights) {
    y = sst(doc, "Sector Overview", y);
    y = bt(doc, input.insights.overview, y); y += 1;

    y = sst(doc, "Key Patterns", y);
    for (const finding of input.insights.keyFindings) {
      const l = doc.splitTextToSize("- " + finding, CW - 6);
      doc.setFontSize(7.5); doc.setFont("helvetica", "normal"); doc.setTextColor(...S700);
      for (const ln of l) { y = cpb(doc, y); doc.text(ln, M + 4, y); y += 3.8; }
    }
    y += 2;

    y = sst(doc, "Risk Areas", y);
    if (input.insights.riskAreas.length > 0) {
      for (const risk of input.insights.riskAreas) {
        const l = doc.splitTextToSize("- " + risk, CW - 6);
        doc.setFontSize(7.5); doc.setFont("helvetica", "normal"); doc.setTextColor(...S700);
        for (const ln of l) { y = cpb(doc, y); doc.text(ln, M + 4, y); y += 3.8; }
      }
    } else { y = bt(doc, "No significant risk areas identified.", y); }
    y += 2;

    y = sst(doc, "Opportunities", y);
    if (input.insights.opportunities.length > 0) {
      for (const opp of input.insights.opportunities) {
        const l = doc.splitTextToSize("- " + opp, CW - 6);
        doc.setFontSize(7.5); doc.setFont("helvetica", "normal"); doc.setTextColor(...S700);
        for (const ln of l) { y = cpb(doc, y); doc.text(ln, M + 4, y); y += 3.8; }
      }
    } else { y = bt(doc, "No specific opportunities identified.", y); }
  } else {
    y = bt(doc, "Insufficient data to generate strategic insights. Key data points are presented in the preceding sections.", y);
  }

  // ===================== PAGE 12: RECOMMENDATIONS =====================
  addPage(doc);
  y = st(doc, "11. Recommendations", 30);

  y = bt(doc, "The following recommendations are organised by thematic area and draw directly from survey evidence. Each entry includes priority level, implementation timeline, and expected impact to support HEVACRAZ, UNEP, and NOU in strategic planning.", y);

  // AI-generated strategic interventions
  if (input.insights && input.insights.recommendedInterventions.length > 0) {
    y += 1;
    y = sst(doc, "Strategic Interventions", y);
    for (let i = 0; i < input.insights.recommendedInterventions.length; i++) {
      const text = String(i + 1) + ".  " + input.insights.recommendedInterventions[i];
      const l = doc.splitTextToSize(text, CW - 4);
      doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.setTextColor(...S700);
      for (const ln of l) { y = cpb(doc, y); doc.text(ln, M + 2, y); y += 4; }
    }
    y += 2;
  }

  if (input.insights && input.insights.priorityActions.length > 0) {
    y = sst(doc, "Priority Actions", y);
    for (let i = 0; i < input.insights.priorityActions.length; i++) {
      const text = ">>  " + input.insights.priorityActions[i];
      const l = doc.splitTextToSize(text, CW - 6);
      doc.setFontSize(8.5); doc.setFont("helvetica", "bold"); doc.setTextColor(...BRAND);
      for (const ln of l) { y = cpb(doc, y); doc.text(ln, M + 4, y); y += 4.5; }
    }
    y += 3;
  }

  // Structured data-driven recommendations table
  y = sst(doc, "Detailed Recommendations", y);

  interface Rec {
    cat: string; text: string; pri: string; time: string; impact: string;
  }
  const recs: Rec[] = [];

  const noCertD = input.data.skills.hasCertification.find((r) => r.label === "No");
  if (noCertD && parseFloat(noCertD.percent) > 20) {
    recs.push({ cat: "Training & Certification", text: noCertD.percent + "% of technicians lack certification. Establish accessible certification pathways including recognition of prior learning, mobile examination centres, and subsidised training to accelerate certification across all provinces.", pri: "High", time: "6-12 months", impact: "High" });
  }
  if (parseFloat(tp) < 70) {
    recs.push({ cat: "Training & Certification", text: "Only " + tp + "% have formal training. Expand vocational training partnerships with technical colleges and industry associations to create a national RAC training network with standardised curricula.", pri: "High", time: "12-18 months", impact: "High" });
  }
  if (input.provinceAnalytics && input.provinceAnalytics.trainingByProvince.length > 0) {
    const sg = [...input.provinceAnalytics.trainingByProvince].sort((a, b) => b.rate - a.rate);
    recs.push({ cat: "Provincial Outreach", text: "Prioritise training in " + sg[0].province + " (" + sg[0].rate.toFixed(1) + "% gap). Deploy mobile training units to underserved provinces. Use low-gap provinces as regional training hubs.", pri: "High", time: "6-12 months", impact: "High" });
  }
  recs.push({ cat: "Compliance & Safety", text: "Distribute recovery equipment to technicians currently operating without it. Integrate recovery training into all certification programmes and enforce compliance through the registry framework.", pri: "High", time: "3-6 months", impact: "High" });
  recs.push({ cat: "Low-GWP Transition", text: "Address the " + Math.abs(g).toFixed(1) + "-point confidence gap. Establish demonstration centres for hands-on experience with low-GWP systems. Align training with Kigali Amendment phase-down schedule.", pri: "High", time: "6-12 months", impact: "High" });
  recs.push({ cat: "Equipment Access", text: "Launch subsidised toolkit and PPE distribution programmes. Establish cooperative equipment ownership models and supplier partnerships to improve access in underserved regions.", pri: "High", time: "3-6 months", impact: "High" });
  if (fPct && parseFloat(fPct) < 20) {
    recs.push({ cat: "Youth & Women Inclusion", text: "Female participation is " + fPct + "%. Launch targeted outreach including female-only training cohorts, mentorship schemes, and scholarships. Set measurable diversity targets for the registry.", pri: "Medium", time: "12-18 months", impact: "Medium" });
  }
  recs.push({ cat: "Data Systems", text: "Enhance the technician registry with quarterly survey cycles, mobile data collection, and verification protocols. High-quality longitudinal data enables evidence-based policy and programme evaluation.", pri: "Medium", time: "6-12 months", impact: "Medium" });
  recs.push({ cat: "Data Systems", text: "Establish a quarterly reporting framework tracking certification rates, training completion, equipment access, and provincial participation. Publish an annual state-of-the-sector report.", pri: "Medium", time: "12 months", impact: "Medium" });
  recs.push({ cat: "Policy & Regulation", text: "Advocate for mandatory certification, recovery equipment requirements, and low-GWP refrigerant incentives. Align national regulations with Kigali Amendment timelines.", pri: "Medium", time: "12-18 months", impact: "Medium" });
  recs.push({ cat: "Industry Partnerships", text: "Strengthen collaboration between HEVACRAZ, manufacturers, suppliers, training institutions, and development partners to resource programmes, provide equipment, and create employment pathways.", pri: "Medium", time: "6-12 months", impact: "Medium" });
  recs.push({ cat: "Continuous Professional Development", text: "Establish mandatory CPD for certified technicians requiring periodic refresher training on new technologies, safety practices, and regulatory updates to maintain certification validity.", pri: "Low", time: "12-18 months", impact: "Medium" });

  if (recs.length > 0) {
    const recHeaders = ["Category", "Recommendation", "Pri", "Time", "Impact"];
    const recBody = recs.map((r) => [r.cat, r.text, r.pri, r.time, r.impact]);

    autoTable(doc, {
      head: [recHeaders], body: recBody, startY: y + 1,
      styles: { fontSize: 6.5, cellPadding: 1.5, overflow: "linebreak", font: "helvetica" },
      headStyles: { fillColor: BRAND, textColor: 255, fontStyle: "bold", fontSize: 6.5, halign: "center" },
      columnStyles: {
        0: { cellWidth: 28, fontStyle: "bold" },
        1: { cellWidth: "auto" },
        2: { cellWidth: 12, halign: "center" },
        3: { cellWidth: 16, halign: "center" },
        4: { cellWidth: 14, halign: "center" },
      },
      alternateRowStyles: { fillColor: BRAND_LIGHT },
      margin: { left: M, right: M },
      didDrawPage: (data) => { y = data.cursor ? data.cursor.y : y; },
    });

    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 4;
  }

  // ===================== PAGE 13: EXECUTIVE CONCLUSIONS =====================
  addPage(doc);
  y = st(doc, "12. Executive Conclusions", 30);

  // Readiness score (FIXED: denominator is 31, max score is 31)
  const rawScore = calcScore(input.data);
  const maxScore = 31;
  const pct = (rawScore / maxScore) * 100;
  const classification = pct >= 80 ? "Strong Readiness"
    : pct >= 60 ? "Moderate Readiness"
    : pct >= 40 ? "Critical Intervention Needed"
    : "Urgent Intervention Required";

  // Readiness score explanation
  y = sst(doc, "Sector Readiness Assessment", y);
  doc.setFontSize(22); doc.setFont("helvetica", "bold"); doc.setTextColor(...BRAND);
  doc.text(pct.toFixed(0) + "%", M, y + 2); y += 10;

  doc.setFontSize(9); doc.setFont("helvetica", "bold"); doc.setTextColor(...BRAND);
  doc.text(classification, M, y); y += 6;

  doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.setTextColor(...S700);
  const classText = pct >= 80 ? "The technician workforce demonstrates strong overall readiness. Focus on advanced upskilling, industry certification, and preparation for the low-GWP transition."
    : pct >= 60 ? "Moderate readiness. Targeted interventions in training, certification, and equipment access are recommended to strengthen workforce capacity."
    : pct >= 40 ? "Limited readiness. Significant investment is needed across training infrastructure, certification pathways, and tool and equipment access."
    : "Low readiness. Urgent intervention required across all dimensions: training, certification, safety compliance, and equipment access.";
  doc.text(classText, M, y); y += 7;

  // Scoring methodology
  y = sst(doc, "Scoring Methodology", y);
  const scoreComponents: [string, string, string][] = [
    ["Formal Training > 50%", rawScore & 1 ? "Achieved (+1)" : "Not achieved", "3 points"],
    ["Certification > 30%", rawScore & 2 ? "Achieved (+2)" : "Not achieved", "5 points"],
    ["PPE Gap < 20%", rawScore & 4 ? "Achieved (+4)" : "Not achieved", "8 points"],
    ["Low Tool Access < 40%", rawScore & 8 ? "Achieved (+8)" : "Not achieved", "10 points"],
    ["Low-GWP Avg >= 3/5", rawScore & 16 ? "Achieved (+5)" : "Not achieved", "5 points"],
  ];
  doc.setFontSize(7); doc.setFont("helvetica", "italic"); doc.setTextColor(...S600);
  doc.text("The readiness score is calculated from five weighted components. Each component is independently assessed and contributes to the total of 31 points.", M, y); y += 4;

  autoTable(doc, {
    body: scoreComponents.map((r) => [r[0], r[1], r[2]]),
    startY: y,
    styles: { fontSize: 7, cellPadding: 1.8, font: "helvetica" },
    columnStyles: { 0: { cellWidth: 50 }, 1: { cellWidth: 40, halign: "center", fontStyle: "bold" }, 2: { cellWidth: 20, halign: "center" } },
    theme: "plain",
    margin: { left: M, right: M },
  });
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6;

  // Top National Risks
  y = sst(doc, "Top National Risks", y);
  const risks: string[] = [];
  if (parseFloat(ncp) > 40) risks.push("Low certification coverage (" + ncp + "%) affecting compliance with Montreal Protocol obligations");
  if (parseFloat(npp) > 20) risks.push("PPE access gap (" + npp + "%) creating occupational safety hazards");
  if (g > 1.5) risks.push("Confidence gap in low-GWP refrigerants (" + g.toFixed(1) + " points) slowing Kigali Amendment transition");
  risks.push("Provincial training disparities undermining uniform national competence standards");
  for (const r of risks) {
    const l = doc.splitTextToSize("- " + r, CW - 4);
    doc.setFontSize(7.5); doc.setFont("helvetica", "normal"); doc.setTextColor(...S700);
    for (const ln of l) { y = cpb(doc, y); doc.text(ln, M + 2, y); y += 3.8; }
  }
  y += 2;

  // Top Opportunities
  y = sst(doc, "Top Opportunities", y);
  const opps: string[] = [];
  opps.push("High engagement in the technician registry provides a foundation for sector-wide interventions");
  if (parseFloat(tp) < 60) opps.push("Training demand creates opportunities for institutional partnerships and curriculum development");
  opps.push("Provincial training gap data enables targeted, cost-effective resource allocation");
  opps.push("Kigali Amendment transition opens avenues for international technical cooperation and funding");
  for (const o of opps) {
    const l = doc.splitTextToSize("- " + o, CW - 4);
    doc.setFontSize(7.5); doc.setFont("helvetica", "normal"); doc.setTextColor(...S700);
    for (const ln of l) { y = cpb(doc, y); doc.text(ln, M + 2, y); y += 3.8; }
  }
  y += 2;

  // Kigali Readiness
  y = sst(doc, "Kigali Amendment Readiness Perspective", y);
  const kigaliText = "Zimbabwe's progress toward Kigali Amendment compliance depends on a workforce that is certified, equipped, and confident in low-GWP technologies. The current data indicates that the foundational registry infrastructure is in place, providing a mechanism for tracking technician competence and targeting interventions. However, the certification gap, low-GWP confidence deficit, and provincial disparities present material risks to meeting phase-down timelines. Accelerated investment in training infrastructure, equipment access, and certification pathways is required across all provinces to ensure the sector can support the transition. HEVACRAZ, UNEP, and NOU should leverage the registry as a central planning tool for managing this transition, using quarterly data cycles to monitor progress and adjust interventions dynamically.";
  y = bt(doc, kigaliText, y);
  y += 1;

  // National Workforce Outlook
  y = sst(doc, "National Workforce Outlook", y);
  const outlookText = "The Zimbabwe RAC technician workforce is at a critical juncture. With " + input.totalResponses + " technicians registered and a functioning survey infrastructure, the sector has the foundational data needed for evidence-based workforce development. The primary challenge is converting this data into coordinated action across training, certification, equipment, and safety domains. The provincial disparity data offers a clear prioritisation framework: focus resources on high-risk provinces first, use well-performing provinces as models, and build national competence progressively. With sustained investment and coordinated stakeholder action, the workforce can achieve the competence levels required for Kigali Amendment compliance and position Zimbabwe as a leader in sustainable RAC practices in the region.";
  y = bt(doc, outlookText, y);

  // HEVACRAZ/UNEP/NOU institutional note
  doc.setDrawColor(...BRAND); doc.setLineWidth(0.25); doc.line(M, y + 1, M + 50, y + 1);
  doc.setFontSize(7); doc.setFont("helvetica", "italic"); doc.setTextColor(...S600);
  const finNote = "This report is produced by HEVACRAZ, working under the guidance of UNEP and the National Ozone Unit (NOU), to support evidence-based decision-making for the RAC sector in Zimbabwe. The findings are intended to guide policy development, programme design, and resource allocation for workforce strengthening.";
  const fnl = doc.splitTextToSize(finNote, CW);
  for (const ln of fnl) { doc.text(ln, M, y + 4); y += 3.8; }
  y += 4;

  // Next Steps
  y = sst(doc, "Recommended Next Steps", y);
  const steps = [
    "Review detailed findings in each section of this report",
    "Prioritise training and certification programmes based on provincial risk levels",
    "Address equipment and tool access barriers in underserved regions",
    "Strengthen safety compliance through PPE distribution and EHS training",
    "Use strategic insights for programme design and resource allocation",
    "Schedule follow-up surveys at quarterly intervals to track progress",
  ];
  for (const step of steps) {
    const l = doc.splitTextToSize("- " + step, CW - 4);
    doc.setFontSize(7.5); doc.setFont("helvetica", "normal"); doc.setTextColor(...S700);
    for (const ln of l) { y = cpb(doc, y); doc.text(ln, M + 2, y); y += 3.8; }
  }

  // ===================== POST-PROCESSING: PAGE NUMBERS =====================
  const tpn = doc.getNumberOfPages();
  for (let i = 1; i <= tpn; i++) { doc.setPage(i); ftr(doc, i, tpn); }

  return Buffer.from(doc.output("arraybuffer"));
}

function calcScore(data: SurveyReportPdfInput["data"]): number {
  let s = 0;
  const ty = data.skills.hasFormalTraining.find((r) => r.label === "Yes");
  if (ty && parseFloat(ty.percent) > 50) s += 1;
  const cy = data.skills.hasCertification.find((r) => r.label === "Yes");
  if (cy && parseFloat(cy.percent) > 30) s += 2;
  const pp = data.safety.ppeAccess.find((r) => r.label === "No PPE access");
  if (!pp || parseFloat(pp.percent) < 20) s += 4;
  const lt = data.tools.accessToTools.filter((r) => r.label === "Level 1" || r.label === "Level 2").reduce((a, r) => a + r.count, 0);
  const total = Object.values(data.demographics).reduce((a, arr) => a + arr.reduce((a2, r) => a2 + r.count, 0), 0);
  if (total > 0 && lt / total < 0.4) s += 8;
  const al = data.skills.confidenceLowGwp.reduce((a, r) => a + parseInt(r.label.replace("Level ", "")) * parseInt(r.count.toString()), 0)
    / Math.max(data.skills.confidenceLowGwp.reduce((a, r) => a + r.count, 0), 1);
  if (al >= 3) s += 16;
  return s;
}
