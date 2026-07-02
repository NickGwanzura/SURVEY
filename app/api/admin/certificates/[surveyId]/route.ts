import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { getCurrentAdmin } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { generateCertificatePdf } from "@/lib/admin/certificate-pdf";
import { retailersSurvey, techniciansSurvey } from "@/lib/schema";

/**
 * GET /api/admin/certificates/:surveyId
 *
 * Download the registration certificate for a verified survey submission.
 * Works for both technicians and retailers.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ surveyId: string }> },
) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { surveyId } = await params;

  // Try technician table first, then retailer
  let row:
    | {
        firstName: string;
        surname: string;
        registrationNumber: string | null;
        status: string;
        entityType: "technician" | "retailer";
      }
    | undefined;

  const techRow = await db
    .select({
      firstName: techniciansSurvey.firstName,
      surname: techniciansSurvey.surname,
      registrationNumber: techniciansSurvey.registrationNumber,
      status: techniciansSurvey.status,
    })
    .from(techniciansSurvey)
    .where(eq(techniciansSurvey.id, surveyId))
    .limit(1);

  if (techRow.length > 0) {
    row = { ...techRow[0], entityType: "technician" };
  } else {
    const retRow = await db
      .select({
        firstName: retailersSurvey.contactPersonName,
        surname: retailersSurvey.businessName,
        registrationNumber: retailersSurvey.registrationNumber,
        status: retailersSurvey.status,
      })
      .from(retailersSurvey)
      .where(eq(retailersSurvey.id, surveyId))
      .limit(1);

    if (retRow.length > 0) {
      row = { ...retRow[0], entityType: "retailer" };
    }
  }

  if (!row) {
    return NextResponse.json(
      { error: "Survey submission not found" },
      { status: 404 },
    );
  }

  if (row.status !== "verified") {
    return NextResponse.json(
      { error: "Certificate is only available for verified submissions" },
      { status: 400 },
    );
  }

  if (!row.registrationNumber) {
    return NextResponse.json(
      { error: "No registration number has been assigned yet" },
      { status: 400 },
    );
  }

  const pdfBuffer = generateCertificatePdf({
    firstName: row.firstName,
    surname: row.surname,
    registrationNumber: row.registrationNumber,
    issueDate: new Date(),
    entityType: row.entityType,
  });

  return new NextResponse(new Uint8Array(pdfBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${row.registrationNumber}.pdf"`,
      "Content-Length": String(pdfBuffer.length),
    },
  });
}
