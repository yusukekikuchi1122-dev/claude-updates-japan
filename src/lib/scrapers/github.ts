import { summarizeEntry } from "@/lib/summarizer";
import { insertEntry } from "@/lib/supabase/queries";

const REPOS = [
  { owner: "anthropics", repo: "claude-code", sourceId: "github-claude-code" },
  {
    owner: "anthropics",
    repo: "anthropic-sdk-python",
    sourceId: "github-sdk-python",
  },
  {
    owner: "anthropics",
    repo: "anthropic-sdk-typescript",
    sourceId: "github-sdk-typescript",
  },
];

interface GitHubRelease {
  readonly tag_name: string;
  readonly name: string;
  readonly body: string;
  readonly html_url: string;
  readonly published_at: string;
  readonly author: {
    readonly login: string;
  };
}

export async function scrapeGitHub(): Promise<{
  processed: number;
  new: number;
  errors: number;
  errorMessages: string[];
}> {
  let processed = 0;
  let newCount = 0;
  let errors = 0;
  const errorMessages: string[] = [];

  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "ClaudeUpdatesBot/1.0",
  };

  const token = process.env.GITHUB_TOKEN;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  for (const { owner, repo, sourceId } of REPOS) {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/releases?per_page=10`,
        { headers, signal: AbortSignal.timeout(15000) }
      );

      if (!response.ok) {
        console.error(
          `GitHub API error for ${owner}/${repo}: ${response.status}`
        );
        errors++;
        continue;
      }

      const allReleases = (await response.json()) as readonly GitHubRelease[];
      const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
      const releases = allReleases.filter((r) => r.published_at >= cutoff);
      processed += releases.length;

      for (const release of releases) {
        try {
          const content = `${release.name || release.tag_name}\n\n${release.body || ""}`;
          const repoName =
            sourceId === "github-claude-code"
              ? "Claude Code"
              : sourceId === "github-sdk-python"
                ? "Python SDK"
                : "TypeScript SDK";

          const summary = await summarizeEntry(content, `${repoName} (GitHub)`);

          const result = await insertEntry({
            source_id: sourceId,
            source_url: release.html_url,
            title: release.name || release.tag_name,
            title_ja: summary.title_ja,
            summary_ja: summary.summary_ja,
            content_raw: content.slice(0, 10000),
            author: release.author?.login ?? null,
            published_at: release.published_at,
            categories: summary.categories,
          });

          if (result) newCount++;
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          console.error(`Error processing release ${release.html_url}:`, msg);
          errorMessages.push(msg);
          errors++;
        }
      }
    } catch (err) {
      console.error(`Error scraping ${owner}/${repo}:`, err);
      errors++;
    }
  }

  return { processed, new: newCount, errors, errorMessages: errorMessages.slice(0, 3) };
}
