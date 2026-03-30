import { GoogleGenerativeAI } from "@google/generative-ai";

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
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-04-17" });

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
