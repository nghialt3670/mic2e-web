import { z } from "zod";

const clientEnvSchema = z.object({
    NEXT_PUBLIC_SUPABASE_URL: z.url(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string(),
    NEXT_PUBLIC_FILE_BUCKET_NAME: z.string(),
});

export const clientEnv = clientEnvSchema.parse(process.env);