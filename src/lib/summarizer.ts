import { GoogleGenerativeAI } from "@google/generative-ai";
import type { EntryWithCategories } from "@/lib/supabase/types";

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing environment variable: GEMINI_API_KEY");
  }
  return new GoogleGenerativeAI(apiKey);
}

interface SummaryResult {
  readonly title_ja: string;
  readonly summary_ja: string;
  readonly categories: readonly string[];
}

const VALID_CATEGORIES = new Set([
  "model-update",
  "api-change",
  "product-launch",
  "pricing",
  "research",
  "claude-code",
  "sdk",
  "safety",
  "other",
]);

export async function summarizeEntry(
  content: string,
  sourceName: string
): Promise<SummaryResult> {
  const truncated = content.slice(0, 4000);

  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const result = await model.generateContent(
    `以下は「${sourceName}」からのアップデート情報です。

---
${truncated}
---

以下のJSON形式で回答してください（JSON以外は出力しないでください）:
{
  "title_ja": "日本語のタイトル",
  "summary_ja": "2〜3文の日本語要約",
  "categories": ["カテゴリID"]
}

カテゴリIDは以下から1つ以上選択:
model-update, api-change, product-launch, pricing, research, claude-code, sdk, safety, other`
  );

  const text = result.response.text();

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return {
      title_ja: "",
      summary_ja: "",
      categories: ["other"],
    };
  }

  const parsed = JSON.parse(jsonMatch[0]) as {
    title_ja?: string;
    summary_ja?: string;
    categories?: string[];
  };

  return {
    title_ja: parsed.title_ja ?? "",
    summary_ja: parsed.summary_ja ?? "",
    categories: (parsed.categories ?? ["other"]).filter((c) =>
      VALID_CATEGORIES.has(c)
    ),
  };
}

export interface DailySummaryResult {
  readonly summary: string;
  readonly sourceLinks: readonly { readonly title: string; readonly url: string }[];
}

export async function generateDailySummary(
  entries: readonly EntryWithCategories[]
): Promise<DailySummaryResult> {
  if (entries.length === 0) {
    return { summary: "", sourceLinks: [] };
  }

  const entriesText = entries
    .map(
      (e) =>
        `- ${e.title_ja ?? e.title}（${e.source_name ?? "不明"}）: ${e.summary_ja ?? ""}\n  URL: ${e.source_url}`
    )
    .join("\n")
    .slice(0, 6000);

  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const result = await model.generateContent(
    `以下は今日のClaude/Anthropicに関するアップデート一覧です。

${entriesText}

これらを俯瞰して、今日の全体像がわかる日本語の要約を3〜5文で書いてください。
また、各ソース記事へのリンクもまとめてください。

以下のJSON形式で回答してください（JSON以外は出力しないでください）:
{
  "summary": "今日の要約文...",
  "sourceLinks": [
    { "title": "記事タイトル", "url": "https://..." }
  ]
}`
  );

  const text = result.response.text();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return { summary: "", sourceLinks: [] };
  }

  const parsed = JSON.parse(jsonMatch[0]) as {
    summary?: string;
    sourceLinks?: { title?: string; url?: string }[];
  };

  return {
    summary: parsed.summary ?? "",
    sourceLinks: (parsed.sourceLinks ?? [])
      .filter((l): l is { title: string; url: string } => !!l.title && !!l.url),
  };
}
