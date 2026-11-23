import "server-only";
import type { Category, Status } from "@/config/items";
import { limits } from "@/config/items";
import { guessCategory } from "@/lib/links/categorize";
import { normalizeUrl, parseUrl } from "@/lib/links/normalize";
import { fetchLinkPreview } from "@/lib/links/preview";
import type { Item } from "@/types/database";
import type { DbClient } from "./types";

export type AddLinkInput = {
  workspaceId: string;
  userId: string;
  url: string;
  /** Optional hints from the client (e.g. the page title the extension saw). */
  title?: string | null;
  category?: Category | null;
  notes?: string | null;
};

export type AddLinkResult =
  | { ok: true; item: Item }
  | { ok: false; reason: "invalid_url" | "duplicate"; item?: Item }
  | { ok: false; reason: "error"; message: string };

const clip = (value: string | null | undefined, max: number) => (value ? value.slice(0, max) : null);

/**
 * Add a link to a workspace: validate, de-duplicate, fetch a preview, guess
 * the category and insert. Shared by the inbox form, the share target and the
 * capture API so they all behave the same.
 */
export async function addLink(supabase: DbClient, input: AddLinkInput): Promise<AddLinkResult> {
  const url = parseUrl(input.url);
  if (!url) return { ok: false, reason: "invalid_url" };
  const normalized = normalizeUrl(url);

  const existing = await supabase
    .from("items")
    .select("*")
    .eq("workspace_id", input.workspaceId)
    .eq("normalized_url", normalized)
    .maybeSingle();
  if (existing.data) return { ok: false, reason: "duplicate", item: existing.data };

  const meta = await fetchLinkPreview(url);
  const title = input.title?.trim() || meta.title;

  const { data, error } = await supabase
    .from("items")
    .insert({
      workspace_id: input.workspaceId,
      url: url.toString(),
      normalized_url: normalized,
      title: clip(title, limits.title),
      description: clip(meta.description, 1000),
      image_url: clip(meta.image, limits.url),
      site_name: clip(meta.siteName ?? url.hostname.replace(/^www\./, ""), 120),
      category: input.category ?? guessCategory(url, title),
      notes: clip(input.notes, limits.notes),
      added_by: input.userId,
    })
    .select("*")
    .single();

  if (error) {
    // 23505 = unique violation: someone added the same link a moment ago.
    if (error.code === "23505") return { ok: false, reason: "duplicate" };
    return { ok: false, reason: "error", message: error.message };
  }
  return { ok: true, item: data };
}

export type ItemFilters = {
  statuses?: Status[];
  excludeStatuses?: Status[];
  category?: Category;
  ownerId?: string;
};

export async function listItems(supabase: DbClient, workspaceId: string, filters: ItemFilters = {}): Promise<Item[]> {
  let query = supabase.from("items").select("*").eq("workspace_id", workspaceId);
  if (filters.statuses?.length) query = query.in("status", filters.statuses);
  if (filters.excludeStatuses?.length) query = query.not("status", "in", `(${filters.excludeStatuses.join(",")})`);
  if (filters.category) query = query.eq("category", filters.category);
  if (filters.ownerId) query = query.eq("owner_id", filters.ownerId);

  const { data, error } = await query
    .order("deadline", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) throw error;
  return data ?? [];
}

export async function getItem(supabase: DbClient, id: string): Promise<Item | null> {
  const { data, error } = await supabase.from("items").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}
