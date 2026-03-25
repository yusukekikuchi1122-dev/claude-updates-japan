import type { EntryWithCategories } from "@/lib/supabase/types";
import { TimelineEntry } from "./TimelineEntry";

export function TimelineList({
  entries,
}: {
  readonly entries: readonly EntryWithCategories[];
}) {
  if (entries.length === 0) {
    return (
      <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-8 text-center text-[var(--muted)]">
        まだ更新情報はありません
      </div>
    );
  }

  // Group by date
  const groups = new Map<string, EntryWithCategories[]>();
  for (const entry of entries) {
    const dateKey = new Date(entry.published_at).toLocaleDateString("ja-JP");
    const group = groups.get(dateKey) ?? [];
    group.push(entry);
    groups.set(dateKey, group);
  }

  return (
    <div className="space-y-6">
      {Array.from(groups.entries()).map(([date, dateEntries]) => (
        <section key={date}>
          <h2 className="mb-3 text-sm font-medium text-[var(--muted)]">
            {date}
          </h2>
          <div className="space-y-3">
            {dateEntries.map((entry) => (
              <TimelineEntry key={entry.id} entry={entry} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
