import type { Metadata } from "next";
import { copy, site } from "@/config/site";
import { routes } from "@/config/routes";
import { AddLinkForm } from "@/components/add-link-form";
import { ItemCard } from "@/components/item-card";
import { ItemFilters, readFilters } from "@/components/item-filters";
import { listItems } from "@/lib/data/items";
import { getMyProfile } from "@/lib/data/profile";
import { getCurrentWorkspace, peopleMap } from "@/lib/data/workspaces";
import { todayIn } from "@/lib/format";

export const metadata: Metadata = { title: `${copy.inbox.heading} · ${site.name}` };

export default async function InboxPage({ searchParams }: PageProps<"/inbox">) {
  const filters = readFilters(await searchParams);
  const [{ user, supabase, current }, profile] = await Promise.all([getCurrentWorkspace(), getMyProfile()]);
  if (!current) return <p className="muted">{copy.common.error}</p>;

  const [items, people] = await Promise.all([
    listItems(supabase, current.id, {
      statuses: ["new"],
      category: filters.category,
      ownerId: filters.mine ? user.id : undefined,
    }),
    peopleMap(supabase, current.id),
  ]);
  const today = todayIn(profile.timezone);

  return (
    <div className="stack">
      <div className="page-header">
        <h1 className="page-title">{copy.inbox.heading}</h1>
        <p className="muted">{copy.inbox.sub}</p>
      </div>
      <AddLinkForm />
      <ItemFilters basePath={routes.inbox} {...filters} />
      {items.length === 0 ? (
        <p className="empty">{copy.inbox.empty}</p>
      ) : (
        <div className="item-list">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} today={today} people={people} />
          ))}
        </div>
      )}
    </div>
  );
}
