import "server-only";

import { desc } from "drizzle-orm";

import { db } from "@/lib/db";
import { adminUsers } from "@/lib/schema";

export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLoginAt: Date | string | null;
  createdAt: Date | string;
};

export async function listAdminUsers(): Promise<AdminUserRow[]> {
  const rows = await db
    .select({
      id: adminUsers.id,
      name: adminUsers.name,
      email: adminUsers.email,
      role: adminUsers.role,
      isActive: adminUsers.isActive,
      lastLoginAt: adminUsers.lastLoginAt,
      createdAt: adminUsers.createdAt,
    })
    .from(adminUsers)
    .orderBy(desc(adminUsers.createdAt));

  return rows;
}
