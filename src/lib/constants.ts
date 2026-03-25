export const SITE_NAME = "Claude Updates Japan";
export const SITE_DESCRIPTION =
  "Claude / Anthropic のアップデート情報を自動収集・日本語要約するサイト";
export const SITE_URL = "https://claude-updates-japan.vercel.app";

export const PER_PAGE = 20;

export const SOURCES = {
  blog: {
    id: "blog",
    name: "Anthropicブログ",
    type: "blog" as const,
    url: "https://www.anthropic.com/news",
  },
  research: {
    id: "research",
    name: "Anthropicリサーチ",
    type: "blog" as const,
    url: "https://www.anthropic.com/research",
  },
  changelog: {
    id: "changelog",
    name: "チェンジログ",
    type: "changelog" as const,
    url: "https://docs.anthropic.com/en/docs/about-claude/models",
  },
  "github-claude-code": {
    id: "github-claude-code",
    name: "Claude Code",
    type: "github" as const,
    url: "https://github.com/anthropics/claude-code",
  },
  "github-sdk-python": {
    id: "github-sdk-python",
    name: "Python SDK",
    type: "github" as const,
    url: "https://github.com/anthropics/anthropic-sdk-python",
  },
  "github-sdk-typescript": {
    id: "github-sdk-typescript",
    name: "TypeScript SDK",
    type: "github" as const,
    url: "https://github.com/anthropics/anthropic-sdk-typescript",
  },
  docs: {
    id: "docs",
    name: "APIドキュメント",
    type: "docs" as const,
    url: "https://docs.anthropic.com",
  },
} as const;
