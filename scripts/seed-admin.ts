import { config as loadDotenv } from "dotenv";

loadDotenv({ path: ".env.local" });

import { randomBytes } from "node:crypto";
import { parseArgs } from "node:util";

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

import { db } from "../lib/db";
import { adminUsers } from "../lib/schema";

type Args = {
  email: string;
  name: string;
  password?: string;
  role: "admin" | "super_admin";
};

function parseCliArgs(): Args {
  const { values } = parseArgs({
    options: {
      email: { type: "string" },
      name: { type: "string" },
      password: { type: "string" },
      role: { type: "string", default: "super_admin" },
    },
  });

  if (!values.email) {
    throw new Error(
      "Missing --email. Usage: npm run seed:admin -- --email=you@example.com --name=\"Your Name\" [--password=<pw>] [--role=admin|super_admin]",
    );
  }
  if (!values.name) {
    throw new Error("Missing --name.");
  }
  if (values.role !== "admin" && values.role !== "super_admin") {
    throw new Error("--role must be 'admin' or 'super_admin'");
  }

  return {
    email: values.email,
    name: values.name,
    password: values.password,
    role: values.role,
  };
}

function generatePassword(): string {
  return randomBytes(12).toString("base64url");
}

async function main() {
  const args = parseCliArgs();
  const password = args.password ?? generatePassword();
  const passwordHash = await bcrypt.hash(password, 12);

  const existing = await db
    .select({ id: adminUsers.id })
    .from(adminUsers)
    .where(eq(adminUsers.email, args.email))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(adminUsers)
      .set({
        passwordHash,
        name: args.name,
        role: args.role,
        isActive: true,
        updatedAt: new Date(),
      })
      .where(eq(adminUsers.email, args.email));
    console.log(`Updated existing admin: ${args.email}`);
  } else {
    const [created] = await db
      .insert(adminUsers)
      .values({
        email: args.email,
        passwordHash,
        name: args.name,
        role: args.role,
      })
      .returning();
    console.log(`Created admin: ${args.email} (id=${created?.id ?? "?"})`);
  }

  if (!args.password) {
    console.log("");
    console.log("Generated password (save this — it won't be shown again):");
    console.log(`  ${password}`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => process.exit(0));
