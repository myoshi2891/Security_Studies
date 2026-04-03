import { NextResponse } from "next/server";
import { getSearchIndex, SearchResult } from "@/lib/search";

let cachedIndexPromise: Promise<SearchResult[]> | null = null;

/**
 * Serve the prebuilt search index as a JSON response with HTTP caching headers.
 *
 * Initializes and reuses a module-level cached promise for the search index so
 * subsequent requests return the same index without reinitializing. If cache
 * initialization fails, the cache is cleared and the request returns an error.
 *
 * @returns A JSON HTTP response containing the search index (array of search results)
 *          with `Cache-Control: public, s-maxage=3600, stale-while-revalidate=86400`.
 *          On failure, returns a JSON error body `{ error: "Internal Server Error" }`
 *          with HTTP status 500.
 */
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
