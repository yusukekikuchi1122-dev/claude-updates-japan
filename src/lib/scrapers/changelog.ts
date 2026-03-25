import * as cheerio from "cheerio";
import { fetchPage } from "./shared";
import { summarizeEntry } from "@/lib/summarizer";
import { insertEntry } from "@/lib/supabase/queries";

const CHANGELOG_URL = "https://docs.anthropic.com/en/docs/about-claude/models";

export async function scrapeChangelog(): Promise<{
  processed: number;
  new: number;
  errors: number;
}> {
  let processed = 0;
  let newCount = 0;
  let errors = 0;

  try {
    const html = await fetchPage(CHANGELOG_URL);
    const $ = cheerio.load(html);

    // Extract sections that look like changelog entries
    $("h2, h3").each((_, el) => {
      const $heading = $(el);
      const text = $heading.text().trim();

      // Look for date-like patterns in headings
      if (!text) return;

      let content = text;
      let nextEl = $heading.next();
      while (
        nextEl.length &&
        !nextEl.is("h2") &&
        !nextEl.is("h3")
      ) {
        content += "\n" + nextEl.text().trim();
        nextEl = nextEl.next();
      }

      if (content.length > 20) {
        processed++;
      }
    });

    // For the changelog, treat the whole page as one entry if we can't parse individual items
    if (processed === 0) {
      $("script, style, nav, header, footer").remove();
      const pageContent = $("main").text().trim() || $("body").text().trim();

      if (pageContent.length > 50) {
        try {
          const summary = await summarizeEntry(pageContent, "チェンジログ");
          const result = await insertEntry({
            source_id: "changelog",
            source_url: CHANGELOG_URL + "#" + Date.now(),
            title: "Anthropic Models Changelog",
            title_ja: summary.title_ja,
            summary_ja: summary.summary_ja,
            content_raw: pageContent.slice(0, 10000),
            author: null,
            published_at: new Date().toISOString(),
            categories: summary.categories,
          });

          processed = 1;
          if (result) newCount = 1;
        } catch (err) {
          console.error("Error processing changelog:", err);
          errors++;
        }
      }
    }
  } catch (err) {
    console.error("Error scraping changelog:", err);
    errors++;
  }

  return { processed, new: newCount, errors };
}
