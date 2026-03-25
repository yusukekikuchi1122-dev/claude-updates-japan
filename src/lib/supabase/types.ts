export interface Source {
  readonly id: string;
  readonly name: string;
  readonly type: "blog" | "github" | "twitter" | "docs" | "changelog";
  readonly url: string;
  readonly enabled: boolean;
  readonly created_at: string;
}

export interface Entry {
  readonly id: string;
  readonly source_id: string;
  readonly source_url: string;
  readonly title: string;
  readonly title_ja: string | null;
  readonly summary_ja: string | null;
  readonly content_raw: string | null;
  readonly author: string | null;
  readonly published_at: string;
  readonly scraped_at: string;
  readonly created_at: string;
}

export interface EntryCategory {
  readonly entry_id: string;
  readonly category_id: string;
}

export interface DocSnapshot {
  readonly id: string;
  readonly page_url: string;
  readonly content_hash: string;
  readonly snapshot_at: string;
}

export interface EntryWithCategories extends Entry {
  readonly categories: readonly string[];
  readonly source_name?: string;
}
