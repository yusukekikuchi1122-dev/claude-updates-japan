import { NextRequest } from "next/server";

export async function fetchPage(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; ClaudeUpdatesBot/1.0; +https://claude-updates-japan.vercel.app)",
    },
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }

  return response.text();
}

export function verifyCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  const secret = process.env.CRON_SECRET;

  if (!secret) return false;
  return authHeader === `Bearer ${secret}`;
}

export function cronResponse(result: Record<string, unknown>) {
  return Response.json(result);
}

export function cronErrorResponse(message: string) {
  return Response.json({ error: message }, { status: 500 });
}

export function unauthorizedResponse() {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}
