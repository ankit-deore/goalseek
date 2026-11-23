import { describe, expect, it } from "vitest";
import type { Item } from "@/types/database";
import { buildDigest, isDigestEmpty } from "./digest";
import { isDigestDue, localHour } from "./schedule";

const base = { timezone: "Asia/Kolkata", reminder_hour: 21, reminders_enabled: true, last_digest_sent_on: null };

describe("isDigestDue", () => {
  // 15:30 UTC = 21:00 IST
  const at9pmIST = new Date("2026-11-23T15:30:00Z");
  const at8pmIST = new Date("2026-11-23T14:30:00Z");

  it("reads the local hour in the user's time zone", () => {
    expect(localHour("Asia/Kolkata", at9pmIST)).toBe(21);
  });
  it("is due at the chosen local hour", () => {
    expect(isDigestDue(base, at9pmIST)).toBe(true);
  });
  it("is not due before the chosen hour", () => {
    expect(isDigestDue(base, at8pmIST)).toBe(false);
  });
  it("is not due twice on the same local day", () => {
    expect(isDigestDue({ ...base, last_digest_sent_on: "2026-11-23" }, at9pmIST)).toBe(false);
  });
  it("catches up if the 9 PM run was missed", () => {
    expect(isDigestDue(base, new Date("2026-11-23T17:30:00Z"))).toBe(true); // 11 PM IST
  });
  it("respects the off switch", () => {
    expect(isDigestDue({ ...base, reminders_enabled: false }, at9pmIST)).toBe(false);
  });
});

function item(over: Partial<Item>): Item {
  return {
    id: crypto.randomUUID(),
    workspace_id: "w",
    url: "https://a.com",
    normalized_url: "https://a.com",
    title: "Thing",
    description: null,
    image_url: null,
    site_name: null,
    category: "job",
    status: "new",
    owner_id: null,
    added_by: null,
    notes: null,
    jd_text: null,
    resume_version: null,
    deadline: null,
    last_activity_at: "2026-11-23T00:00:00Z",
    created_at: "2026-11-23T00:00:00Z",
    updated_at: "2026-11-23T00:00:00Z",
    ...over,
  };
}

describe("buildDigest", () => {
  const me = "me";
  const now = new Date("2026-11-23T15:30:00Z");
  const today = "2026-11-23";
  const old = "2026-11-18T00:00:00Z";

  it("lists deadlines in the next few days for me or nobody", () => {
    const d = buildDigest(
      [
        item({ title: "mine", owner_id: me, status: "interested", deadline: "2026-11-25" }),
        item({ title: "nobody", deadline: "2026-11-23" }),
        item({ title: "friend", owner_id: "friend", deadline: "2026-11-24" }),
        item({ title: "far", deadline: "2026-12-30" }),
        item({ title: "applied", owner_id: me, status: "applied", deadline: "2026-11-24" }),
      ],
      me,
      today,
      now,
    );
    expect(d.dueSoon.map((i) => i.title)).toEqual(["nobody", "mine"]);
  });

  it("lists old untouched new links, not fresh ones", () => {
    const d = buildDigest(
      [item({ title: "stale", last_activity_at: old, created_at: old }), item({ title: "fresh" })],
      me,
      today,
      now,
    );
    expect(d.untouched.map((i) => i.title)).toEqual(["stale"]);
  });

  it("is empty when there's nothing to say", () => {
    expect(isDigestEmpty(buildDigest([item({})], me, today, now))).toBe(true);
  });
});
