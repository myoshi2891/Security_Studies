import fs from "fs";
import path from "path";
import matter from "gray-matter";

const docsDirectory = path.join(process.cwd(), "src/app/docs");

export interface SearchResult {
  title: string;
  description: string;
  href: string;
  content: string;
}

export async function getSearchIndex(): Promise<SearchResult[]> {
  const results: SearchResult[] = [];

  try {
    try {
      await fs.promises.access(docsDirectory);
    } catch {
      console.warn(`Docs directory not found: ${docsDirectory}`);
      return [];
    }

    const items = await fs.promises.readdir(docsDirectory, { withFileTypes: true });

    for (const item of items) {
      if (!item.isDirectory()) continue;

      const category = item.name;
      const filePath = path.join(docsDirectory, category, "page.mdx");

      try {
        try {
          await fs.promises.access(filePath);
        } catch {
          continue;
        }

        const fileContents = await fs.promises.readFile(filePath, "utf8");
        const { data, content } = matter(fileContents);

        results.push({
          title: data.title || category,
          description: data.description || "",
          href: `/docs/${category}`,
          content: content.slice(0, 500), // 検索用に冒頭500文字を保持
        });
      } catch (error) {
        console.error(`Error reading search index for ${category}:`, error);
      }
    }
  } catch (error) {
    console.error("Error generating search index:", error);
  }

  return results;
}
