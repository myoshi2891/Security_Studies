import fs from "fs";
import path from "path";
import matter from "gray-matter";

const docsDirectory = path.join(process.cwd(), "src/app/docs");

export interface SearchResult {
  title: string;
  description: string;
  href: string;
  content: string;
  headings: string[];
}

/**
 * Removes MDX ESM blocks (`import` / `export` paragraphs, which run until a blank line)
 * so the search snippet starts with the page body instead of module statements.
 */
function stripMdxEsm(content: string): string {
  return content.replace(/^(?:import|export)\s[^\n]*(?:\n(?![ \t]*\n)[^\n]*)*/gm, "").trimStart();
}

const JSX_HEADING_PATTERN = /<(?:E\.)?h[1-6]\b[^>]*>\{("(?:[^"\\]|\\.)*")\}<\/(?:E\.)?h[1-6]>/g;

/**
 * Decodes a double-quoted JS string literal; falls back to the raw inner text
 * when it uses escapes that JSON does not accept (e.g. `\'`).
 */
function decodeStringLiteral(literal: string): string {
  try {
    const parsed: unknown = JSON.parse(literal);
    return typeof parsed === "string" ? parsed : literal.slice(1, -1);
  } catch {
    return literal.slice(1, -1);
  }
}

/**
 * Collects JSX heading text (e.g. `<E.h3 id={...}>{"..."}</E.h3>`) so chapter terms
 * beyond the 500-character content snippet remain searchable.
 */
function extractHeadings(content: string): string[] {
  const headings: string[] = [];
  for (const match of content.matchAll(JSX_HEADING_PATTERN)) {
    const literal = match[1];
    if (literal === undefined) continue;
    const heading = decodeStringLiteral(literal).trim();
    if (heading !== "") headings.push(heading);
  }
  return headings;
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
          content: stripMdxEsm(content).slice(0, 500), // Keep first 500 characters for search
          headings: extractHeadings(content),
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
