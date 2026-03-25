import { SITE_NAME } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] mt-12">
      <div className="mx-auto max-w-4xl px-4 py-6 text-center text-sm text-[var(--muted)]">
        <p>{SITE_NAME}</p>
        <p className="mt-1">
          Anthropic / Claude の最新情報を自動収集・日本語要約
        </p>
      </div>
    </footer>
  );
}
