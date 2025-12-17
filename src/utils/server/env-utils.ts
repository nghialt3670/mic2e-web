import { z } from "zod";

const serverEnvSchema = z.object({
  DATABASE_URL: z.string().url(),
  AGENT_API_HOST: z.string().url(),
  STORAGE_API_HOST: z.string().url(),
});

// Check if we're in build phase
const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";

// During build, skip validation entirely
const serverEnv = isBuildPhase
  ? // Provide empty object during build - values will be available at runtime
    ({
      DATABASE_URL: "",
      AGENT_API_HOST: "",
      STORAGE_API_HOST: "",
    } as z.infer<typeof serverEnvSchema>)
  : // At runtime, validate and throw if invalid
    serverEnvSchema.parse(process.env);

export { serverEnv };
