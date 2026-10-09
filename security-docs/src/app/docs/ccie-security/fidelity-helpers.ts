import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { evaluate } from '@mdx-js/mdx';
import * as runtime from 'react/jsx-runtime';
import { renderToStaticMarkup } from 'react-dom/server';
import remarkFrontmatter from 'remark-frontmatter';
import remarkMdxFrontmatter from 'remark-mdx-frontmatter';
import remarkGfm from 'remark-gfm';
import { expect, test } from 'bun:test';

export const sourceHtml = readFileSync(resolve(import.meta.dir, '../../../../../Ccie-security-guide.html'), 'utf8');
// Parse only inert source markup: never load the legacy CDN styles or scripts in tests.
export const sourceDocument = new DOMParser().parseFromString(sourceHtml.replace(/<head>[\s\S]*?<\/head>/, '').replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, ''), 'text/html');
export const definitions = new Map([...sourceHtml.slice(sourceHtml.indexOf('window.DIAGRAMS')).matchAll(/(\d+):\s*`([\s\S]*?)`/g)].map(m => [m[1], m[2]]));

export function canonical(node: Node): unknown {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent?.replace(/\s+/g, ' ').trim() || null;
  if (node.nodeType !== Node.ELEMENT_NODE) return null;
  const el = node as Element;
  if (['I', 'SVG', 'NOSCRIPT'].includes(el.tagName.toUpperCase())) return null;
  if (el.matches('figure.diagram')) return ['diagram', el.getAttribute('data-d')];
  // Python was highlighted by the legacy browser script. Compare its literal code;
  // migrated highlighting is independently asserted by the chapter 5–7 contract.
  if (el.matches('code.language-python')) return ['python', el.textContent];
  return [el.tagName, el.getAttribute('id'), el.getAttribute('class'), el.getAttribute('href'),
    el.getAttribute('type'), [...el.childNodes].map(canonical).filter(v => v !== null)];
}

let markup: Promise<string> | undefined;
let evaluated: ReturnType<typeof evaluate> | undefined;
export async function evaluatedPage() {
  if (evaluated) return evaluated;
  const page = readFileSync(resolve(import.meta.dir, 'page.mdx'), 'utf8');
  // Styling is separately tested against the real CSS AST. Only asset imports are omitted
  // from this in-memory MDX evaluation; content and component imports remain untouched.
  const mdx = page.replace(/^import ['"](?:\.\/ccie-security\.css|@fontsource-variable\/source-serif-4)['"];?\s*$/gm, '');
  evaluated = evaluate(mdx, {
    ...runtime, development: false, baseUrl: new URL('./page.mdx', import.meta.url),
    remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter, remarkGfm],
  });
  return evaluated;
}

export async function renderedPage() {
  markup ??= evaluatedPage().then(({ default: Page }) => renderToStaticMarkup(runtime.jsx(Page, {})));
  return new DOMParser().parseFromString(await markup, 'text/html');
}

export function chapterContracts(first: number, last: number) {
  for (let chapter = first; chapter <= last; chapter++) {
    test(`chapter ${chapter}: complete semantic tree, text, hierarchy, links and styling hooks`, async () => {
      const original = sourceDocument.getElementById(`s${chapter}`)!;
      const migrated = (await renderedPage()).getElementById(`s${chapter}`);
      expect(migrated).not.toBeNull();
      expect(canonical(migrated!)).toEqual(canonical(original));
      for (const selector of ['p', 'li', 'th', 'td', 'h2', 'h3', 'h4', '.ref-title', '.ref-status']) {
        const text = (el: Element) => el.textContent?.replace(/\s+/g, ' ').trim();
        const content = (section: Element) => [...section.querySelectorAll(selector)].filter(el => !el.closest('figure.diagram')).map(text);
        expect(content(migrated!), selector).toEqual(content(original));
      }
      expect([...migrated!.querySelectorAll('pre')].map(el => el.textContent)).toEqual([...original.querySelectorAll('pre')].map(el => el.textContent));
      for (const figure of migrated!.querySelectorAll('figure.diagram')) {
        const id = figure.getAttribute('data-d')!;
        expect(definitions.has(id)).toBe(true);
        expect(figure.getAttribute('data-definition')).toBe(definitions.get(id) ?? null);
      }
    });
  }
}

export function assertSourceHash() {
  const inventory = JSON.parse(readFileSync(resolve(import.meta.dir, '../../../../../docs/migration-inventory/ccie-security.json'), 'utf8'));
  expect(createHash('sha256').update(sourceHtml).digest('hex')).toBe(inventory.sha256);
}
