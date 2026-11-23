"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { copy } from "@/config/site";
import { publicEnv } from "@/config/public-env";
import { routes } from "@/config/routes";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/data/session";
import { getCurrentWorkspace, WORKSPACE_COOKIE } from "@/lib/data/workspaces";
import { formToObject, workspaceNameSchema } from "@/lib/validation";
import type { ActionState } from "./state";

const ONE_YEAR = 60 * 60 * 24 * 365;

async function rememberWorkspace(id: string) {
  const store = await cookies();
  store.set(WORKSPACE_COOKIE, id, { path: "/", httpOnly: true, sameSite: "lax", maxAge: ONE_YEAR, secure: true });
}

export async function switchWorkspaceAction(form: FormData): Promise<void> {
  const id = z.uuid().safeParse(form.get("workspaceId"));
  if (!id.success) return;
  const { workspaces } = await getCurrentWorkspace();
  if (!workspaces.some((w) => w.id === id.data)) return;
  await rememberWorkspace(id.data);
  revalidatePath("/", "layout");
}

export async function createWorkspaceAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  const parsed = workspaceNameSchema.safeParse(formToObject(form));
  if (!parsed.success) return { status: "error", message: copy.common.error };

  await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_workspace", { workspace_name: parsed.data.name });
  if (error || !data) return { status: "error", message: copy.common.error };

  await rememberWorkspace(data);
  revalidatePath("/", "layout");
  return { status: "success" };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- useActionState passes the previous state first
export async function createInviteAction(_prev: ActionState): Promise<ActionState> {
  const { user, supabase, current } = await getCurrentWorkspace();
  if (!current) return { status: "error", message: copy.common.error };

  const { data, error } = await supabase
    .from("workspace_invites")
    .insert({ workspace_id: current.id, created_by: user.id })
    .select("token")
    .single();
  if (error || !data) return { status: "error", message: copy.common.error };

  return { status: "success", data: `${publicEnv.siteUrl}${routes.join(data.token)}` };
}

export async function acceptInviteAction(form: FormData): Promise<void> {
  const token = z.string().min(10).max(100).safeParse(form.get("token"));
  if (!token.success) redirect(routes.inbox);

  await requireUser();
  const supabase = await createClient();
  const { data: workspaceId, error } = await supabase.rpc("accept_invite", { invite_token: token.data });
  if (error || !workspaceId) redirect(routes.join(token.data));

  await rememberWorkspace(workspaceId);
  revalidatePath("/", "layout");
  redirect(routes.inbox);
}

export async function leaveWorkspaceAction(form: FormData): Promise<void> {
  const id = z.uuid().safeParse(form.get("workspaceId"));
  if (!id.success) return;
  const { user, supabase, workspaces } = await getCurrentWorkspace();
  // Keep at least one workspace so the app always has somewhere to put links.
  if (workspaces.length <= 1) return;

  await supabase.from("workspace_members").delete().eq("workspace_id", id.data).eq("user_id", user.id);
  const store = await cookies();
  if (store.get(WORKSPACE_COOKIE)?.value === id.data) store.delete(WORKSPACE_COOKIE);
  revalidatePath("/", "layout");
}
