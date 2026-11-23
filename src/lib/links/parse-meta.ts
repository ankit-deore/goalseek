export type LinkMeta = {
  title: string | null;
  description: string | null;
  image: string | null;
  siteName: string | null;
};

const ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
  "&nbsp;": " ",
};

function decode(text: string): string {
  return text
    .replace(/&(amp|lt|gt|quot|apos|nbsp|#39);/g, (m) => ENTITIES[m] ?? m)
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/\s+/g, " ")
    .trim();
}

function attr(tag: string, name: string): string | null {
  const re = new RegExp(`${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, "i");
  const m = tag.match(re);
  return m ? (m[2] ?? m[3] ?? m[4] ?? null) : null;
}

/**
 * Read Open Graph / Twitter / <title> tags from an HTML string.
 * Deliberately small: we only need a handful of tags from the <head>.
 */
export function parseMeta(html: string, baseUrl: string): LinkMeta {
  const head = html.slice(0, 300_000);
  const metas = new Map<string, string>();

  for (const [tag] of head.matchAll(/<meta\b[^>]*>/gi)) {
    const key = (attr(tag, "property") ?? attr(tag, "name"))?.toLowerCase();
    const content = attr(tag, "content");
    if (key && content && !metas.has(key)) metas.set(key, decode(content));
  }

  const titleTag = head.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1];
  const pick = (...keys: string[]) => keys.map((k) => metas.get(k)).find((v) => v && v.length > 0) ?? null;

  let image = pick("og:image", "og:image:url", "twitter:image");
  if (image) {
    try {
      image = new URL(image, baseUrl).toString();
    } catch {
      image = null;
    }
  }

  return {
    title: pick("og:title", "twitter:title") ?? (titleTag ? decode(titleTag) : null),
    description: pick("og:description", "twitter:description", "description"),
    image,
    siteName: pick("og:site_name", "application-name"),
  };
}
