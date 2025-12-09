"use client";

import { z } from "zod";

const clientEnvSchema = z.object({
  NEXT_PUBLIC_STORAGE_API_HOST: z.string().url(),
});

export const clientEnv = clientEnvSchema.parse({
  NEXT_PUBLIC_STORAGE_API_HOST: process.env.NEXT_PUBLIC_STORAGE_API_HOST,
});
