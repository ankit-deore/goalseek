import type { Metadata } from "next";
import { statusLabels, trackerStatuses } from "@/config/items";
import { copy, site } from "@/config/site";
import { routes } from "@/config/routes";
import { ItemCard } from "@/components/item-card";
import { ItemFilters, readFilters } from "@/components/item-filters";
import { listItems } from "@/lib/data/items";
import { getMyProfile } from "@/lib/data/profile";
import { getCurrentWorkspace, peopleMap } from "@/lib/data/workspaces";
import { todayIn } from "@/lib/format";

export const metadata: Metadata = { title: `${copy.tracker.heading} · ${site.name}` };

export default async function TrackerPage({ searchParams }: PageProps<"/tracker">) {
  const filters = readFilters(await searchParams);
  const [{ user, supabase, current }, profile] = await Promise.all([getCurrentWorkspace(), getMyProfile()]);
  if (!current) return <p className="muted">{copy.common.error}</p>;

  const [items, people] = await Promise.all([
    listItems(supabase, current.id, {
      statuses: trackerStatuses,
      category: filters.category,
      ownerId: filters.mine ? user.id : undefined,
    }),
    peopleMap(supabase, current.id),
  ]);
  const today = todayIn(profile.timezone);

  return (
    <div className="stack">
      <div className="page-header">
        <h1 className="page-title">{copy.tracker.heading}</h1>
        <p className="muted">{copy.tracker.sub}</p>
      </div>
      <ItemFilters basePath={routes.tracker} {...filters} />
      {items.length === 0 ? (
        <p className="empty">{copy.tracker.empty}</p>
      ) : (
        trackerStatuses.map((status) => {
          const group = items.filter((i) => i.status === status);
          if (group.length === 0) return null;
          return (
            <section key={status} className="tracker-group">
              <h2 className="section-title">
                {statusLabels[status]} <span className="count">{group.length}</span>
              </h2>
              <div className="item-list">
                {group.map((item) => (
                  <ItemCard key={item.id} item={item} today={today} people={people} />
                ))}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}
