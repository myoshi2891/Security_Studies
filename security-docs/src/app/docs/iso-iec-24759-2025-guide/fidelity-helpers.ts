import { existsSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { evaluate } from '@mdx-js/mdx';
import * as runtime from 'react/jsx-runtime';
import { renderToStaticMarkup } from 'react-dom/server';
import remarkFrontmatter from 'remark-frontmatter';
import remarkMdxFrontmatter from 'remark-mdx-frontmatter';
import remarkGfm from 'remark-gfm';
import { expect, test } from 'bun:test';
import inventory from '../../../../../docs/migration-inventory/iso-iec-24759-2025-guide.json';
export { inventory };
export const scope = '.iso24759-guide.iso24759-guide';
export const sourcePath = resolve(import.meta.dir, '../../../../../Iso-iec-24759-2025-guide.html');
export let sourceDocument: Document;
export const hash = (s: string) => createHash('sha256').update(s).digest('hex');
export function sourceTest(name: string, fn: () => void | Promise<unknown>, timeout?: number) {
  test.skipIf(!existsSync(sourcePath))(name, () => {
    sourceDocument ??= new DOMParser().parseFromString(readFileSync(sourcePath, 'utf8').replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, ''), 'text/html');
    return fn();
  }, timeout);
}
export function canonical(n: Node): unknown {
  if (n.nodeType === 3) return n.textContent?.replace(/\s+/g, ' ').trim() || null;
  if (n.nodeType !== 1) return null;
  const e = n as Element;
  if (e.tagName === 'I') return ['icon', e.getAttribute('class')];
  if (e.matches('.diagram-body')) return ['diagram', e.getAttribute('data-id')];
  return [e.tagName, [...e.attributes].filter(a => !a.name.startsWith('aria-') && a.name !== 'tabindex').map(a => [a.name, a.value]).sort((a,b) => a[0].localeCompare(b[0])), [...e.childNodes].map(canonical).filter(v => v !== null)];
}
export function structure(e: Node) { return hash(JSON.stringify(canonical(e))); }
let evaluated: ReturnType<typeof evaluate> | undefined;
export function evaluatedPage() {
  evaluated ??= evaluate(readFileSync(new URL('./page.mdx', import.meta.url), 'utf8').replace(/^import '\.\/guide\.css';\s*$/gm, ''), {
    ...runtime, development: false, baseUrl: new URL('./page.mdx', import.meta.url), remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter, remarkGfm],
  });
  return evaluated;
}
export async function renderedPage() {
  const { default: Page } = await evaluatedPage();
  return new DOMParser().parseFromString(renderToStaticMarkup(runtime.jsx(Page, {})), 'text/html');
}
export function contracts(start: number, end: number) {
  const entries = Object.entries(inventory.structures).filter(([s]) => s.startsWith('#') && s !== '#top').slice(start, end);
  for (const [selector, expected] of entries) {
    test(`${selector}: fixed full structure, text, attributes, cells, list nesting and emphasis`, async () => {
      const e = (await renderedPage()).getElementById(selector.slice(1));
      expect(e).not.toBeNull(); expect(structure(e!)).toBe(expected);
    });
    sourceTest(`${selector}: independent complete original DOM comparison`, async () => {
      expect(canonical((await renderedPage()).getElementById(selector.slice(1))!)).toEqual(canonical(sourceDocument.getElementById(selector.slice(1))!));
    });
  }
}
