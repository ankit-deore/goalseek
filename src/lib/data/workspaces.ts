import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import type { DbClient } from "./types";
import { getMyProfile } from "./profile";
import { requireUser } from "./session";

export const WORKSPACE_COOKIE = "gs_workspace";

export type WorkspaceSummary = { id: string; name: string; role: "owner" | "member" };
export type Member = { userId: string; name: string; email: string; avatarUrl: string | null; role: "owner" | "member" };

export async function listMyWorkspaces(supabase: DbClient, userId: string): Promise<WorkspaceSummary[]> {
  const { data, error } = await supabase
    .from("workspace_members")
    .select("role, workspaces(id, name)")
    .eq("user_id", userId)
    .order("joined_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).flatMap((row) =>
    row.workspaces ? [{ id: row.workspaces.id, name: row.workspaces.name, role: row.role }] : [],
  );
}

export async function listMembers(supabase: DbClient, workspaceId: string): Promise<Member[]> {
  const { data: members, error } = await supabase
    .from("workspace_members")
    .select("user_id, role")
    .eq("workspace_id", workspaceId);
  if (error) throw error;
  const ids = (members ?? []).map((m) => m.user_id);
  if (ids.length === 0) return [];

  const { data: profiles, error: profileError } = await supabase
    .from("profiles")
    .select("id, full_name, email, avatar_url")
    .in("id", ids);
  if (profileError) throw profileError;

  const byId = new Map((profiles ?? []).map((p) => [p.id, p]));
  return (members ?? []).map((m) => {
    const p = byId.get(m.user_id);
    return {
      userId: m.user_id,
      name: p?.full_name || p?.email || "Member",
      email: p?.email ?? "",
      avatarUrl: p?.avatar_url ?? null,
      role: m.role,
    };
  });
}

/**
 * The workspace the user is looking at: the one in the cookie if they are
 * still a member, else their default, else the first one they joined.
 */
export const getCurrentWorkspace = cache(async () => {
  const user = await requireUser();
  const supabase = await createClient();
  // Load the profile first: it creates a missing profile and workspace.
  const profile = await getMyProfile();
  const [workspaces, cookieStore] = await Promise.all([listMyWorkspaces(supabase, user.id), cookies()]);

  const wanted = cookieStore.get(WORKSPACE_COOKIE)?.value ?? profile.default_workspace_id;
  const current = workspaces.find((w) => w.id === wanted) ?? workspaces[0] ?? null;
  return { user, supabase, workspaces, current };
});

/** user id → display name for everyone in a workspace. */
export async function peopleMap(supabase: DbClient, workspaceId: string): Promise<Map<string, string>> {
  const members = await listMembers(supabase, workspaceId);
  return new Map(members.map((m) => [m.userId, m.name]));
}
