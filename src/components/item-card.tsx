import Link from "next/link";
import { STATUSES, statusLabels } from "@/config/items";
import { routes } from "@/config/routes";
import { copy } from "@/config/site";
import { updateStatusAction } from "@/app/actions/items";
import { timeAgo } from "@/lib/format";
import type { Item } from "@/types/database";
import { AutoSubmitSelect } from "./auto-submit-select";
import { CategoryBadge, DeadlineBadge } from "./badges";

const statusOptions = STATUSES.map((s) => ({ value: s, label: statusLabels[s] }));

type Props = {
  item: Item;
  today: string;
  /** user id → display name, for owner labels. */
  people: Map<string, string>;
};

export function ItemCard({ item, today, people }: Props) {
  const owner = item.owner_id ? people.get(item.owner_id) : null;

  return (
    <article className="card item-card">
      <div className="item-card-main">
        <div className="item-card-badges">
          <CategoryBadge category={item.category} />
          {item.deadline && <DeadlineBadge deadline={item.deadline} today={today} />}
        </div>
        <Link href={routes.item(item.id)} className="item-title">
          {item.title || item.url}
        </Link>
        <p className="item-meta">
          <a href={item.url} target="_blank" rel="noopener noreferrer" className="item-source">
            {item.site_name ?? new URL(item.url).hostname}
          </a>
          <span aria-hidden="true">·</span>
          <span>{timeAgo(item.created_at)}</span>
          <span aria-hidden="true">·</span>
          <span>
            {copy.item.fields.owner}: {owner ?? copy.item.unassigned}
          </span>
        </p>
      </div>
      <form action={updateStatusAction} className="item-card-status">
        <input type="hidden" name="id" value={item.id} />
        <AutoSubmitSelect name="status" defaultValue={item.status} options={statusOptions} label={copy.item.fields.status} />
      </form>
    </article>
  );
}
