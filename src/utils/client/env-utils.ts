"use client";

import { z } from "zod";

const clientEnvSchema = z.object({
  NEXT_PUBLIC_BASE_PATH: z.string().optional(),
});

// During build, NEXT_PUBLIC vars might not be set - use safeParse
const parsed = clientEnvSchema.safeParse({
  NEXT_PUBLIC_BASE_PATH: process.env.NEXT_PUBLIC_BASE_PATH,
});

// Provide fallback during build, validate at runtime
export const clientEnv = parsed.success
  ? parsed.data
  : ({
      NEXT_PUBLIC_BASE_PATH: process.env.NEXT_PUBLIC_BASE_PATH || "",
    } as z.infer<typeof clientEnvSchema>);
