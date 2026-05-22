import { NextResponse } from "next/server";
import { getSearchIndex, SearchResult } from "@/lib/search";

let cachedIndexPromise: Promise<SearchResult[]> | null = null;

/**
 * Resets the module-level cached search index promise so the index will be reinitialized on the next request.
 *
 * Primarily intended for use in tests to force fresh initialization.
 */
export function clearCache() {
  cachedIndexPromise = null;
}

/**
 * Serve the prebuilt search index as a JSON HTTP response with caching headers.
 *
 * @returns A JSON response containing the search index (array of search results)
 *          with header `Cache-Control: public, s-maxage=3600, stale-while-revalidate=86400`.
 *          On failure, a JSON body `{ error: "Internal Server Error" }` with status `500`.
 */
export async function GET() {
  try {
    if (!cachedIndexPromise) {
      cachedIndexPromise = getSearchIndex().catch((err: unknown) => {
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
