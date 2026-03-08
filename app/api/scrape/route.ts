import { NextRequest, NextResponse } from "next/server";
import { scrapeSite, scraperToPromptContext } from "@/lib/scraper";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url) return NextResponse.json({ error: "URL required" }, { status: 400 });

    const scraped = await scrapeSite(url);
    const context = scraperToPromptContext(scraped);

    return NextResponse.json({ scraped, context });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Scrape failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
