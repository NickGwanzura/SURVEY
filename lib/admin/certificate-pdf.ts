import "server-only";

import { jsPDF } from "jspdf";

/* ------------------------------------------------------------------ */
/*  Brand palette (matching the app)                                   */
/* ------------------------------------------------------------------ */
const BRAND_600 = "#0d4f3c";
const BRAND_700 = "#064e3b";
const BRAND_50 = "#ecfdf5";
const BRAND_100 = "#d1fae5";
const BRAND_500 = "#10b981";
const WHITE = "#ffffff";
const SLATE_900 = "#0f172a";
const SLATE_600 = "#475569";
const GOLD_600 = "#b8860b";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
export type CertEntityType = "technician" | "retailer";

const REGISTRY_NAMES: Record<CertEntityType, string> = {
  technician: "National RAC Technician Registry",
  retailer: "National RAC Retailer Registry",
};

export interface CertificateParams {
  firstName: string;
  surname: string;
  registrationNumber: string;
  issueDate: Date;
  entityType: CertEntityType;
}

/* ------------------------------------------------------------------ */
/*  Certificate PDF Generator                                          */
/* ------------------------------------------------------------------ */

export function generateCertificatePdf(
  params: CertificateParams,
): Buffer {
  const { firstName, surname, registrationNumber, issueDate, entityType } =
    params;
  const registryName = REGISTRY_NAMES[entityType];

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageW = 210; // A4 width in mm
  const pageH = 297; // A4 height in mm
  const margin = 12;

  /* ---------- Decorative double border ---------- */
  // Outer border
  doc.setDrawColor(BRAND_600);
  doc.setLineWidth(1.2);
  doc.rect(margin, margin, pageW - 2 * margin, pageH - 2 * margin);

  // Inner border
  doc.setLineWidth(0.4);
  doc.rect(
    margin + 3,
    margin + 3,
    pageW - 2 * (margin + 3),
    pageH - 2 * (margin + 3),
  );

  /* ---------- Corner ornaments ---------- */
  const ornSize = 6;
  doc.setDrawColor(BRAND_500);
  doc.setLineWidth(0.3);

  // Top-left
  doc.line(margin + 1, margin + 1, margin + 1 + ornSize, margin + 1);
  doc.line(margin + 1, margin + 1, margin + 1, margin + 1 + ornSize);
  // Top-right
  doc.line(pageW - margin - 1, margin + 1, pageW - margin - 1 - ornSize, margin + 1);
  doc.line(pageW - margin - 1, margin + 1, pageW - margin - 1, margin + 1 + ornSize);
  // Bottom-left
  doc.line(margin + 1, pageH - margin - 1, margin + 1 + ornSize, pageH - margin - 1);
  doc.line(margin + 1, pageH - margin - 1, margin + 1, pageH - margin - 1 - ornSize);
  // Bottom-right
  doc.line(pageW - margin - 1, pageH - margin - 1, pageW - margin - 1 - ornSize, pageH - margin - 1);
  doc.line(pageW - margin - 1, pageH - margin - 1, pageW - margin - 1, pageH - margin - 1 - ornSize);

  /* ---------- Emblem (circle with RAC text) ---------- */
  const centerX = pageW / 2;
  let y = 32;

  // Simple abstract emblem — filled circle
  doc.setDrawColor(BRAND_600);
  doc.setFillColor(BRAND_50);
  doc.setLineWidth(0.6);
  const emblemR = 9;
  doc.circle(centerX, y - emblemR, emblemR);
  doc.fill();
  doc.stroke();

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(BRAND_700);
  doc.text("RAC", centerX, y - emblemR + 1, { align: "center" });

  // Inner mark
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(BRAND_700);
  doc.text("RAC", centerX, y - emblemR + 1, { align: "center" });

  y += 4;

  /* ---------- Organisation header ---------- */
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(BRAND_700);
  doc.text("NATIONAL OZONE UNIT  ·  HEVACRAZ", centerX, y, {
    align: "center",
  });

  y += 6;

  /* ---------- Decorative line ---------- */
  doc.setDrawColor(BRAND_500);
  doc.setLineWidth(0.3);
  doc.line(centerX - 40, y, centerX + 40, y);
  y += 8;

  /* ---------- Title ---------- */
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(BRAND_600);
  doc.text("CERTIFICATE OF REGISTRATION", centerX, y, { align: "center" });

  y += 9;

  /* ---------- Subtitle ---------- */
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(SLATE_600);
  doc.text(registryName, centerX, y, { align: "center" });

  y += 14;

  /* ---------- "This certifies that" ---------- */
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(SLATE_600);
  doc.text("This certifies that", centerX, y, { align: "center" });

  y += 10;

  /* ---------- Recipient name (large, prominent) ---------- */
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(SLATE_900);
  const fullName = `${firstName} ${surname}`;
  doc.text(fullName, centerX, y, { align: "center" });

  y += 10;

  /* ---------- Body text ---------- */
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(SLATE_600);

  const bodyLine1 =
    entityType === "technician"
      ? "has been duly registered in the National RAC Technician Registry,"
      : "has been duly registered in the National RAC Retailer Registry,";
  const bodyLine2 =
    "in accordance with the guidelines of the National Ozone Unit (NOU)";
  const bodyLine3 =
    "and the Heating, Ventilation, Air-Conditioning and Refrigeration";
  const bodyLine4 = "Association of Zimbabwe (HEVACRAZ).";

  doc.text(bodyLine1, centerX, y, { align: "center" });
  y += 5;
  doc.text(bodyLine2, centerX, y, { align: "center" });
  y += 5;
  doc.text(bodyLine3, centerX, y, { align: "center" });
  y += 5;
  doc.text(bodyLine4, centerX, y, { align: "center" });

  y += 12;

  /* ---------- Registration number (prominent box) ---------- */
  const boxW = 80;
  const boxH = 16;
  const boxLeft = centerX - boxW / 2;
  doc.setFillColor(BRAND_50);
  doc.setDrawColor(BRAND_100);
  doc.setLineWidth(0.3);
  doc.roundedRect(boxLeft, y - boxH + 2, boxW, boxH, 3, 3, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(BRAND_700);
  doc.text("REGISTRATION NUMBER", centerX, y - 4, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(BRAND_600);
  doc.text(registrationNumber, centerX, y + 5, { align: "center" });

  y += 14;

  /* ---------- Issue date ---------- */
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(SLATE_600);

  const formattedDate = issueDate.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  doc.text(`Issued: ${formattedDate}`, centerX, y, { align: "center" });

  y += 14;

  /* ---------- Gold seal / stamp (circle) ---------- */
  const sealR = 10;
  const sealX = centerX + 55;
  const sealY = y + 8;

  doc.setDrawColor(GOLD_600);
  doc.setLineWidth(0.5);
  doc.circle(sealX, sealY, sealR);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(4.5);
  doc.setTextColor(GOLD_600);
  doc.text("REGISTERED", sealX, sealY - 2, { align: "center" });
  doc.text("TECHNICIAN", sealX, sealY + 3, { align: "center" });

  /* ---------- Signature lines ---------- */
  const sigY = y + 10;
  const sigLeft = 32;
  const sigRight = pageW - 32;
  const sigMid = centerX;
  const sigCol1 = sigLeft;
  const sigCol2 = sigMid + (sigRight - sigMid) / 2;

  const sigLineY = sigY + 5;

  // --- Signature line 1 ---
  doc.setDrawColor(SLATE_600);
  doc.setLineWidth(0.3);
  doc.line(sigCol1, sigLineY, sigCol1 + 55, sigLineY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(SLATE_900);
  doc.text("For: National Ozone Unit", sigCol1 + 27, sigLineY + 5, {
    align: "center",
  });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(SLATE_600);
  doc.text("Authorised Signatory", sigCol1 + 27, sigLineY + 10, {
    align: "center",
  });

  // --- Signature line 2 ---
  doc.setDrawColor(SLATE_600);
  doc.setLineWidth(0.3);
  doc.line(sigCol2, sigLineY, sigCol2 + 55, sigLineY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(SLATE_900);
  doc.text("For: HEVACRAZ", sigCol2 + 27, sigLineY + 5, {
    align: "center",
  });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(SLATE_600);
  doc.text("Authorised Signatory", sigCol2 + 27, sigLineY + 10, {
    align: "center",
  });

  /* ---------- Footer ---------- */
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(SLATE_600);
  doc.text(
    "www.racregistryzw.org  ·  NOU  ·  HEVACRAZ",
    centerX,
    pageH - 18,
    { align: "center" },
  );

  // Page number
  doc.setFontSize(7);
  doc.setTextColor("#94a3b8");
  doc.text(`Page 1 of 1`, centerX, pageH - 14, { align: "center" });

  return Buffer.from(doc.output("arraybuffer"));
}
