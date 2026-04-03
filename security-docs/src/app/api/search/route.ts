import { NextResponse } from "next/server";
import { getSearchIndex, SearchResult } from "@/lib/search";

let cachedIndexPromise: Promise<SearchResult[]> | null = null;

export async function GET() {
  try {
    if (!cachedIndexPromise) {
      cachedIndexPromise = getSearchIndex().catch(err => {
        cachedIndexPromise = null;
        throw err;
      });
    }

    const cachedIndex = await cachedIndexPromise;

    return NextResponse.json(cachedIndex, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
