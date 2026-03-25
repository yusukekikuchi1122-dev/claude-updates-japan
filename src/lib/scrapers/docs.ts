import { createSupabaseClient } from "@/lib/supabase/client";
import { fetchPage } from "./shared";
import { summarizeEntry } from "@/lib/summarizer";
import { insertEntry } from "@/lib/supabase/queries";

const MONITORED_PAGES = [
  "https://docs.anthropic.com/en/docs/about-claude/models",
  "https://docs.anthropic.com/en/docs/build-with-claude/tool-use",
  "https://docs.anthropic.com/en/api/messages",
];

async function hashContent(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function stripBoilerplate(html: string): string {
  // Remove dynamic elements to reduce false positives
  return html
    .replace(/<nav[\s\S]*?<\/nav>/gi, "")
    .replace(/<header[\s\S]*?<\/header>/gi, "")
    .replace(/<footer[\s\S]*?<\/footer>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

export async function scrapeDocs(): Promise<{
  processed: number;
  new: number;
  errors: number;
}> {
  const supabase = createSupabaseClient();
  let processed = 0;
  let newCount = 0;
  let errors = 0;

  for (const pageUrl of MONITORED_PAGES) {
    try {
      const html = await fetchPage(pageUrl);
      const cleanHtml = stripBoilerplate(html);
      const contentHash = await hashContent(cleanHtml);

      // Check latest snapshot
      const { data: latest } = await supabase
        .from("doc_snapshots")
        .select("content_hash")
        .eq("page_url", pageUrl)
        .order("snapshot_at", { ascending: false })
        .limit(1)
        .single();

      processed++;

      if (latest?.content_hash === contentHash) {
        continue; // No change
      }

      // Store new snapshot
      await supabase.from("doc_snapshots").insert({
        page_url: pageUrl,
        content_hash: contentHash,
      });

      // Only create entry if there was a previous snapshot (skip initial)
      if (latest) {
        const summary = await summarizeEntry(
          `ドキュメントページが変更されました: ${pageUrl}\n\n変更後の内容（一部）:\n${cleanHtml.slice(0, 3000)}`,
          "APIドキュメント変更"
        );

        const result = await insertEntry({
          source_id: "docs",
          source_url: `${pageUrl}#changed-${Date.now()}`,
          title: `Docs changed: ${pageUrl.split("/").pop()}`,
          title_ja: summary.title_ja,
          summary_ja: summary.summary_ja,
          content_raw: cleanHtml.slice(0, 10000),
          author: null,
          published_at: new Date().toISOString(),
          categories: summary.categories,
        });

        if (result) newCount++;
      }
    } catch (err) {
      console.error(`Error checking docs page ${pageUrl}:`, err);
      errors++;
    }
  }

  return { processed, new: newCount, errors };
}
