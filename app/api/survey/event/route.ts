import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { surveyEvents } from "@/lib/schema";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phone, step, stepName, event } = body;
    
    if (typeof step !== "number" || !stepName || !event) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    await db.insert(surveyEvents).values({
      phone: String(phone ?? "unknown"),
      step,
      stepName: String(stepName),
      event: String(event),
      ipAddress: req.headers.get("x-forwarded-for") ?? null,
      userAgent: req.headers.get("user-agent") ?? null,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to log event" }, { status: 500 });
  }
}
