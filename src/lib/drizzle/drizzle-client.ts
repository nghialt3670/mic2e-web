import { serverEnv } from "@/utils/server/env-utils";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { checkEnvironmentVariables } from "../check-env";
import * as drizzleSchema from "./drizzle-schema";

// Type for the drizzle client with schema
type DrizzleClient = ReturnType<typeof drizzle<typeof drizzleSchema>>;

// Lazy initialization to avoid Edge Runtime issues
let sql: postgres.Sql | null = null;
let client: DrizzleClient | null = null;

function initializeDatabase(): DrizzleClient {
  if (client) {
    return client;
  }

  // Check environment variables on first initialization
  checkEnvironmentVariables();

  console.log("[DB] Initializing database connection...");
  console.log(
    "[DB] DATABASE_URL:",
    serverEnv.DATABASE_URL.replace(/:[^:@]+@/, ":***@"),
  ); // Log URL with masked password

  sql = postgres(serverEnv.DATABASE_URL, {
    ssl: false,
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
    onnotice: (notice) => {
      console.log("[DB] Notice:", notice);
    },
    debug: (_connection, query) => {
      if (process.env.AUTH_DEBUG === "true") {
        console.log("[DB] Query:", query);
      }
    },
  });

  client = drizzle(sql, { schema: drizzleSchema });

  // Test connection (non-blocking)
  sql`SELECT 1 as test`
    .then(() => console.log("[DB] ✓ Database connection successful"))
    .catch((err) =>
      console.error("[DB] ✗ Database connection failed:", err.message),
    );

  return client;
}

// Export a proxy that initializes on first use with proper typing
export const drizzleClient = new Proxy({} as DrizzleClient, {
  get(target, prop) {
    const client = initializeDatabase();
    return (client as any)[prop];
  },
}) as DrizzleClient;
