export type CategoryId =
  | "model-update"
  | "api-change"
  | "product-launch"
  | "pricing"
  | "research"
  | "claude-code"
  | "sdk"
  | "safety"
  | "other";

export interface Category {
  readonly id: CategoryId;
  readonly name: string;
  readonly sortOrder: number;
}

export const CATEGORIES: readonly Category[] = [
  { id: "model-update", name: "モデルアップデート", sortOrder: 1 },
  { id: "api-change", name: "API変更", sortOrder: 2 },
  { id: "product-launch", name: "プロダクトリリース", sortOrder: 3 },
  { id: "pricing", name: "料金", sortOrder: 4 },
  { id: "research", name: "リサーチ", sortOrder: 5 },
  { id: "claude-code", name: "Claude Code", sortOrder: 6 },
  { id: "sdk", name: "SDK", sortOrder: 7 },
  { id: "safety", name: "安全性", sortOrder: 8 },
  { id: "other", name: "その他", sortOrder: 9 },
] as const;

export const CATEGORY_MAP = new Map(CATEGORIES.map((c) => [c.id, c]));

export function getCategoryName(id: string): string {
  return CATEGORY_MAP.get(id as CategoryId)?.name ?? id;
}
