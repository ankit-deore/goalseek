import { limits } from "@/config/items";

/** Query parameters that only track where a click came from. */
const TRACKING_PARAMS = [
  /^utm_/i,
  /^fbclid$/i,
  /^gclid$/i,
  /^mc_(cid|eid)$/i,
  /^ref(_src|src)?$/i,
  /^trk(Info)?$/i,
  /^trackingId$/i,
  /^refId$/i,
  /^lipi$/i,
  /^si$/i,
  /^igshid$/i,
];

/**
 * Parse user input into an http(s) URL. Accepts "example.com/job" without a
 * scheme. Returns null if it isn't a usable web link.
 */
export function parseUrl(input: string): URL | null {
  const raw = input.trim();
  if (!raw || raw.length > limits.url) return null;
  const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    const url = new URL(withScheme);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (!url.hostname.includes(".")) return null;
    return url;
  } catch {
    return null;
  }
}

/** Pull the first link out of free text, e.g. a WhatsApp message. */
export function extractFirstUrl(text: string): string | null {
  const match = text.match(/https?:\/\/[^\s<>"']+/i);
  return match ? match[0].replace(/[).,;!?]+$/, "") : null;
}

/**
 * A canonical form used to spot duplicates: lowercase host, no "www.", no
 * tracking params, no hash, no trailing slash, sorted query.
 */
export function normalizeUrl(url: URL): string {
  const copy = new URL(url.toString());
  copy.hash = "";
  copy.hostname = copy.hostname.toLowerCase().replace(/^www\./, "");
  copy.protocol = "https:";

  const kept = [...copy.searchParams.entries()]
    .filter(([key]) => !TRACKING_PARAMS.some((re) => re.test(key)))
    .sort(([a], [b]) => a.localeCompare(b));
  copy.search = "";
  kept.forEach(([k, v]) => copy.searchParams.append(k, v));

  let out = copy.toString();
  if (copy.pathname.endsWith("/") && copy.pathname !== "/") {
    out = out.replace(/\/(\?|$)/, "$1");
  }
  return out.replace(/\/$/, "");
}
