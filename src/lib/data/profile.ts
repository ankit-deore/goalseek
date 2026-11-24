import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "./session";

/**
 * The signed-in user's profile. If it's missing (they signed in before the
 * database was set up), it is created on the spot with a personal workspace.
 */
export const getMyProfile = cache(async () => {
  const user = await requireUser();
  const supabase = await createClient();

  const first = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (first.error) throw first.error;
  if (first.data) return first.data;

  const { error: setupError } = await supabase.rpc("ensure_my_setup");
  if (setupError) throw setupError;

  const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (error) throw error;
  return data;
});
