import { categoryLabels } from "@/config/items";
import { site } from "@/config/site";
import { routes } from "@/config/routes";
import { deadlineLabel } from "@/lib/format";
import type { Digest } from "@/lib/reminders/digest";
import type { Item } from "@/types/database";

const escape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Email clients ignore external CSS, so the digest carries one <style> block. */
const STYLES = `
  body { margin: 0; background: #f8fafc; font-family: -apple-system, Segoe UI, Roboto, Arial, sans-serif; color: #0f172a; }
  .wrap { max-width: 560px; margin: 0 auto; padding: 24px 16px; }
  .brand { color: #4f46e5; font-weight: 700; font-size: 20px; margin: 0 0 16px; }
  .card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 16px; }
  h2 { font-size: 16px; margin: 0 0 12px; }
  ul { list-style: none; padding: 0; margin: 0; }
  li { padding: 8px 0; border-top: 1px solid #f1f5f9; }
  li:first-child { border-top: 0; }
  a { color: #4f46e5; text-decoration: none; font-weight: 600; }
  .meta { color: #64748b; font-size: 13px; }
  .btn { display: inline-block; background: #4f46e5; color: #ffffff; padding: 10px 16px; border-radius: 8px; }
  .foot { color: #94a3b8; font-size: 12px; margin-top: 24px; }
`;

function itemLine(item: Item, siteUrl: string, today: string, showDeadline: boolean) {
  const title = escape(item.title || item.url);
  const meta = [categoryLabels[item.category], item.site_name, showDeadline && item.deadline ? deadlineLabel(item.deadline, today) : null]
    .filter(Boolean)
    .map((s) => escape(String(s)))
    .join(" · ");
  return `<li><a href="${siteUrl}${routes.item(item.id)}">${title}</a><div class="meta">${meta}</div></li>`;
}

export function renderDigestEmail(opts: { name: string | null; digest: Digest; siteUrl: string; today: string }) {
  const { digest, siteUrl, today } = opts;
  const greeting = opts.name ? `Hi ${escape(opts.name.split(" ")[0])},` : "Hi,";
  const total = digest.dueSoon.length + digest.untouched.length;
  const subject =
    digest.dueSoon.length > 0
      ? `${digest.dueSoon.length} deadline${digest.dueSoon.length === 1 ? "" : "s"} coming up · ${site.name}`
      : `${total} link${total === 1 ? "" : "s"} waiting for you · ${site.name}`;

  const sections: string[] = [];
  if (digest.dueSoon.length) {
    sections.push(
      `<div class="card"><h2>Deadlines coming up</h2><ul>${digest.dueSoon.map((i) => itemLine(i, siteUrl, today, true)).join("")}</ul></div>`,
    );
  }
  if (digest.untouched.length) {
    sections.push(
      `<div class="card"><h2>Links nobody has looked at yet</h2><ul>${digest.untouched.map((i) => itemLine(i, siteUrl, today, false)).join("")}</ul></div>`,
    );
  }

  const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><style>${STYLES}</style></head>
<body><div class="wrap">
<p class="brand">${site.name}</p>
<p>${greeting} here's your daily check-in.</p>
${sections.join("\n")}
<p><a class="btn" href="${siteUrl}${routes.inbox}">Open ${site.name}</a></p>
<p class="foot">${escape(site.tagline)} You can change the time or turn this email off in <a href="${siteUrl}${routes.settings}">Settings</a>.</p>
</div></body></html>`;

  const textLines = [
    `${greeting} here's your daily check-in.`,
    "",
    ...(digest.dueSoon.length ? ["Deadlines coming up:", ...digest.dueSoon.map((i) => `- ${i.title || i.url} (${deadlineLabel(i.deadline!, today)}) ${siteUrl}${routes.item(i.id)}`), ""] : []),
    ...(digest.untouched.length ? ["Links nobody has looked at yet:", ...digest.untouched.map((i) => `- ${i.title || i.url} ${siteUrl}${routes.item(i.id)}`), ""] : []),
    `Change or turn off this email: ${siteUrl}${routes.settings}`,
  ];

  return { subject, html, text: textLines.join("\n") };
}
