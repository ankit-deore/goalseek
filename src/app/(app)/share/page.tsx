import { copy } from "@/config/site";
import { shareLinkAction } from "@/app/actions/items";
import { AutoSubmitForm } from "@/components/auto-submit-form";
import { SubmitButton } from "@/components/submit-button";
import { extractFirstUrl, parseUrl } from "@/lib/links/normalize";

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

/**
 * Android "Share → GoalSeek" lands here. Apps put the link in different
 * fields (url, text or title), so look in all of them.
 */
export default async function SharePage({ searchParams }: PageProps<"/share">) {
  const params = await searchParams;
  const title = first(params.title);
  const candidates = [first(params.url), extractFirstUrl(first(params.text)), extractFirstUrl(title)];
  const url = candidates.find((c) => c && parseUrl(c)) ?? null;

  if (!url) return <p className="empty">{copy.share.noUrl}</p>;

  return (
    <div className="card stack">
      <h1 className="page-title">{copy.share.heading}</h1>
      <AutoSubmitForm action={shareLinkAction}>
        <input type="hidden" name="url" value={url} />
        <input type="hidden" name="title" value={title} />
        <p className="muted break-all">{url}</p>
        <SubmitButton pendingLabel={copy.inbox.adding}>{copy.inbox.addButton}</SubmitButton>
      </AutoSubmitForm>
    </div>
  );
}
