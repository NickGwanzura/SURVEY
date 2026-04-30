import { config as loadDotenv } from "dotenv";
import { defineConfig } from "drizzle-kit";

loadDotenv({ path: ".env.local" });

const connectionString =
  process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL or DATABASE_URL_UNPOOLED must be set for drizzle-kit. Add it to .env.local.",
  );
}

export default defineConfig({
  schema: "./lib/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: connectionString,
  },
  verbose: true,
  strict: true,
});
