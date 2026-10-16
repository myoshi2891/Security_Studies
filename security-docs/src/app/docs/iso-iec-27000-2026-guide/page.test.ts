import { describe, expect, test } from "bun:test";
import fs from "node:fs";
import path from "node:path";
import { docsConfig } from "@/config/docs";
import { getSearchIndex } from "@/lib/search";

const SLUG = "iso-iec-27000-2026-guide";
const HREF = `/docs/${SLUG}`;
const PAGE_PATH = path.join(process.cwd(), "src/app/docs", SLUG, "page.mdx");
const STATIC_INDEX_PATH = path.join(process.cwd(), "public/search-index.json");

const readPage = (): string => fs.readFileSync(PAGE_PATH, "utf8");

describe("ISO/IEC 27000:2026 ガイドページ", () => {
  test("page.mdx が title / description の frontmatter を持つ", () => {
    // Arrange & Act
    const content = readPage();

    // Assert
    expect(content).toMatch(/^---\ntitle: ".*ISO\/IEC 27000:2026.*"\ndescription: ".+"\n---/);
  });

  test("原本ガイドの主要事実と全ステップを保持する", () => {
    // Arrange
    const content = readPage();
    const required = [
      "第6版",
      "2026年7月3日",
      "60.60",
      "ISO/IEC JTC 1/SC 27",
      "ISO/IEC 27000:2018",
      "ISO 31000",
      "EN ISO/IEC 27000:2026",
      "2025年10月31日",
      "Amd 1:2024",
      "ISO/IEC 27701:2025",
      "理解度チェック",
      "本ガイドの限界と注意点",
      "規格本文の逐条確認",
    ];

    // Act
    const missing = required.filter((text) => !content.includes(text));

    // Assert
    expect(missing).toEqual([]);
  });

  test("原本の参照URLをすべて保持する", () => {
    // Arrange
    const source = fs.readFileSync(path.join(process.cwd(), "..", "Iso-iec-27000-2026-guide.md"), "utf8");
    const urls = source.match(/https:\/\/[^\s|]+/g) ?? [];
    const content = readPage();

    // Act
    const missing = urls.filter((url) => !content.includes(url));

    // Assert
    expect(urls.length).toBeGreaterThan(0);
    expect(missing).toEqual([]);
  });

  test("サイドバー設定にちょうど1回登録されている", () => {
    // Arrange
    const hrefs = docsConfig.sidebarNav.flatMap((group) => group.items.map((item) => item.href));

    // Act
    const count = hrefs.filter((href) => href === HREF).length;

    // Assert
    expect(count).toBe(1);
  });

  test("検索インデックス（動的・静的）に含まれる", async () => {
    // Arrange
    const staticIndex: unknown = JSON.parse(fs.readFileSync(STATIC_INDEX_PATH, "utf8"));
    const staticHrefs = Array.isArray(staticIndex)
      ? staticIndex.flatMap((entry: unknown) =>
          typeof entry === "object" && entry !== null && "href" in entry ? [String(entry.href)] : [],
        )
      : [];

    // Act
    const dynamicIndex = await getSearchIndex();

    // Assert
    expect(dynamicIndex.some((entry) => entry.href === HREF)).toBe(true);
    expect(staticHrefs).toContain(HREF);
  });
});
