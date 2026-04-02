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

export function getSearchIndex(): SearchResult[] {
  const results: SearchResult[] = [];

  try {
    if (!fs.existsSync(docsDirectory)) {
      console.warn(`Docs directory not found: ${docsDirectory}`);
      return [];
    }

    const items = fs.readdirSync(docsDirectory, { withFileTypes: true });

    items.forEach((item) => {
      if (!item.isDirectory()) return;

      const category = item.name;
      const filePath = path.join(docsDirectory, category, "page.mdx");

      try {
        if (fs.existsSync(filePath)) {
          const fileContents = fs.readFileSync(filePath, "utf8");
          const { data, content } = matter(fileContents);

          results.push({
            title: data.title || category,
            description: data.description || "",
            href: `/docs/${category}`,
            content: content.slice(0, 500), // 検索用に冒頭500文字を保持
          });
        }
      } catch (error) {
        console.error(`Error reading search index for ${category}:`, error);
      }
    });
  } catch (error) {
    console.error("Error generating search index:", error);
  }

  return results;
}
