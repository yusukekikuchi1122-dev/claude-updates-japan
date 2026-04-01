import { NextRequest } from "next/server";
import { scrapeGitHub } from "@/lib/scrapers/github";
import { scrapeBlog } from "@/lib/scrapers/blog";
import { scrapeChangelog } from "@/lib/scrapers/changelog";
import { scrapeDocs } from "@/lib/scrapers/docs";
import {
  verifyCronSecret,
  cronResponse,
  unauthorizedResponse,
} from "@/lib/scrapers/shared";

export async function GET(request: NextRequest) {
  if (!verifyCronSecret(request)) {
    return unauthorizedResponse();
  }

  const results: Record<string, unknown> = {};

  try {
    results.github = await scrapeGitHub();
  } catch (err) {
    console.error("GitHub scraper failed:", err);
    results.github = { error: "failed" };
  }

  try {
    results.blog = await scrapeBlog();
  } catch (err) {
    console.error("Blog scraper failed:", err);
    results.blog = { error: "failed" };
  }

  try {
    results.changelog = await scrapeChangelog();
  } catch (err) {
    console.error("Changelog scraper failed:", err);
    results.changelog = { error: "failed" };
  }

  try {
    results.docs = await scrapeDocs();
  } catch (err) {
    console.error("Docs scraper failed:", err);
    results.docs = { error: "failed" };
  }

  return cronResponse(results);
}
