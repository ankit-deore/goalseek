import { describe, expect, it } from "vitest";
import { generateApiKey, hashApiKey, readApiKey } from "./api-keys";
import { deadlineLabel, hourLabel, todayIn } from "./format";
import { safeNextPath } from "@/config/routes";

describe("api keys", () => {
  it("stores only a hash, and the hash matches the key", () => {
    const { key, prefix, hash } = generateApiKey();
    expect(key.startsWith("gs_")).toBe(true);
    expect(key.startsWith(prefix)).toBe(true);
    expect(hash).toBe(hashApiKey(key));
    expect(hash).not.toContain(key);
  });
  it("reads Bearer and x-api-key headers", () => {
    expect(readApiKey(new Headers({ authorization: "Bearer gs_abc" }))).toBe("gs_abc");
    expect(readApiKey(new Headers({ "x-api-key": "gs_abc" }))).toBe("gs_abc");
    expect(readApiKey(new Headers({ authorization: "gs_abc" }))).toBe("gs_abc");
    expect(readApiKey(new Headers({ authorization: "Bearer nope" }))).toBeNull();
  });
});

describe("format", () => {
  it("labels deadlines", () => {
    expect(deadlineLabel("2026-11-23", "2026-11-23")).toBe("Due today");
    expect(deadlineLabel("2026-11-26", "2026-11-23")).toBe("Due in 3 days");
    expect(deadlineLabel("2026-11-21", "2026-11-23")).toBe("Overdue by 2 days");
  });
  it("labels hours", () => {
    expect(hourLabel(0)).toBe("12 AM");
    expect(hourLabel(21)).toBe("9 PM");
  });
  it("finds today in a time zone", () => {
    expect(todayIn("Asia/Kolkata", new Date("2026-11-23T20:00:00Z"))).toBe("2026-11-24");
  });
});

describe("safeNextPath", () => {
  it("blocks redirects to other sites", () => {
    expect(safeNextPath("//evil.com")).toBe("/inbox");
    expect(safeNextPath("https://evil.com")).toBe("/inbox");
    expect(safeNextPath("/items/1")).toBe("/items/1");
  });
});
