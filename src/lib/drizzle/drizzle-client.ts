import { serverEnv } from "@/utils/server/env-utils";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as drizzleSchema from "./drizzle-schema";

const sql = postgres(serverEnv.DATABASE_URL, {
  ssl: false,
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

export const drizzleClient = drizzle(sql, { schema: drizzleSchema });
