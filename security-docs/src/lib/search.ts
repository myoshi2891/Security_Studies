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
 * Recursively scans the directory to find page.mdx files and extract search results.
 */
async function scanDirectory(dir: string, baseDir: string): Promise<SearchResult[]> {
  const results: SearchResult[] = [];
  const items = await fs.promises.readdir(dir, { withFileTypes: true });
  items.sort((a, b) => a.name.localeCompare(b.name));

  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      const subResults = await scanDirectory(fullPath, baseDir);
      results.push(...subResults);
    } else if (item.isFile() && item.name === "page.mdx") {
      try {
        const fileContents = await fs.promises.readFile(fullPath, "utf8");
        const { data, content } = matter(fileContents);

        // Normalize backslashes to forward slashes for URL path on Windows.
        const relativePath = path.relative(baseDir, dir).replace(/\\/g, "/");

        results.push({
          title: data.title || relativePath,
          description: data.description || "",
          href: `/docs/${relativePath}`,
          content: content.slice(0, 500), // Keep first 500 characters for search
        });
      } catch (error) {
        console.error(`Error reading search index for ${fullPath}:`, error);
      }
    }
  }

  return results;
}

/**
 * Builds a search index from documentation pages located under the project's docs directory.
 *
 * Scans directories recursively for a `page.mdx` file, parses its frontmatter and body,
 * and produces search results.
 *
 * @returns An array of `SearchResult` entries representing each successfully read documentation page.
 */
export async function getSearchIndex(): Promise<SearchResult[]> {
  try {
    try {
      await fs.promises.access(docsDirectory);
    } catch {
      console.warn(`Docs directory not found: ${docsDirectory}`);
      return [];
    }

    return await scanDirectory(docsDirectory, docsDirectory);
  } catch (error) {
    console.error("Error generating search index:", error);
    return [];
  }
}
