import { serverEnv } from "@/utils/server/env-utils";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as drizzleSchema from "./drizzle-schema";

console.log("[DB] Initializing database connection...");

const sql = postgres(serverEnv.DATABASE_URL, {
  ssl: false,
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
  onnotice: (notice) => {
    console.log("[DB] Notice:", notice);
  },
  debug: (connection, query, params) => {
    if (process.env.AUTH_DEBUG === "true") {
      console.log("[DB] Query:", query);
    }
  },
});

// Test connection on startup
sql`SELECT 1 as test`
  .then(() => console.log("[DB] ✓ Database connection successful"))
  .catch((err) => console.error("[DB] ✗ Database connection failed:", err.message));

export const drizzleClient = drizzle(sql, { schema: drizzleSchema });
