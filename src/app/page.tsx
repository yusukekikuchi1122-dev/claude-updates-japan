import { getEntries, getTodayEntries } from "@/lib/supabase/queries";
import { generateDailySummary } from "@/lib/summarizer";
import { TimelineList } from "@/components/timeline/TimelineList";
import { DailySummary } from "@/components/DailySummary";
import { Pagination } from "@/components/Pagination";
import { PER_PAGE } from "@/lib/constants";

export const revalidate = 600;

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);

  const [{ entries, total }, todayEntries] = await Promise.all([
    getEntries({ page, perPage: PER_PAGE }),
    page === 1 ? getTodayEntries() : Promise.resolve([]),
  ]);

  const totalPages = Math.ceil(total / PER_PAGE);

  let dailySummary: { summary: string; sourceLinks: readonly { readonly title: string; readonly url: string }[] } = { summary: "", sourceLinks: [] };
  if (page === 1 && todayEntries.length > 0) {
    try {
      dailySummary = await generateDailySummary(todayEntries);
    } catch (err) {
      console.error("Daily summary generation failed:", err);
    }
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">最新のアップデート</h1>
      {page === 1 && (
        <DailySummary summary={dailySummary} entryCount={todayEntries.length} />
      )}
      <TimelineList entries={entries} />
      <Pagination currentPage={page} totalPages={totalPages} basePath="/" />
    </div>
  );
}
