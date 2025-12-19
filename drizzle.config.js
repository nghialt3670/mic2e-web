import { defineConfig } from "drizzle-kit";

// Ensure DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL environment variable is not set!");
  process.exit(1);
}

console.log(
  "✓ Using DATABASE_URL:",
  process.env.DATABASE_URL.replace(/:[^:@]+@/, ":****@"),
);

export default defineConfig({
  schema: "./src/lib/drizzle/drizzle-schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  verbose: true,
  strict: true,
});
