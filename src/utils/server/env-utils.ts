import { z } from "zod";

const serverEnvSchema = z.object({
  DRIZZLE_DATABASE_URL: z.url(),
  AGENT_API_HOST: z.url(),
});

export const serverEnv = serverEnvSchema.parse(process.env);
