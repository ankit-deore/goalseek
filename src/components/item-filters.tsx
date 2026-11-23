import Link from "next/link";
import { CATEGORIES, categoryLabels, type Category } from "@/config/items";
import { copy } from "@/config/site";

type Props = {
  basePath: string;
  category?: Category;
  mine: boolean;
};

function href(basePath: string, params: { category?: string; mine?: boolean }) {
  const search = new URLSearchParams();
  if (params.category) search.set("category", params.category);
  if (params.mine) search.set("mine", "1");
  const qs = search.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export function ItemFilters({ basePath, category, mine }: Props) {
  return (
    <div className="filters" aria-label="Filters">
      <div className="chip-row">
        <Link href={href(basePath, { mine })} className={`chip ${!category ? "chip-active" : ""}`}>
          {copy.filters.all}
        </Link>
        {CATEGORIES.map((c) => (
          <Link key={c} href={href(basePath, { category: c, mine })} className={`chip ${category === c ? "chip-active" : ""}`}>
            {categoryLabels[c]}
          </Link>
        ))}
      </div>
      <Link href={href(basePath, { category, mine: !mine })} className={`chip ${mine ? "chip-active" : ""}`}>
        {copy.filters.mine}
      </Link>
    </div>
  );
}

/** Read the filter values from a page's searchParams. */
export function readFilters(params: Record<string, string | string[] | undefined>) {
  const raw = typeof params.category === "string" ? params.category : undefined;
  const category = (CATEGORIES as readonly string[]).includes(raw ?? "") ? (raw as Category) : undefined;
  return { category, mine: params.mine === "1" };
}
