import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { evaluate } from '@mdx-js/mdx';
import * as runtime from 'react/jsx-runtime';
import { renderToStaticMarkup } from 'react-dom/server';
import remarkFrontmatter from 'remark-frontmatter';
import remarkMdxFrontmatter from 'remark-mdx-frontmatter';
import remarkGfm from 'remark-gfm';
import postcss, { type Root } from 'postcss';
import { expect, test } from 'bun:test';

export const here = import.meta.dir;
export const sourceHtml = readFileSync(resolve(here, '../../../../../Secure-by-design-guide.html'), 'utf8');
// Never execute legacy scripts or load CDN assets while inspecting the source.
export const sourceDocument = new DOMParser().parseFromString(sourceHtml.replace(/<head>[\s\S]*?<\/head>/, '').replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, ''), 'text/html');
export const definitions = new Map([...sourceHtml.matchAll(/"(d\d+)":\s*`([\s\S]*?)`/g)].map(m => [m[1], m[2]]));
export const sourceCss = postcss.parse(sourceHtml.match(/<style>([\s\S]*?)<\/style>/)![1]);
export const scope = '.secure-by-design-guide.secure-by-design-guide';

export function canonical(node: Node): unknown {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent?.replace(/\s+/g, ' ').trim() || null;
  if (node.nodeType !== Node.ELEMENT_NODE) return null;
  const el = node as Element;
  if (['I', 'SVG'].includes(el.tagName.toUpperCase())) return null;
  if (el.matches('figure.diagram')) return ['diagram', el.querySelector('[data-diagram]')?.getAttribute('data-diagram')];
  if (el.matches('code.language-java')) return ['java', el.textContent];
  return [el.tagName, ...['id', 'class', 'href', 'target', 'rel'].map(a => el.getAttribute(a)), [...el.childNodes].map(canonical).filter(v => v !== null)];
}

export function declarations(root: Root, selector: string): string[] {
  const values: string[] = [];
  root.walkRules(rule => { if (rule.selector === selector) rule.walkDecls(d => { values.push(`${d.prop}:${d.value}`); }); });
  return values;
}

let evaluated: ReturnType<typeof evaluate> | undefined;
export function evaluatedPage() {
  evaluated ??= evaluate(readFileSync(resolve(here, 'page.mdx'), 'utf8').replace(/^import ['"]\.\/secure-by-design\.css['"];?\s*$/gm, ''), {
    ...runtime, development: false, baseUrl: new URL('./page.mdx', import.meta.url),
    remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter, remarkGfm],
  });
  return evaluated;
}
let rendered: Promise<Document> | undefined;
export function renderedPage() {
  rendered ??= evaluatedPage().then(({ default: Page }) => new DOMParser().parseFromString(renderToStaticMarkup(runtime.jsx(Page, {})), 'text/html'));
  return rendered;
}

export function sectionContracts(first: number, last: number) {
  for (let i = first; i <= last; i++) {
    test(`section ${i}: complete structure, text, tables, lists, code, links and diagram placement`, async () => {
      const original = sourceDocument.getElementById(`sec-${i}`)!;
      const migrated = (await renderedPage()).getElementById(`sec-${i}`);
      expect(migrated).not.toBeNull();
      expect(canonical(migrated!)).toEqual(canonical(original));
      for (const selector of ['h2', 'h3', 'p', 'strong', 'ul', 'ol', 'li', 'th', 'td', '.ref-badge', '.ref-tag', '.ref-desc']) {
        const texts = (section: Element) => [...section.querySelectorAll(selector)].filter(el => !el.closest('figure.diagram')).map(el => el.textContent?.replace(/\s+/g, ' ').trim());
        expect(texts(migrated!), selector).toEqual(texts(original));
      }
      expect([...migrated!.querySelectorAll('pre code')].map(el => el.textContent)).toEqual([...original.querySelectorAll('pre code')].map(el => el.textContent));
      for (const diagram of migrated!.querySelectorAll('[data-diagram]')) expect(diagram.getAttribute('data-definition')).toBe(definitions.get(diagram.getAttribute('data-diagram')!)!);
    });
  }
}
