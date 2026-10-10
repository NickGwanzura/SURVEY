import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

const globalForDb = globalThis as unknown as { surveyDbClient?: Pool };
// Next.js may import database-backed routes during `next build` to collect
// route metadata. Keep Pool creation lazy so builds do not require production
// secrets; the first actual query will connect using the runtime environment.
const client = globalForDb.surveyDbClient ?? new Pool({ connectionString, max: 10 });
if (process.env.NODE_ENV !== "production") globalForDb.surveyDbClient = client;

export const db = drizzle(client, { schema });

export { schema };
