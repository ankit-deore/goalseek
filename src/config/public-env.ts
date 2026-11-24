/**
 * Browser-safe environment variables. Next.js inlines NEXT_PUBLIC_* at build
 * time, so each one has to be read with its full literal name.
 */
function required(name: string, value: string | undefined): string {
  if (!value) throw new Error(`${name} is missing. See README "Environment variables".`);
  return value;
}

/**
 * Keep only the scheme and host of the Supabase URL. Supabase adds paths like
 * /auth/v1 itself, so a pasted "https://x.supabase.co/rest/v1/" would send
 * sign-in to the wrong address and Supabase would answer "No API key found
 * in request".
 */
export function toSupabaseOrigin(value: string): string {
  try {
    return new URL(value.trim()).origin;
  } catch {
    throw new Error(`NEXT_PUBLIC_SUPABASE_URL is not a valid URL. Use the Project URL, like https://abcd1234.supabase.co`);
  }
}

export const publicEnv = {
  get supabaseUrl() {
    return toSupabaseOrigin(required("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL));
  },
  get supabasePublishableKey() {
    return required(
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    ).trim();
  },
  /** Public URL of the app, used in emails and invite links. */
  get siteUrl() {
    return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  },
};
