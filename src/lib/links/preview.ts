import "server-only";
import { lookup } from "node:dns/promises";
import { previewRules } from "@/config/items";
import { parseMeta, type LinkMeta } from "./parse-meta";
import { isPrivateAddress } from "./safe-host";

const EMPTY: LinkMeta = { title: null, description: null, image: null, siteName: null };
const MAX_REDIRECTS = 4;

/** Refuse to fetch anything that resolves to our own network (SSRF guard). */
async function assertPublicHost(url: URL): Promise<void> {
  const addresses = await lookup(url.hostname, { all: true });
  if (addresses.length === 0 || addresses.some((a) => isPrivateAddress(a.address))) {
    throw new Error("Refusing to fetch a private address");
  }
}

async function readLimited(response: Response, maxBytes: number): Promise<string> {
  if (!response.body) return "";
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (total < maxBytes) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    total += value.byteLength;
  }
  await reader.cancel().catch(() => {});
  return new TextDecoder().decode(Buffer.concat(chunks).subarray(0, maxBytes));
}

/**
 * Fetch a page and read its title, description and image. Never throws:
 * many job sites block bots, so we fall back to empty metadata.
 */
export async function fetchLinkPreview(url: URL): Promise<LinkMeta> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), previewRules.timeoutMs);

  try {
    let current = url;
    for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
      await assertPublicHost(current);
      const response = await fetch(current, {
        redirect: "manual",
        signal: controller.signal,
        headers: {
          "user-agent": previewRules.userAgent,
          accept: "text/html,application/xhtml+xml",
          "accept-language": "en",
        },
      });

      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get("location");
        if (!location) return EMPTY;
        current = new URL(location, current);
        if (current.protocol !== "http:" && current.protocol !== "https:") return EMPTY;
        continue;
      }

      const type = response.headers.get("content-type") ?? "";
      if (!response.ok || !type.includes("html")) return EMPTY;

      const html = await readLimited(response, previewRules.maxBytes);
      return parseMeta(html, current.toString());
    }
    return EMPTY;
  } catch {
    return EMPTY;
  } finally {
    clearTimeout(timer);
  }
}
