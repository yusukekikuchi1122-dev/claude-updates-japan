import * as cheerio from "cheerio";
import { fetchPage } from "./shared";
import { summarizeEntry } from "@/lib/summarizer";
import { insertEntry } from "@/lib/supabase/queries";

const BLOG_URL = "https://www.anthropic.com/news";

interface BlogArticle {
  readonly title: string;
  readonly url: string;
  readonly date: string;
}

export async function scrapeBlog(): Promise<{
  processed: number;
  new: number;
  errors: number;
}> {
  let processed = 0;
  let newCount = 0;
  let errors = 0;

  try {
    const html = await fetchPage(BLOG_URL);
    const allArticles = parseBlogPage(html);
    const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
    // Only include articles with a real date that is within 48h
    const articles = allArticles
      .filter((a) => a.date !== "" && a.date >= cutoff)
      .slice(0, 2);
    processed += articles.length;

    for (const article of articles) {
      try {
        const contentRaw = article.title;

        const summary = await summarizeEntry(contentRaw, "Anthropicブログ");

        const result = await insertEntry({
          source_id: "blog",
          source_url: article.url,
          title: article.title,
          title_ja: summary.title_ja,
          summary_ja: summary.summary_ja,
          content_raw: contentRaw.slice(0, 10000),
          author: null,
          published_at: article.date,
          categories: summary.categories,
        });

        if (result) newCount++;
      } catch (err) {
        console.error(`Error processing article ${article.url}:`, err);
        errors++;
      }
    }
  } catch (err) {
    console.error(`Error scraping ${BLOG_URL}:`, err);
    errors++;
  }

  return { processed, new: newCount, errors };
}

function parseBlogPage(html: string): readonly BlogArticle[] {
  const $ = cheerio.load(html);
  const articles: BlogArticle[] = [];

  // Only match /news/ article links, not /research/ team pages
  $("a[href*='/news/']").each((_, el) => {
    const $el = $(el);
    const href = $el.attr("href");
    if (!href) return;

    // Skip non-article links (e.g. /news itself, anchors)
    if (href === "/news" || href === "/news/") return;

    const fullUrl = href.startsWith("http")
      ? href
      : `https://www.anthropic.com${href}`;

    const title =
      $el.find("h2, h3, h4").first().text().trim() || $el.text().trim();

    if (!title || title.length > 300 || title.length < 5) return;

    // Extract date - return empty string if not found (do NOT fallback to now)
    const dateText = $el.find("time").attr("datetime") || "";

    articles.push({
      title,
      url: fullUrl,
      date: dateText,
    });
  });

  // Deduplicate by URL
  const seen = new Set<string>();
  return articles.filter((a) => {
    if (seen.has(a.url)) return false;
    seen.add(a.url);
    return true;
  });
}
