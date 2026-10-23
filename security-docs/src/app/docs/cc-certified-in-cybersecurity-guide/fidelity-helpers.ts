import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { evaluate } from '@mdx-js/mdx';
import * as runtime from 'react/jsx-runtime';
import { renderToStaticMarkup } from 'react-dom/server';
import remarkFrontmatter from 'remark-frontmatter';
import remarkMdxFrontmatter from 'remark-mdx-frontmatter';
import remarkGfm from 'remark-gfm';
import postcss from 'postcss';
import { expect, test } from 'bun:test';

const sourcePath = resolve(import.meta.dir, '../../../../../archive/security-certifications/Cc-certified-in-cybersecurity-guide.html');
// アーカイブ原本を遅延読み込みする。原本のないCIでは原本依存テストだけをスキップする。
export const hasSource = existsSync(sourcePath);
export let sourceHtml = '';
export let sourceDocument: Document;
export let definitions: Map<string, string>;
export let sourceCss: postcss.Root;
function loadSource() {
  if (sourceHtml) return;
  sourceHtml = readFileSync(sourcePath, 'utf8');
  sourceDocument = new DOMParser().parseFromString(sourceHtml.replace(/<head>[\s\S]*?<\/head>/, '').replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, ''), 'text/html');
  const values = Function('window', sourceHtml.match(/<script>\s*(window\.DIAGRAMS[\s\S]*?)<\/script>/)![1] + 'return window.DIAGRAMS;')({}) as string[];
  definitions = new Map(values.map((value, i) => ['d'+i, value]));
  sourceCss = postcss.parse(sourceHtml.match(/<style>([\s\S]*?)<\/style>/)![1]);
}
/** 原本に依存するテスト。原本がない環境（CI）ではスキップし、原本非依存のテストは常に実行する */
export function sourceTest(name: string, fn: () => void | Promise<unknown>, timeout?: number) {
  test.skipIf(!hasSource)(name, () => { loadSource(); return fn(); }, timeout);
}
export const scope = '.cc-guide.cc-guide';

export function canonical(node: Node): unknown {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent?.replace(/\s+/g, ' ').trim() || null;
  if (node.nodeType !== Node.ELEMENT_NODE) return null;
  const el = node as Element;
  if (el.tagName === 'NOSCRIPT') return null;
  if (el.matches('.diagram[data-i]')) return ['diagram', el.getAttribute('data-i')];
  if (el.matches('.mermaid-target[data-id]')) return ['diagram', el.getAttribute('data-id')];
  if (el.matches('.mermaid[data-diagram]')) return ['diagram', el.getAttribute('data-diagram')];
  if (el.tagName === 'I') return ['icon', el.getAttribute('class')];
  if (el.matches('pre code')) return ['code', el.getAttribute('class')?.replace(/ hljs$/, ''), el.textContent];
  const inlineStyle = el.getAttribute('style')?.split(';').map(part => part.trim().replace(/\s+/g,'')).filter(Boolean).sort() ?? [];
  return [el.tagName, inlineStyle, ...['id', 'class', 'href', 'target', 'rel', 'type', 'start', 'value', 'data-target', 'data-parent', 'colspan', 'rowspan', 'for', 'checked', 'open'].map(attr => el.getAttribute(attr)), [...el.childNodes].map(canonical).filter(value => value !== null)];
}
let evaluated: ReturnType<typeof evaluate> | undefined;
export function evaluatedPage() {
  evaluated ??= evaluate(readFileSync(new URL('./page.mdx', import.meta.url), 'utf8').replace(/^import ['"](?:\.\/cc-guide\.css|@fontsource-variable\/source-serif-4)['"];?\s*$/gm, ''), {
    ...runtime, development: false, baseUrl: new URL('./page.mdx', import.meta.url), remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter, remarkGfm],
  });
  return evaluated;
}
export async function renderedPage() {
  const { default: Page } = await evaluatedPage();
  return new DOMParser().parseFromString(renderToStaticMarkup(runtime.jsx(Page, {})), 'text/html');
}
export function declarations(css: postcss.Root, selector: string) {
  const values: string[] = [];
  css.walkRules(selector, rule => { rule.walkDecls(d => { values.push(`${d.prop}:${d.value}`); }); });
  return values;
}
export function sectionContracts(ids: string[]) {
  for (const id of ids) sourceTest(`${id}: complete source structure, text, table cells, list hierarchy, links and emphasis`, async () => {
    const original = sourceDocument.getElementById(id)!;
    const migrated = (await renderedPage()).getElementById(id);
    expect(original).not.toBeNull(); expect(migrated).not.toBeNull();
    expect(canonical(migrated!)).toEqual(canonical(original));
    for (const selector of ['p', 'li', 'th', 'td', 'h1', 'h2', 'h3', 'h4', 'h5', '.ref-t', '.opt']) {
      const content = (el: Element) => [...el.querySelectorAll(selector)].filter(child => !child.closest('.mermaid[data-diagram]')).map(child => child.textContent?.replace(/\s+/g, ' ').trim());
      expect(content(migrated!), selector).toEqual(content(original));
    }
    expect([...migrated!.querySelectorAll('pre')].map(el => el.textContent)).toEqual([...original.querySelectorAll('pre')].map(el => el.textContent));
    for (const figure of migrated!.querySelectorAll('.mermaid[data-diagram]')) expect(figure.getAttribute('data-definition')).toBe(definitions.get(figure.getAttribute('data-diagram')!) ?? null);
  });
}
