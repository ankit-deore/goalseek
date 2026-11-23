/** Small date helpers for display. All dates are shown in the viewer's locale. */

const DAY_MS = 24 * 60 * 60 * 1000;

/** Today's date (YYYY-MM-DD) in a given IANA time zone. */
export function todayIn(timeZone: string, now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

/** Whole days from `from` (YYYY-MM-DD) to `to` (YYYY-MM-DD). */
export function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / DAY_MS);
}

/** "Due today", "Due in 3 days", "Overdue by 2 days". */
export function deadlineLabel(deadline: string, today: string): string {
  const diff = daysBetween(today, deadline);
  if (diff === 0) return "Due today";
  if (diff === 1) return "Due tomorrow";
  if (diff > 1) return `Due in ${diff} days`;
  if (diff === -1) return "Overdue by 1 day";
  return `Overdue by ${-diff} days`;
}

export function deadlineTone(deadline: string, today: string): "overdue" | "soon" | "later" {
  const diff = daysBetween(today, deadline);
  if (diff < 0) return "overdue";
  if (diff <= 3) return "soon";
  return "later";
}

/** "5 minutes ago", "3 days ago". */
export function timeAgo(iso: string, now = new Date()): string {
  const seconds = Math.max(0, Math.round((now.getTime() - Date.parse(iso)) / 1000));
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  if (seconds < 60) return rtf.format(-seconds, "second");
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return rtf.format(-minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (hours < 24) return rtf.format(-hours, "hour");
  return rtf.format(-Math.round(hours / 24), "day");
}

/** "9 PM", "12 AM" for an hour 0–23. */
export function hourLabel(hour: number): string {
  const suffix = hour < 12 ? "AM" : "PM";
  const h = hour % 12 === 0 ? 12 : hour % 12;
  return `${h} ${suffix}`;
}
