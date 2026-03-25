import { NextRequest } from "next/server";
import { scrapeChangelog } from "@/lib/scrapers/changelog";
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
    const result = await scrapeChangelog();
    return cronResponse(result);
  } catch (err) {
    console.error("Changelog scraper failed:", err);
    return cronErrorResponse("Changelog scraper failed");
  }
}
