import { expect, test, describe, mock, afterEach } from "bun:test";
import { GET, clearCache } from "./route";
import type { SearchResult } from "@/lib/search";

// Mock the getSearchIndex function from "@/lib/search"
const mockGetSearchIndex = mock(async (): Promise<SearchResult[]> => []);

mock.module("@/lib/search", () => ({
  getSearchIndex: mockGetSearchIndex,
}));

describe("GET /api/search API Contract", () => {
  afterEach(() => {
    mockGetSearchIndex.mockClear();
    clearCache();
  });

  test("returns 200 with SearchResult[] and appropriate Cache-Control headers", async () => {
    // Arrange
    const mockData: SearchResult[] = [
      {
        title: "Introduction to PQC",
        description: "Post-Quantum Cryptography basics.",
        href: "/docs/post-quantum-cryptography",
        content: "Post-quantum cryptography refers to cryptographic algorithms...",
      },
      {
        title: "OWASP Top 10",
        description: "Overview of OWASP vulnerabilities.",
        href: "/docs/owasp-top-10",
        content: "The OWASP Top 10 is a standard awareness document...",
      },
    ];
    mockGetSearchIndex.mockImplementation(async () => mockData);

    // Act
    const response = await GET();

    // Assert
    expect(response.status).toBe(200);

    // 4. Cache-Control: s-maxage=3600 ヘッダーの検証
    const cacheControl = response.headers.get("Cache-Control");
    expect(cacheControl).not.toBeNull();
    expect(cacheControl).toContain("s-maxage=3600");

    // 1. レスポンスが SearchResult[] 型に準拠していることの検証
    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body).toHaveLength(2);

    for (const item of body) {
      // 構造の検証
      expect(item).toHaveProperty("title");
      expect(item).toHaveProperty("href");
      expect(item).toHaveProperty("description");
      expect(item).toHaveProperty("content");

      expect(typeof item.title).toBe("string");
      expect(typeof item.href).toBe("string");
      expect(typeof item.description).toBe("string");
      expect(typeof item.content).toBe("string");

      // 2. 各エントリの href が /docs/<slug> 形式であることの検証
      expect(item.href).toMatch(/^\/docs\/[a-zA-Z0-9_-]+$/);

      // 3. content フィールドが最大 500 文字であることの検証
      expect(item.content.length).toBeLessThanOrEqual(500);
    }
  });

  test("handles empty search index gracefully", async () => {
    // Arrange
    mockGetSearchIndex.mockImplementation(async () => []);

    // Act
    const response = await GET();

    // Assert
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body).toHaveLength(0);
  });

  test("returns 500 status code when getSearchIndex fails", async () => {
    // Arrange
    const originalConsoleError = console.error;
    console.error = () => {}; // Suppress console.error output during this test

    mockGetSearchIndex.mockImplementation(async () => {
      throw new Error("Simulated index read error");
    });

    // Act
    const response = await GET();

    // Assert
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body).toEqual({ error: "Internal Server Error" });

    // Restore
    console.error = originalConsoleError;
  });
});
