import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not set. Add it to .env.local before running this app.",
  );
}

const globalForDb = globalThis as unknown as { surveyDbClient?: Pool };
const client = globalForDb.surveyDbClient ?? new Pool({ connectionString, max: 10 });
if (process.env.NODE_ENV !== "production") globalForDb.surveyDbClient = client;

export const db = drizzle(client, { schema });

export { schema };
