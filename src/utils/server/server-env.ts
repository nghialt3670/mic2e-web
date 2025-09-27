import { z } from "zod";

export const serverEnvSchema = z.object({
  DATABASE_URL: z.url(),
});

export const serverEnv = serverEnvSchema.parse(process.env);
