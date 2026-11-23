import { todayIn } from "@/lib/format";

export type ReminderProfile = {
  timezone: string;
  reminder_hour: number;
  reminders_enabled: boolean;
  last_digest_sent_on: string | null;
};

/** The current hour (0–23) in a time zone. */
export function localHour(timeZone: string, now = new Date()): number {
  const hour = new Intl.DateTimeFormat("en-US", { timeZone, hour: "numeric", hourCycle: "h23" }).format(now);
  return Number(hour) % 24;
}

/**
 * Should this person get their digest now? Yes once their local time has
 * reached their chosen hour and they haven't had one today. Using ">="
 * (not "==") means a late or skipped cron run still sends later that day.
 */
export function isDigestDue(profile: ReminderProfile, now = new Date()): boolean {
  if (!profile.reminders_enabled) return false;
  const today = todayIn(profile.timezone, now);
  if (profile.last_digest_sent_on === today) return false;
  return localHour(profile.timezone, now) >= profile.reminder_hour;
}
