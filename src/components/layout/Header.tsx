import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";
import { SITE_NAME } from "@/lib/constants";

export function Header() {
  return (
    <header className="border-b border-[var(--border)] bg-[var(--card)]">
      <div className="mx-auto max-w-4xl px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-xl font-bold hover:opacity-80">
            {SITE_NAME}
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/search"
              className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
            >
              検索
            </Link>
            <a
              href="/api/feed"
              className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
              title="RSS"
            >
              RSS
            </a>
          </div>
        </div>
        <nav className="mt-3 flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.id}`}
              className="rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
            >
              {cat.name}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
