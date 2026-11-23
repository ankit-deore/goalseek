import { categoryLabels, statusLabels, type Category, type Status } from "@/config/items";
import { deadlineLabel, deadlineTone } from "@/lib/format";

export function CategoryBadge({ category }: { category: Category }) {
  return <span className={`badge badge-${category}`}>{categoryLabels[category]}</span>;
}

export function StatusBadge({ status }: { status: Status }) {
  return <span className={`badge badge-status-${status}`}>{statusLabels[status]}</span>;
}

export function DeadlineBadge({ deadline, today }: { deadline: string; today: string }) {
  return <span className={`badge badge-deadline-${deadlineTone(deadline, today)}`}>{deadlineLabel(deadline, today)}</span>;
}
