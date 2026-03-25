import Link from "next/link";
import type { EntryWithCategories } from "@/lib/supabase/types";
import { CategoryBadge } from "@/components/CategoryBadge";

export function TimelineEntry({
  entry,
}: {
  readonly entry: EntryWithCategories;
}) {
  return (
    <article className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 hover:border-[var(--accent)] transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-xs text-[var(--muted)] mb-1">
            {entry.source_name && <span>{entry.source_name}</span>}
            <time dateTime={entry.published_at}>
              {new Date(entry.published_at).toLocaleDateString("ja-JP")}
            </time>
          </div>
          <h3 className="font-medium leading-snug">
            <Link
              href={`/entry/${entry.id}`}
              className="hover:text-[var(--accent)]"
            >
              {entry.title_ja ?? entry.title}
            </Link>
          </h3>
          {entry.summary_ja && (
            <p className="mt-2 text-sm text-[var(--muted)] line-clamp-3">
              {entry.summary_ja}
            </p>
          )}
          {entry.categories.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {entry.categories.map((catId) => (
                <CategoryBadge key={catId} id={catId} />
              ))}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
