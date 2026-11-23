import "server-only";
import { publicEnv } from "@/config/public-env";
import { getEmailSender } from "@/lib/email/send";
import { renderDigestEmail } from "@/lib/email/templates/digest";
import { todayIn } from "@/lib/format";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildDigest, isDigestEmpty } from "./digest";
import { isDigestDue } from "./schedule";

export type RunSummary = { checked: number; due: number; sent: number; empty: number; failed: number };

/**
 * Send every digest that is due right now. Safe to call as often as you like:
 * each person gets at most one email per local day.
 */
export async function runDailyReminders(now = new Date()): Promise<RunSummary> {
  const supabase = createAdminClient();
  const sender = getEmailSender();
  const summary: RunSummary = { checked: 0, due: 0, sent: 0, empty: 0, failed: 0 };

  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, timezone, reminder_hour, reminders_enabled, last_digest_sent_on")
    .eq("reminders_enabled", true);
  if (error) throw error;

  for (const profile of profiles ?? []) {
    summary.checked++;
    if (!isDigestDue(profile, now) || !profile.email) continue;
    summary.due++;
    const today = todayIn(profile.timezone, now);

    try {
      const { data: memberships } = await supabase.from("workspace_members").select("workspace_id").eq("user_id", profile.id);
      const workspaceIds = (memberships ?? []).map((m) => m.workspace_id);

      const { data: items } = workspaceIds.length
        ? await supabase.from("items").select("*").in("workspace_id", workspaceIds).in("status", ["new", "interested", "interview"])
        : { data: [] };

      const digest = buildDigest(items ?? [], profile.id, today, now);
      if (isDigestEmpty(digest)) {
        summary.empty++;
      } else {
        const email = renderDigestEmail({ name: profile.full_name, digest, siteUrl: publicEnv.siteUrl, today });
        await sender.send({ to: profile.email, ...email });
        summary.sent++;
      }

      await supabase.from("profiles").update({ last_digest_sent_on: today }).eq("id", profile.id);
    } catch (err) {
      summary.failed++;
      console.error(`Reminder failed for ${profile.id}:`, err);
    }
  }

  return summary;
}
