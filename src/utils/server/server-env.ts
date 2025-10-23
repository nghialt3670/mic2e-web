import { z } from "zod";

const serverEnvSchema = z.object({
  DRIZZLE_DATABASE_URL: z.url(),
  CHAT2EDIT_API_URL: z.url(),
});

export const serverEnv = serverEnvSchema.parse(process.env);
