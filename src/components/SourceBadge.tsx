const SOURCE_COLORS: Record<string, string> = {
  blog: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  github: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  twitter: "bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300",
  docs: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  changelog:
    "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
};

export function SourceBadge({
  name,
  type,
}: {
  readonly name: string;
  readonly type?: string;
}) {
  const colorClass = SOURCE_COLORS[type ?? ""] ?? SOURCE_COLORS.blog;
  return (
    <span className={`inline-block rounded px-2 py-0.5 text-xs ${colorClass}`}>
      {name}
    </span>
  );
}
