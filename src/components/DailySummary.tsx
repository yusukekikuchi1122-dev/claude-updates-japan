import type { DailySummaryResult } from "@/lib/summarizer";

interface DailySummaryProps {
  readonly summary: DailySummaryResult;
  readonly entryCount: number;
}

export function DailySummary({ summary, entryCount }: DailySummaryProps) {
  if (!summary.summary || entryCount === 0) return null;

  const today = new Date().toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <section className="mb-8 rounded-lg border-2 border-[var(--accent)] bg-[var(--card)] p-6">
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="text-lg font-bold">今日のまとめ</h2>
        <span className="text-sm text-[var(--muted)]">
          {today}（{entryCount}件）
        </span>
      </div>
      <p className="leading-relaxed mb-4">{summary.summary}</p>
      {summary.sourceLinks.length > 0 && (
        <div className="border-t border-[var(--border)] pt-3">
          <h3 className="text-xs font-medium text-[var(--muted)] mb-2">
            ソース記事
          </h3>
          <ul className="flex flex-wrap gap-x-4 gap-y-1">
            {summary.sourceLinks.map((link) => (
              <li key={link.url}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[var(--accent)] hover:opacity-80 transition-opacity"
                >
                  {link.title} ↗
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
