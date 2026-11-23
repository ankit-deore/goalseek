import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "./session";

export const getMyProfile = cache(async () => {
  const user = await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (error) throw error;
  return data;
});
