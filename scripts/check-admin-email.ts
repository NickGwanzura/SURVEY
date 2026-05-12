import { config as loadDotenv } from "dotenv";
loadDotenv({ path: ".env.local" });

import { eq } from "drizzle-orm";

import { db } from "../lib/db";
import { adminUsers } from "../lib/schema";

async function main() {
  const email = "george.chaumba@gmail.com";

  const user = await db
    .select({
      id: adminUsers.id,
      email: adminUsers.email,
      name: adminUsers.name,
      role: adminUsers.role,
      isActive: adminUsers.isActive,
      lastLoginAt: adminUsers.lastLoginAt,
      createdAt: adminUsers.createdAt,
      updatedAt: adminUsers.updatedAt,
    })
    .from(adminUsers)
    .where(eq(adminUsers.email, email))
    .limit(1);

  console.log(JSON.stringify({ found: user.length === 1, user: user[0] ?? null }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
