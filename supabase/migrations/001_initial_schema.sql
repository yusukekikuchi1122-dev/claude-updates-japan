-- Sources: where updates come from
CREATE TABLE sources (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  type        TEXT NOT NULL,
  url         TEXT NOT NULL,
  enabled     BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Categories/tags
CREATE TABLE categories (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0
);

-- Main entries table
CREATE TABLE entries (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id   TEXT NOT NULL REFERENCES sources(id),
  source_url  TEXT NOT NULL UNIQUE,
  title       TEXT NOT NULL,
  title_ja    TEXT,
  summary_ja  TEXT,
  content_raw TEXT,
  author      TEXT,
  published_at TIMESTAMPTZ NOT NULL,
  scraped_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Many-to-many: entries <-> categories
CREATE TABLE entry_categories (
  entry_id    UUID NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (entry_id, category_id)
);

-- Docs snapshots for diffing
CREATE TABLE doc_snapshots (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_url    TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  snapshot_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_entries_published_at ON entries(published_at DESC);
CREATE INDEX idx_entries_source_id ON entries(source_id);
CREATE INDEX idx_entries_scraped_at ON entries(scraped_at DESC);
CREATE INDEX idx_doc_snapshots_page_url ON doc_snapshots(page_url, snapshot_at DESC);

-- Seed: sources
INSERT INTO sources (id, name, type, url) VALUES
  ('blog',                   'Anthropicブログ',           'blog',      'https://www.anthropic.com/news'),
  ('research',               'Anthropicリサーチ',         'blog',      'https://www.anthropic.com/research'),
  ('changelog',              'チェンジログ',              'changelog', 'https://docs.anthropic.com/en/docs/about-claude/models'),
  ('github-claude-code',     'Claude Code (GitHub)',       'github',    'https://github.com/anthropics/claude-code'),
  ('github-sdk-python',      'Python SDK (GitHub)',        'github',    'https://github.com/anthropics/anthropic-sdk-python'),
  ('github-sdk-typescript',  'TypeScript SDK (GitHub)',    'github',    'https://github.com/anthropics/anthropic-sdk-typescript'),
  ('docs',                   'APIドキュメント変更',        'docs',      'https://docs.anthropic.com');

-- Seed: categories
INSERT INTO categories (id, name, sort_order) VALUES
  ('model-update',    'モデルアップデート',   1),
  ('api-change',      'API変更',             2),
  ('product-launch',  'プロダクトリリース',   3),
  ('pricing',         '料金',                4),
  ('research',        'リサーチ',            5),
  ('claude-code',     'Claude Code',         6),
  ('sdk',             'SDK',                 7),
  ('safety',          '安全性',              8),
  ('other',           'その他',              9);
