import fs from "fs";
import path from "path";
import matter from "gray-matter";

const docsDirectory = path.join(process.cwd(), "src/app/docs");
const contentDirectory = path.join(process.cwd(), "content/docs");

export interface SearchResult {
  title: string;
  description: string;
  href: string;
  content: string;
}

export function getSearchIndex(): SearchResult[] {
  const results: SearchResult[] = [];

  try {
    const directories = [docsDirectory, contentDirectory];

    for (const dir of directories) {
      if (!fs.existsSync(dir)) continue;

      const items = fs.readdirSync(dir, { withFileTypes: true });

      items.forEach((item) => {
        if (!item.isDirectory()) return;

        const category = item.name;
        const filePath = path.join(dir, category, "page.mdx");

        // Avoid duplicate routes if present in both
        if (results.some(r => r.href === `/docs/${category}`)) return;

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
    }
  } catch (error) {
    console.error("Error generating search index:", error);
  }

  return results;
}
