import "server-only";
import { z } from "zod";

/**
 * Server-side environment variables, validated once.
 * Public (browser) variables live in ./public-env.ts.
 */
const schema = z.object({
  SUPABASE_SECRET_KEY: z.string().min(1, "SUPABASE_SECRET_KEY is missing"),
  CRON_SECRET: z.string().min(16, "CRON_SECRET should be at least 16 characters"),
  EMAIL_PROVIDER: z.enum(["resend", "smtp"]).default("resend"),
  EMAIL_FROM: z.string().min(1).default("GoalSeek <onboarding@resend.dev>"),
  RESEND_API_KEY: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
});

export type ServerEnv = z.infer<typeof schema>;

let cached: ServerEnv | undefined;

export function serverEnv(): ServerEnv {
  if (!cached) {
    const parsed = schema.safeParse(process.env);
    if (!parsed.success) {
      const issues = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
      throw new Error(`Invalid server environment: ${issues}`);
    }
    cached = parsed.data;
  }
  return cached;
}
