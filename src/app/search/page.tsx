import type { Metadata } from "next";
import { searchEntries } from "@/lib/supabase/queries";
import { TimelineList } from "@/components/timeline/TimelineList";
import { Pagination } from "@/components/Pagination";
import { SearchBar } from "@/components/SearchBar";
import { PER_PAGE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "検索",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const page = Math.max(1, Number(params.page) || 1);

  const result =
    query.length > 0
      ? await searchEntries(query, page, PER_PAGE)
      : { entries: [], total: 0 };

  const totalPages = Math.ceil(result.total / PER_PAGE);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">検索</h1>
      <div className="mb-6">
        <SearchBar defaultValue={query} />
      </div>
      {query.length > 0 && (
        <p className="mb-4 text-sm text-[var(--muted)]">
          「{query}」の検索結果: {result.total}件
        </p>
      )}
      <TimelineList entries={result.entries} />
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        basePath="/search"
        queryParams={query ? { q: query } : {}}
      />
    </div>
  );
}
