import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { copy } from "@/config/site";
import { routes } from "@/config/routes";
import { CategoryBadge, DeadlineBadge, StatusBadge } from "@/components/badges";
import { DeleteItemButton } from "@/components/delete-item-button";
import { ItemEditForm } from "@/components/item-edit-form";
import { getItem } from "@/lib/data/items";
import { getMyProfile } from "@/lib/data/profile";
import { getCurrentWorkspace, listMembers } from "@/lib/data/workspaces";
import { timeAgo, todayIn } from "@/lib/format";

export default async function ItemPage({ params }: PageProps<"/items/[id]">) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();

  const [{ supabase }, profile] = await Promise.all([getCurrentWorkspace(), getMyProfile()]);
  const item = await getItem(supabase, id);
  if (!item) notFound();

  const members = await listMembers(supabase, item.workspace_id);
  const addedBy = members.find((m) => m.userId === item.added_by)?.name;
  const today = todayIn(profile.timezone);

  return (
    <div className="stack">
      <Link href={item.status === "new" ? routes.inbox : routes.tracker} className="back-link">
        ← {copy.item.back}
      </Link>

      <div className="card item-hero">
        <div className="item-card-badges">
          <CategoryBadge category={item.category} />
          <StatusBadge status={item.status} />
          {item.deadline && <DeadlineBadge deadline={item.deadline} today={today} />}
        </div>
        <h1 className="page-title">{item.title || item.url}</h1>
        {item.description && <p className="muted">{item.description}</p>}
        <p className="item-meta">
          <span>{item.site_name}</span>
          <span aria-hidden="true">·</span>
          <span>
            {copy.item.addedBy} {addedBy ?? "someone"} {timeAgo(item.created_at)}
          </span>
        </p>
        <a href={item.url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
          {copy.item.open} ↗
        </a>
      </div>

      <ItemEditForm item={item} members={members.map(({ userId, name }) => ({ userId, name }))} />
      <DeleteItemButton id={item.id} />
    </div>
  );
}
