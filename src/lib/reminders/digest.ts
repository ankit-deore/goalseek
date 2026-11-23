import { closedStatuses, reminderRules } from "@/config/items";
import { daysBetween } from "@/lib/format";
import type { Item } from "@/types/database";

export type Digest = {
  dueSoon: Item[];
  untouched: Item[];
};

/**
 * Pick what goes in one person's daily email from the items in their
 * workspaces. An item counts for you if you own it, or if nobody does yet.
 */
export function buildDigest(items: Item[], userId: string, today: string, now = new Date()): Digest {
  const relevant = items.filter((i) => i.owner_id === userId || i.owner_id === null);

  const dueSoon = relevant
    .filter((i) => i.deadline && !closedStatuses.includes(i.status) && i.status !== "applied")
    .filter((i) => {
      const days = daysBetween(today, i.deadline!);
      return days >= -1 && days <= reminderRules.deadlineWindowDays;
    })
    .sort((a, b) => a.deadline!.localeCompare(b.deadline!))
    .slice(0, reminderRules.maxItemsPerSection);

  const cutoff = now.getTime() - reminderRules.untouchedAfterDays * 24 * 60 * 60 * 1000;
  const dueIds = new Set(dueSoon.map((i) => i.id));
  const untouched = relevant
    .filter((i) => i.status === "new" && !dueIds.has(i.id) && Date.parse(i.last_activity_at) < cutoff)
    .sort((a, b) => a.created_at.localeCompare(b.created_at))
    .slice(0, reminderRules.maxItemsPerSection);

  return { dueSoon, untouched };
}

export function isDigestEmpty(d: Digest): boolean {
  return d.dueSoon.length === 0 && d.untouched.length === 0;
}
