import { NextRequest } from "next/server";
import { scrapeDocs } from "@/lib/scrapers/docs";
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
    const result = await scrapeDocs();
    return cronResponse(result);
  } catch (err) {
    console.error("Docs scraper failed:", err);
    return cronErrorResponse("Docs scraper failed");
  }
}
