/**
 * Browser-safe environment variables. Next.js inlines NEXT_PUBLIC_* at build
 * time, so each one has to be read with its full literal name.
 */
function required(name: string, value: string | undefined): string {
  if (!value) throw new Error(`${name} is missing. See README "Environment variables".`);
  return value;
}

export const publicEnv = {
  get supabaseUrl() {
    return required("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL);
  },
  get supabasePublishableKey() {
    return required(
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    );
  },
  /** Public URL of the app, used in emails and invite links. */
  get siteUrl() {
    return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  },
};
