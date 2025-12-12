import { z } from "zod";

const serverEnvSchema = z.object({
  DATABASE_URL: z.string().url(),
  AGENT_API_HOST: z.string().url(),
});

// Use safeParse to avoid throwing errors during build time
const parsed = serverEnvSchema.safeParse(process.env);

// Only validate strictly in production runtime (not during build)
if (!parsed.success && process.env.NODE_ENV === "production" && typeof window === "undefined") {
  // Only throw if we're in a server context at runtime
  if (process.env.NEXT_PHASE !== "phase-production-build") {
    console.error("❌ Invalid environment variables:", parsed.error.flatten().fieldErrors);
    throw new Error("Invalid environment variables");
  }
}

export const serverEnv = parsed.success ? parsed.data : (process.env as unknown as z.infer<typeof serverEnvSchema>);
