import { config as loadDotenv } from "dotenv";

loadDotenv({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";

async function main() {
  const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");

  const sql = neon(url);

  const tables = (await sql`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name
  `) as { table_name: string }[];

  const enums = (await sql`
    SELECT typname
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public' AND t.typtype = 'e'
    ORDER BY typname
  `) as { typname: string }[];

  const surveyCols = (await sql`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'technicians_survey'
  `) as { column_name: string }[];

  const indexes = (await sql`
    SELECT tablename, indexname
    FROM pg_indexes
    WHERE schemaname = 'public'
    ORDER BY tablename, indexname
  `) as { tablename: string; indexname: string }[];

  console.log("Tables:", tables.map((r) => r.table_name).join(", "));
  console.log(
    "Enums:",
    enums.length,
    "—",
    enums.map((r) => r.typname).join(", "),
  );
  console.log("technicians_survey columns:", surveyCols.length);
  console.log("Indexes:", indexes.length);
  for (const i of indexes) console.log("  ", i.tablename, "->", i.indexname);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
