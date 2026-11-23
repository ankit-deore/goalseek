import { NextResponse, type NextRequest } from "next/server";
import { readApiKey, hashApiKey } from "@/lib/api-keys";
import { addLink } from "@/lib/data/items";
import { extractFirstUrl } from "@/lib/links/normalize";
import { createAdminClient } from "@/lib/supabase/admin";
import { captureSchema } from "@/lib/validation";

/**
 * POST /api/capture
 * Save a link with a personal API key. Used by the browser extension,
 * Android share and iPhone Shortcut.
 *
 *   Authorization: Bearer gs_xxx
 *   Content-Type: application/json
 *   { "url": "https://...", "title"?: "...", "notes"?: "...", "workspaceId"?: "uuid" }
 *
 * `text` may be sent instead of `url`; the first link in it is used.
 */

const CORS_HEADERS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "POST, OPTIONS",
  "access-control-allow-headers": "authorization, content-type, x-api-key",
};

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: CORS_HEADERS });
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(request: NextRequest) {
  const key = readApiKey(request.headers);
  if (!key) return json({ error: "missing_api_key" }, 401);

  // The admin client bypasses RLS, so every permission check below is explicit.
  const supabase = createAdminClient();
  const { data: apiKey } = await supabase
    .from("api_keys")
    .select("id, user_id, revoked_at")
    .eq("key_hash", hashApiKey(key))
    .maybeSingle();
  if (!apiKey || apiKey.revoked_at) return json({ error: "invalid_api_key" }, 401);

  const body = await request.json().catch(() => null);
  const parsed = captureSchema.safeParse(body);
  if (!parsed.success) return json({ error: "invalid_body", details: parsed.error.issues }, 400);

  const url = parsed.data.url ?? (parsed.data.text ? extractFirstUrl(parsed.data.text) : null);
  if (!url) return json({ error: "missing_url" }, 400);

  // Pick the workspace: the one asked for (if the key owner is a member) or their default.
  const { data: memberships } = await supabase
    .from("workspace_members")
    .select("workspace_id, joined_at")
    .eq("user_id", apiKey.user_id)
    .order("joined_at", { ascending: true });
  const { data: profile } = await supabase
    .from("profiles")
    .select("default_workspace_id")
    .eq("id", apiKey.user_id)
    .single();

  const memberOf = new Set((memberships ?? []).map((m) => m.workspace_id));
  const wanted = parsed.data.workspaceId ?? profile?.default_workspace_id ?? null;
  if (parsed.data.workspaceId && !memberOf.has(parsed.data.workspaceId)) {
    return json({ error: "workspace_forbidden" }, 403);
  }
  const workspaceId = wanted && memberOf.has(wanted) ? wanted : memberships?.[0]?.workspace_id;
  if (!workspaceId) return json({ error: "no_workspace" }, 400);

  const result = await addLink(supabase, {
    workspaceId,
    userId: apiKey.user_id,
    url,
    title: parsed.data.title,
    notes: parsed.data.notes,
    category: parsed.data.category,
  });

  await supabase.from("api_keys").update({ last_used_at: new Date().toISOString() }).eq("id", apiKey.id);

  if (result.ok) return json({ status: "created", item: { id: result.item.id, title: result.item.title, category: result.item.category } }, 201);
  if (result.reason === "duplicate") return json({ status: "duplicate", item: result.item ? { id: result.item.id } : null }, 200);
  if (result.reason === "invalid_url") return json({ error: "invalid_url" }, 400);
  return json({ error: "server_error" }, 500);
}
