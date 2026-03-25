import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getEntries } from "@/lib/supabase/queries";
import { TimelineList } from "@/components/timeline/TimelineList";
import { Pagination } from "@/components/Pagination";
import { CATEGORY_MAP, CATEGORIES } from "@/lib/categories";
import { PER_PAGE } from "@/lib/constants";

export const revalidate = 600;

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = CATEGORY_MAP.get(slug as never);
  if (!category) return {};
  return {
    title: category.name,
    description: `${category.name}に関するClaude/Anthropicのアップデート情報`,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { slug } = await params;
  const category = CATEGORY_MAP.get(slug as never);
  if (!category) notFound();

  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);

  const { entries, total } = await getEntries({
    page,
    perPage: PER_PAGE,
    categoryId: category.id,
  });
  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">{category.name}</h1>
      <TimelineList entries={entries} />
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        basePath={`/category/${slug}`}
      />
    </div>
  );
}
