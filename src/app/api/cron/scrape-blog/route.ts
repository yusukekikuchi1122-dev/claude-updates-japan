import { NextRequest } from "next/server";
import { scrapeBlog } from "@/lib/scrapers/blog";
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
    const result = await scrapeBlog();
    return cronResponse(result);
  } catch (err) {
    console.error("Blog scraper failed:", err);
    return cronErrorResponse("Blog scraper failed");
  }
}
