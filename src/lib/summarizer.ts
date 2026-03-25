import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

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

  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `以下は「${sourceName}」からのアップデート情報です。

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
model-update, api-change, product-launch, pricing, research, claude-code, sdk, safety, other`,
      },
    ],
  });

  const text =
    message.content[0].type === "text" ? message.content[0].text : "";

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
