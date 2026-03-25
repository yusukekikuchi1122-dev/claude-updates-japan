import { getEntries } from "@/lib/supabase/queries";
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL } from "@/lib/constants";
import { getCategoryName } from "@/lib/categories";

export async function GET() {
  const { entries } = await getEntries({ page: 1, perPage: 50 });

  const items = entries
    .map((entry) => {
      const categories = entry.categories
        .map((c) => `<category>${escapeXml(getCategoryName(c))}</category>`)
        .join("\n        ");

      return `    <item>
      <title>${escapeXml(entry.title_ja ?? entry.title)}</title>
      <link>${escapeXml(entry.source_url)}</link>
      <guid isPermaLink="false">${escapeXml(entry.id)}</guid>
      <pubDate>${new Date(entry.published_at).toUTCString()}</pubDate>
      <description>${escapeXml(entry.summary_ja ?? "")}</description>
      ${categories}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_NAME)}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>ja</language>
    <atom:link href="${SITE_URL}/api/feed" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "s-maxage=600, stale-while-revalidate=300",
    },
  });
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
