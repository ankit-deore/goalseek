"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { copy } from "@/config/site";
import { routes } from "@/config/routes";
import { addLink } from "@/lib/data/items";
import { getCurrentWorkspace } from "@/lib/data/workspaces";
import { addLinkSchema, formToObject, itemUpdateSchema, statusUpdateSchema } from "@/lib/validation";
import { z } from "zod";
import type { ActionState } from "./state";

function refreshLists() {
  revalidatePath(routes.inbox);
  revalidatePath(routes.tracker);
}

export async function addLinkAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  const parsed = addLinkSchema.safeParse(formToObject(form));
  if (!parsed.success) return { status: "error", message: copy.inbox.invalidUrl };

  const { user, supabase, current } = await getCurrentWorkspace();
  if (!current) return { status: "error", message: copy.common.error };

  const result = await addLink(supabase, { workspaceId: current.id, userId: user.id, url: parsed.data.url });
  if (!result.ok) {
    if (result.reason === "invalid_url") return { status: "error", message: copy.inbox.invalidUrl };
    if (result.reason === "duplicate") return { status: "error", message: copy.inbox.duplicate };
    return { status: "error", message: copy.common.error };
  }

  refreshLists();
  return { status: "success", message: result.item.title ?? result.item.url };
}

export async function updateStatusAction(form: FormData): Promise<void> {
  const parsed = statusUpdateSchema.safeParse(formToObject(form));
  if (!parsed.success) return;
  const { user, supabase } = await getCurrentWorkspace();

  // Moving a link out of "New" without an owner makes you the owner.
  const { data: item } = await supabase.from("items").select("owner_id").eq("id", parsed.data.id).single();
  const owner_id = item?.owner_id ?? (parsed.data.status !== "new" ? user.id : null);

  await supabase.from("items").update({ status: parsed.data.status, owner_id }).eq("id", parsed.data.id);
  refreshLists();
}

export async function updateItemAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  const parsed = itemUpdateSchema.safeParse(formToObject(form));
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? copy.common.error };
  }
  const { id, ...fields } = parsed.data;
  const { supabase } = await getCurrentWorkspace();

  const { error } = await supabase.from("items").update(fields).eq("id", id);
  if (error) return { status: "error", message: copy.common.error };

  refreshLists();
  revalidatePath(routes.item(id));
  return { status: "success", message: copy.item.saved };
}

export async function deleteItemAction(form: FormData): Promise<void> {
  const id = z.uuid().safeParse(form.get("id"));
  if (!id.success) return;
  const { supabase } = await getCurrentWorkspace();
  await supabase.from("items").delete().eq("id", id.data);
  refreshLists();
  redirect(routes.inbox);
}

/** Used by the Android share target: add the shared link, then open it. */
export async function shareLinkAction(form: FormData): Promise<void> {
  const parsed = addLinkSchema.safeParse(formToObject(form));
  if (!parsed.success) redirect(routes.inbox);

  const { user, supabase, current } = await getCurrentWorkspace();
  if (!current) redirect(routes.inbox);

  const title = typeof form.get("title") === "string" ? (form.get("title") as string) : null;
  const result = await addLink(supabase, { workspaceId: current.id, userId: user.id, url: parsed.data.url, title });
  refreshLists();
  const item = result.ok ? result.item : result.reason === "duplicate" ? result.item : undefined;
  redirect(item ? routes.item(item.id) : routes.inbox);
}
