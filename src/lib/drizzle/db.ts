import { serverEnv } from "@/utils/server/server-env";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "./schema";

const sql = neon(serverEnv.DATABASE_URL);
export const db = drizzle(sql, { schema });
