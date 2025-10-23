import { serverEnv } from "@/utils/server/server-env";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as drizzleSchema from "./drizzle-schema";

const sql = neon(serverEnv.DRIZZLE_DATABASE_URL);
export const drizzleClient = drizzle(sql, { schema: drizzleSchema });
