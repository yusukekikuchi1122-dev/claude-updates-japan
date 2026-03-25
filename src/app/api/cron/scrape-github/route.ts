import { NextRequest } from "next/server";
import { scrapeGitHub } from "@/lib/scrapers/github";
import {
  verifyCronSecret,
  cronResponse,
  cronErrorResponse,
  unauthorizedResponse,
} from "@/lib/scrapers/shared";

export async function GET(request: NextRequest) {
  if (!verifyCronSecret(request)) {
    return unauthorizedResponse();
  }

  try {
    const result = await scrapeGitHub();
    return cronResponse(result);
  } catch (err) {
    console.error("GitHub scraper failed:", err);
    return cronErrorResponse("GitHub scraper failed");
  }
}
