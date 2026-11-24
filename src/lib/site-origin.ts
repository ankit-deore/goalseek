import "server-only";
import { headers } from "next/headers";
import { publicEnv } from "@/config/public-env";

/**
 * The address this request came in on, such as https://goalseek.vercel.app.
 * Used for URLs shown to the user (like the capture endpoint), so they stay
 * right even when NEXT_PUBLIC_SITE_URL is missing or set to the wrong site.
 * Falls back to NEXT_PUBLIC_SITE_URL outside a request.
 */
export async function getRequestOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (!host) return publicEnv.siteUrl;
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto.split(",")[0].trim()}://${host.split(",")[0].trim()}`;
}
