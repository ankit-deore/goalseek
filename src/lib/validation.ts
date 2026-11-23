import { z } from "zod";
import { CATEGORIES, STATUSES, limits } from "@/config/items";

const optionalText = (max: number) =>
  z
    .string()
    .max(max)
    .transform((v) => (v.trim() === "" ? null : v.trim()))
    .nullable()
    .optional();

export const categorySchema = z.enum(CATEGORIES);
export const statusSchema = z.enum(STATUSES);
const uuid = z.uuid();

export const addLinkSchema = z.object({
  url: z.string().trim().min(1).max(limits.url),
});

export const statusUpdateSchema = z.object({
  id: uuid,
  status: statusSchema,
});

export const itemUpdateSchema = z.object({
  id: uuid,
  title: optionalText(limits.title),
  category: categorySchema,
  status: statusSchema,
  owner_id: z
    .string()
    .transform((v) => (v === "" ? null : v))
    .pipe(uuid.nullable()),
  deadline: z
    .string()
    .transform((v) => (v === "" ? null : v))
    .pipe(z.iso.date().nullable()),
  resume_version: optionalText(limits.resumeVersion),
  jd_text: optionalText(limits.jdText),
  notes: optionalText(limits.notes),
});

export const reminderSettingsSchema = z.object({
  reminders_enabled: z.preprocess((v) => v === "on" || v === "true" || v === true, z.boolean()),
  reminder_hour: z.coerce.number().int().min(0).max(23),
  timezone: z.string().refine(isValidTimeZone, "Unknown time zone"),
});

export const workspaceNameSchema = z.object({
  name: z.string().trim().min(1).max(limits.workspaceName),
});

export const apiKeyNameSchema = z.object({
  name: z.string().trim().min(1).max(limits.apiKeyName),
});

/** Body accepted by POST /api/capture. */
export const captureSchema = z.object({
  url: z.string().trim().min(1).max(limits.url).optional(),
  /** Free text such as a forwarded message; the first link in it is used. */
  text: z.string().max(10000).optional(),
  title: z.string().max(limits.title).optional(),
  notes: z.string().max(limits.notes).optional(),
  category: categorySchema.optional(),
  workspaceId: uuid.optional(),
});

export function isValidTimeZone(tz: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/** FormData → plain object for zod. */
export function formToObject(form: FormData): Record<string, string> {
  const out: Record<string, string> = {};
  form.forEach((value, key) => {
    if (typeof value === "string") out[key] = value;
  });
  return out;
}
