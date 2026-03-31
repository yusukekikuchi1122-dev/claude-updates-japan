import * as cheerio from "cheerio";
import { fetchPage } from "./shared";
import { summarizeEntry } from "@/lib/summarizer";
import { insertEntry } from "@/lib/supabase/queries";

const BLOG_URLS = [
  { url: "https://www.anthropic.com/news", sourceId: "blog" },
  { url: "https://www.anthropic.com/research", sourceId: "research" },
];

interface BlogArticle {
  readonly title: string;
  readonly url: string;
  readonly date: string;
  readonly sourceId: string;
}

export async function scrapeBlog(): Promise<{
  processed: number;
  new: number;
  errors: number;
}> {
  let processed = 0;
  let newCount = 0;
  let errors = 0;

  for (const source of BLOG_URLS) {
    try {
      const html = await fetchPage(source.url);
      const allArticles = parseBlogPage(html, source.sourceId);
      const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
      const articles = allArticles.filter((a) => a.date >= cutoff);
      processed += articles.length;

      for (const article of articles) {
        try {
          let contentRaw = article.title;
          try {
            const articleHtml = await fetchPage(article.url);
            const $article = cheerio.load(articleHtml);
            $article("nav, header, footer, script, style").remove();
            contentRaw =
              $article("article").text().trim() ||
              $article("main").text().trim() ||
              article.title;
          } catch {
            // Use title as fallback content
          }

          const summary = await summarizeEntry(
            contentRaw,
            source.sourceId === "research"
              ? "Anthropicリサーチ"
              : "Anthropicブログ"
          );

          const result = await insertEntry({
            source_id: article.sourceId,
            source_url: article.url,
            title: article.title,
            title_ja: summary.title_ja,
            summary_ja: summary.summary_ja,
            content_raw: contentRaw.slice(0, 10000),
            author: null,
            published_at: article.date || new Date().toISOString(),
            categories: summary.categories,
          });

          if (result) newCount++;
        } catch (err) {
          console.error(`Error processing article ${article.url}:`, err);
          errors++;
        }
      }
    } catch (err) {
      console.error(`Error scraping ${source.url}:`, err);
      errors++;
    }
  }

  return { processed, new: newCount, errors };
}

function parseBlogPage(html: string, sourceId: string): readonly BlogArticle[] {
  const $ = cheerio.load(html);
  const articles: BlogArticle[] = [];

  // Anthropic blog uses <a> elements with card-like structures
  $("a[href*='/news/'], a[href*='/research/']").each((_, el) => {
    const $el = $(el);
    const href = $el.attr("href");
    if (!href) return;

    const fullUrl = href.startsWith("http")
      ? href
      : `https://www.anthropic.com${href}`;

    // Try to extract title from heading inside the link
    const title =
      $el.find("h2, h3, h4").first().text().trim() || $el.text().trim();

    if (!title || title.length > 300) return;

    // Try to find date
    const dateText = $el.find("time").attr("datetime") || "";

    articles.push({
      title,
      url: fullUrl,
      date: dateText || new Date().toISOString(),
      sourceId,
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
