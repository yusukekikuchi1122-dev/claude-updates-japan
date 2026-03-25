import { getEntries } from "@/lib/supabase/queries";
import { TimelineList } from "@/components/timeline/TimelineList";
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

  const { entries, total } = await getEntries({ page, perPage: PER_PAGE });
  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">最新のアップデート</h1>
      <TimelineList entries={entries} />
      <Pagination currentPage={page} totalPages={totalPages} basePath="/" />
    </div>
  );
}
