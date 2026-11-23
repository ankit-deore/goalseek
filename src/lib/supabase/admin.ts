import "server-only";
import { createClient } from "@supabase/supabase-js";
import { publicEnv } from "@/config/public-env";
import { serverEnv } from "@/config/env";
import type { Database } from "@/types/database";

/**
 * Privileged Supabase client. It BYPASSES row-level security, so only use it
 * in server code that checks permissions itself (capture API, reminder job).
 */
export function createAdminClient() {
  return createClient<Database>(publicEnv.supabaseUrl, serverEnv().SUPABASE_SECRET_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
