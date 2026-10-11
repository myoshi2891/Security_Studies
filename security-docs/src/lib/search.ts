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

/** JSX headings: a string literal (`<E.h3>{"..."}</E.h3>`) or plain text (`<h3 className="...">...</h3>`). */
const JSX_HEADING_PATTERN = /<(?:E\.)?(h[1-6])\b[^>]*>(?:\{("(?:[^"\\]|\\.)*")\}|([^<{]+))<\/(?:E\.)?\1>/g;
/** Docs components that render their `title` attribute as a heading. */
const COMPONENT_TITLE_PATTERN = /<(?:HeroSection|SectionCard|ThreatCard)\b[^>]*?\stitle="([^"]*)"/g;
/** `DocsSubheading` renders its plain-text children as a heading. */
const SUBHEADING_PATTERN = /<DocsSubheading\b[^>]*>([^<{]+)<\/DocsSubheading>/g;

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

const MARKDOWN_HEADING_PATTERN = /^ {0,3}#{1,6}[ \t]+(.*?)(?:[ \t]+#+)?[ \t]*$/;
/** Captures the fence run (3+ backticks or tildes) and the rest of the line. */
const CODE_FENCE_PATTERN = /^ {0,3}(`{3,}|~{3,})(.*)$/;

/**
 * Returns ATX Markdown headings (`## TrustSec`) with their offsets, ignoring fenced code,
 * plus the `[start, end)` offset ranges of fenced code blocks (an unclosed fence runs to the end).
 */
function scanMarkdown(content: string): { headings: { index: number; text: string }[]; fences: [number, number][] } {
  const headings: { index: number; text: string }[] = [];
  const fences: [number, number][] = [];
  let offset = 0;
  let open: { start: number; marker: string } | undefined;
  for (const line of content.split("\n")) {
    const fence = line.match(CODE_FENCE_PATTERN);
    if (open !== undefined) {
      // CommonMark: only a fence of the same character, at least as long and without an info string closes the block.
      const marker = fence?.[1];
      if (marker !== undefined && marker[0] === open.marker[0] && marker.length >= open.marker.length && fence?.[2]?.trim() === "") {
        fences.push([open.start, offset + line.length]);
        open = undefined;
      }
    } else if (fence?.[1] !== undefined) {
      open = { start: offset, marker: fence[1] };
    } else {
      const text = line.match(MARKDOWN_HEADING_PATTERN)?.[1];
      if (text !== undefined) headings.push({ index: offset, text });
    }
    offset += line.length + 1;
  }
  if (open !== undefined) fences.push([open.start, content.length]);
  return { headings, fences };
}

/** Collapses the line breaks and indentation of multi-line plain-text JSX children. */
const collapseWhitespace = (text: string) => text.replace(/\s+/g, " ");

/**
 * Collects JSX heading text (e.g. `<E.h3 id={...}>{"..."}</E.h3>`, `<h3>...</h3>`), headings rendered
 * by docs components (`<SectionCard title="...">`, `<DocsSubheading>...</DocsSubheading>`) and Markdown
 * headings in document order so chapter terms beyond the 500-character content snippet remain searchable.
 */
export function extractHeadings(content: string): string[] {
  const { headings: found, fences } = scanMarkdown(content);
  const jsxHeadings = [
    ...[...content.matchAll(JSX_HEADING_PATTERN)].map(match => ({
      index: match.index,
      text: match[2] !== undefined ? decodeStringLiteral(match[2]) : collapseWhitespace(match[3] ?? ""),
    })),
    ...[...content.matchAll(COMPONENT_TITLE_PATTERN)].map(match => ({ index: match.index, text: match[1] ?? "" })),
    ...[...content.matchAll(SUBHEADING_PATTERN)].map(match => ({ index: match.index, text: collapseWhitespace(match[1] ?? "") })),
  ];
  for (const heading of jsxHeadings) {
    // Fenced code examples may show JSX headings; they are not page headings.
    if (fences.some(([start, end]) => heading.index >= start && heading.index < end)) continue;
    found.push(heading);
  }
  return found
    .sort((a, b) => a.index - b.index)
    .map(({ text }) => text.trim())
    .filter(text => text !== "");
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
