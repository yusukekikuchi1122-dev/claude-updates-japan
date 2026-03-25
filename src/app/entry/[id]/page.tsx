import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getEntryById } from "@/lib/supabase/queries";
import { CategoryBadge } from "@/components/CategoryBadge";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const entry = await getEntryById(id);
  if (!entry) return {};
  return {
    title: entry.title_ja ?? entry.title,
    description: entry.summary_ja ?? undefined,
  };
}

export default async function EntryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const entry = await getEntryById(id);
  if (!entry) notFound();

  return (
    <article className="space-y-4">
      <Link
        href="/"
        className="text-sm text-[var(--muted)] hover:text-[var(--accent)]"
      >
        &larr; 一覧に戻る
      </Link>

      <h1 className="text-2xl font-bold">{entry.title_ja ?? entry.title}</h1>

      <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--muted)]">
        {entry.source_name && <span>{entry.source_name}</span>}
        <time dateTime={entry.published_at}>
          {new Date(entry.published_at).toLocaleDateString("ja-JP")}
        </time>
        {entry.author && <span>by {entry.author}</span>}
      </div>

      {entry.categories.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {entry.categories.map((catId) => (
            <CategoryBadge key={catId} id={catId} />
          ))}
        </div>
      )}

      {entry.summary_ja && (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6">
          <h2 className="mb-2 text-sm font-medium text-[var(--muted)]">
            要約
          </h2>
          <p className="leading-relaxed">{entry.summary_ja}</p>
        </div>
      )}

      {entry.title !== entry.title_ja && (
        <p className="text-sm text-[var(--muted)]">
          原題: {entry.title}
        </p>
      )}

      <a
        href={entry.source_url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
      >
        元の記事を読む
      </a>
    </article>
  );
}
