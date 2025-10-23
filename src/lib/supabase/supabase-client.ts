import { clientEnv } from "@/utils/client/client-env";
import { createClient } from "@supabase/supabase-js";

export const supabaseClient = createClient(
  clientEnv.NEXT_PUBLIC_SUPABASE_URL,
  clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);
