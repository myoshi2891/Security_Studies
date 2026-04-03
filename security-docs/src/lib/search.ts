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

/**
 * Builds a search index from documentation pages located under the project's docs directory.
 *
 * Scans immediate subdirectories of the docs directory for a `page.mdx` file, parses its frontmatter
 * and body, and produces one `SearchResult` per category with `title` (frontmatter `title` or the
 * directory name), `description` (frontmatter `description` or empty string), `href` (`/docs/<category>`),
 * and `content` (the first 500 characters of the page body). If the docs directory is missing the
 * function returns an empty array. Individual category read/parse errors are logged and skipped.
 *
 * @returns An array of `SearchResult` entries representing each successfully read documentation page.
 */
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
