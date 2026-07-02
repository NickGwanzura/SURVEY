import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { adminUsers } from "@/lib/schema";
import { hashPassword } from "@/lib/auth";
import { verifyInviteToken } from "@/lib/admin/admin-invites-data";

const setupSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, "Password must be at least 8 characters.").max(128),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = setupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const { token, password } = parsed.data;

  // Verify the invite token
  const invite = await verifyInviteToken(token);
  if (!invite) {
    return NextResponse.json(
      { error: "This invitation link is invalid or has expired. Please request a new invitation." },
      { status: 410 },
    );
  }

  try {
    const passwordHash = await hashPassword(password);

    const [user] = await db
      .insert(adminUsers)
      .values({
        email: invite.email,
        name: invite.name,
        role: invite.role,
        passwordHash,
        isActive: true,
      })
      .returning({
        id: adminUsers.id,
        email: adminUsers.email,
        name: adminUsers.name,
      });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (err) {
    console.error("[POST /api/admin/auth/setup]", err);
    return NextResponse.json(
      { error: "Failed to create account. The email address may already be registered." },
      { status: 500 },
    );
  }
}
