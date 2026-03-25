export function SearchBar({
  defaultValue = "",
}: {
  readonly defaultValue?: string;
}) {
  return (
    <form action="/search" method="GET" className="w-full">
      <div className="flex gap-2">
        <input
          type="text"
          name="q"
          defaultValue={defaultValue}
          placeholder="キーワードで検索..."
          className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-sm focus:border-[var(--accent)] focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
        >
          検索
        </button>
      </div>
    </form>
  );
}
