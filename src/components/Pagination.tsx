import Link from "next/link";

interface PaginationProps {
  readonly currentPage: number;
  readonly totalPages: number;
  readonly basePath: string;
  readonly queryParams?: Record<string, string>;
}

export function Pagination({
  currentPage,
  totalPages,
  basePath,
  queryParams = {},
}: PaginationProps) {
  if (totalPages <= 1) return null;

  function buildHref(page: number): string {
    const params = new URLSearchParams({ ...queryParams, page: String(page) });
    return `${basePath}?${params.toString()}`;
  }

  return (
    <nav className="mt-8 flex justify-center gap-2">
      {currentPage > 1 && (
        <Link
          href={buildHref(currentPage - 1)}
          className="rounded border border-[var(--border)] px-3 py-1 text-sm hover:bg-[var(--card)]"
        >
          前へ
        </Link>
      )}
      <span className="px-3 py-1 text-sm text-[var(--muted)]">
        {currentPage} / {totalPages}
      </span>
      {currentPage < totalPages && (
        <Link
          href={buildHref(currentPage + 1)}
          className="rounded border border-[var(--border)] px-3 py-1 text-sm hover:bg-[var(--card)]"
        >
          次へ
        </Link>
      )}
    </nav>
  );
}
