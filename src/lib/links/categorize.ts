import { categoryRules, type Category } from "@/config/items";

function hostMatches(url: URL, pattern: string): boolean {
  const host = url.hostname.toLowerCase().replace(/^www\./, "");
  if (pattern.includes("/")) {
    // Pattern like "linkedin.com/learning": host plus path prefix.
    const [patternHost, ...rest] = pattern.split("/");
    const patternPath = `/${rest.join("/")}`;
    return (host === patternHost || host.endsWith(`.${patternHost}`)) && url.pathname.toLowerCase().startsWith(patternPath);
  }
  return host === pattern || host.endsWith(`.${pattern}`);
}

/**
 * Guess what kind of link this is from its URL (and title, if we have it).
 * Host rules are checked across all categories first, because a host is a
 * stronger signal than a word in the path.
 */
export function guessCategory(url: URL, title?: string | null): Category {
  for (const rule of categoryRules) {
    if (rule.hosts.some((h) => hostMatches(url, h))) return rule.category;
  }

  const haystack = `${url.pathname}${url.search}`.toLowerCase();
  for (const rule of categoryRules) {
    if (rule.paths.some((p) => haystack.includes(p.toLowerCase()))) return rule.category;
  }

  if (title) {
    const t = title.toLowerCase();
    if (/\b(hiring|job|role|position|opening|intern(ship)?|vacancy)\b/.test(t)) return "job";
    if (/\b(certification|certificate|course)\b/.test(t)) return "certification";
    if (/\b(meetup|webinar|conference|hackathon|summit)\b/.test(t)) return "meetup";
  }

  return "resource";
}
