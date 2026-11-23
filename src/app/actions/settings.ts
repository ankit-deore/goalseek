"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { copy } from "@/config/site";
import { routes } from "@/config/routes";
import { generateApiKey } from "@/lib/api-keys";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/data/session";
import { apiKeyNameSchema, formToObject, reminderSettingsSchema } from "@/lib/validation";
import type { ActionState } from "./state";

export async function saveReminderSettingsAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  const data = formToObject(form);
  const parsed = reminderSettingsSchema.safeParse({ ...data, reminders_enabled: data.reminders_enabled ?? "off" });
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? copy.common.error };

  const user = await requireUser();
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update(parsed.data).eq("id", user.id);
  if (error) return { status: "error", message: copy.common.error };

  revalidatePath(routes.settings);
  return { status: "success", message: copy.settings.reminders.saved };
}

export async function createApiKeyAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  const parsed = apiKeyNameSchema.safeParse(formToObject(form));
  if (!parsed.success) return { status: "error", message: copy.common.error };

  const user = await requireUser();
  const supabase = await createClient();
  const { key, prefix, hash } = generateApiKey();
  const { error } = await supabase
    .from("api_keys")
    .insert({ user_id: user.id, name: parsed.data.name, prefix, key_hash: hash });
  if (error) return { status: "error", message: copy.common.error };

  revalidatePath(routes.settings);
  return { status: "success", message: copy.settings.apiKeys.copyNow, data: key };
}

export async function revokeApiKeyAction(form: FormData): Promise<void> {
  const id = z.uuid().safeParse(form.get("id"));
  if (!id.success) return;
  const user = await requireUser();
  const supabase = await createClient();
  await supabase
    .from("api_keys")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", id.data)
    .eq("user_id", user.id);
  revalidatePath(routes.settings);
}
