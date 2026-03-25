import Link from "next/link";
import { getCategoryName } from "@/lib/categories";

export function CategoryBadge({ id }: { readonly id: string }) {
  return (
    <Link
      href={`/category/${id}`}
      className="inline-block rounded-full bg-[var(--accent-light)] px-2 py-0.5 text-xs text-[var(--accent)] hover:opacity-80 transition-opacity"
    >
      {getCategoryName(id)}
    </Link>
  );
}
