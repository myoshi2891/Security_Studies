import { describe, expect, test } from "bun:test";
import fs from "node:fs";
import path from "node:path";
import { docsConfig } from "@/config/docs";
import { getSearchIndex } from "@/lib/search";

const SLUG = "iso-iec-27001-2022-guide";
const HREF = `/docs/${SLUG}`;
const TITLE = "ISO/IEC 27001:2022 初学者向けガイド";
const ISO_27000_HREF = "/docs/iso-iec-27000-2026-guide";
const ISO_27000_TITLE = "ISO/IEC 27000:2026 入門ガイド";
const PAGE_PATH = path.join(process.cwd(), "src/app/docs", SLUG, "page.mdx");
const SOURCE_PATH = path.join(process.cwd(), "..", "archive", "standards", "Iso-27001-2022-beginner-guide.md");
const STATIC_INDEX_PATH = path.join(process.cwd(), "public/search-index.json");

const readPage = (): string => fs.readFileSync(PAGE_PATH, "utf8");
const navItems = () => docsConfig.sidebarNav.flatMap((group) => group.items);

describe("ISO/IEC 27001:2022 初学者向けガイドページ", () => {
  test("page.mdx が title / description の frontmatter を持つ", () => {
    // Arrange & Act
    const content = readPage();

    // Assert
    expect(content).toMatch(/^---\ntitle: ".*ISO\/IEC 27001:2022.*"\ndescription: ".+"\n---/);
  });

  test("原本ガイドの主要事実と全章を保持する", () => {
    // Arrange
    const content = readPage();
    const required = [
      "2026年10月14日",
      "第3版",
      "2022年10月25日",
      "Amd 1:2024",
      "ISO/IEC JTC 1/SC 27",
      "JIS Q 27001:2023",
      "JIS Q 27001:2025",
      "箇条4〜10",
      "93管理策",
      "組織的 37",
      "A.8.28",
      "適用宣言書(SoA)",
      "2025年10月31日",
      "Global ACI",
      "125,622",
      "NIST CSF 2.0",
      "よくある誤解 Q&A",
      "自己診断チェックリスト",
      "理解度チェック",
      "出典URL一覧",
      "情報の確かさについての注意",
    ];

    // Act
    const missing = required.filter((text) => !content.includes(text));

    // Assert
    expect(missing).toEqual([]);
  });

  test("原本の出典URLをすべて保持する", () => {
    // Arrange
    const source = fs.readFileSync(SOURCE_PATH, "utf8");
    const urls = source.match(/https:\/\/[^\s|]+/g) ?? [];
    const content = readPage();

    // Act
    const missing = urls.filter((url) => !content.includes(url));

    // Assert
    expect(urls.length).toBeGreaterThan(0);
    expect(missing).toEqual([]);
  });

  test("サイドバー設定に指定タイトルでちょうど1回登録されている", () => {
    // Arrange & Act
    const matches = navItems().filter((item) => item.href === HREF);

    // Assert
    expect(matches).toHaveLength(1);
    expect(matches[0]?.title).toBe(TITLE);
  });

  test("既存のISO/IEC 27000ガイドの登録を変更せず別ページとして扱う", () => {
    // Arrange & Act
    const iso27000 = navItems().filter((item) => item.href === ISO_27000_HREF);

    // Assert
    expect(iso27000).toHaveLength(1);
    expect(iso27000[0]?.title).toBe(ISO_27000_TITLE);
    expect(HREF).not.toBe(ISO_27000_HREF);
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
