import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { routes } from "@/config/routes";

export type SessionUser = { id: string; email: string };

/** The signed-in user for this request, or null. Cached per request. */
export const getUser = cache(async (): Promise<SessionUser | null> => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub) return null;
  return { id: claims.sub, email: typeof claims.email === "string" ? claims.email : "" };
});

/** Like getUser, but sends signed-out visitors to the login page. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getUser();
  if (!user) redirect(routes.login);
  return user;
}
