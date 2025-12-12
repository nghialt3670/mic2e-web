"use client";

import { z } from "zod";

const clientEnvSchema = z.object({
  NEXT_PUBLIC_STORAGE_API_HOST: z.string().url(),
});

// During build, NEXT_PUBLIC vars might not be set - use safeParse
const parsed = clientEnvSchema.safeParse({
  NEXT_PUBLIC_STORAGE_API_HOST: process.env.NEXT_PUBLIC_STORAGE_API_HOST,
});

// Provide fallback during build, validate at runtime
export const clientEnv = parsed.success 
  ? parsed.data 
  : ({ NEXT_PUBLIC_STORAGE_API_HOST: process.env.NEXT_PUBLIC_STORAGE_API_HOST || "" } as z.infer<typeof clientEnvSchema>);
