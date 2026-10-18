import { existsSync, readFileSync } from 'node:fs';
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
export const repo = resolve(here, '../../../../..');
export const inventory = JSON.parse(readFileSync(resolve(repo, 'docs/migration-inventory/mitre-atlas.json'), 'utf8'));
const sourcePath = resolve(repo, inventory.source);
// 原本(archive/)は意図的に未追跡でCIには存在しない。読み込みは原本依存テストの実行時まで遅延する
export const hasSource = existsSync(sourcePath);
export let sourceHtml = '';
export let sourceDocument: Document;
export let definitions: Map<string, string>;
export let sourceCss: postcss.Root;
function loadSource() {
  if (sourceHtml) return;
  sourceHtml = readFileSync(sourcePath, 'utf8');
  sourceDocument = new DOMParser().parseFromString(sourceHtml.replace(/<head>[\s\S]*?<\/head>/, '').replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, ''), 'text/html');
  definitions = new Map([...sourceHtml.matchAll(/(structure|lifecycle|jailbreak|ragchain):\s*`([\s\S]*?)`/g)].map(m => [m[1], m[2]]));
  sourceCss = postcss.parse(sourceHtml.match(/<style>([\s\S]*?)<\/style>/)![1]);
}
/** 原本に依存するテスト。原本がない環境（CI）ではスキップし、原本非依存のテストは常に実行する */
export function sourceTest(name: string, fn: () => void | Promise<unknown>, timeout?: number) {
  test.skipIf(!hasSource)(name, () => { loadSource(); return fn(); }, timeout);
}
export const scope = '.atlas-guide.atlas-guide';
export const text = (el: Element) => el.textContent?.replace(/\s+/g, ' ').trim();
// SVG replacements may add library classes, but every original icon styling hook must remain.
export const iconHooks = (section: Element) => [...section.querySelectorAll('.ti')].map(el => [...el.classList].filter(token => token === 'ti' || token.startsWith('ti-')).join(' '));

export function canonical(node: Node): unknown {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent?.replace(/\s+/g, ' ').trim() || null;
  if (node.nodeType !== Node.ELEMENT_NODE) return null;
  const el = node as HTMLElement;
  if (['I', 'SVG'].includes(el.tagName.toUpperCase())) return null;
  if (el.matches('.atlas-table-scroll')) return canonical(el.firstElementChild!);
  if (el.matches('.mermaid-diagram')) return ['diagram', el.getAttribute('data-diagram')];
  const style = Array.from({ length: el.style.length }, (_, index) => el.style.item(index)).map(prop => [prop, el.style.getPropertyValue(prop)]);
  const rel = el.getAttribute('rel') ?? (el.getAttribute('target') === '_blank' ? 'noopener noreferrer' : null);
  return [el.tagName, ...['id', 'class', 'href', 'target'].map(a => el.getAttribute(a)), rel, style, [...el.childNodes].map(canonical).filter(v => v !== null)];
}
export function declarations(root: Root, selector: string, media?: string): Map<string, string> {
  const result = new Map<string, string>();
  root.walkRules(rule => {
    const context = rule.parent?.type === 'atrule' ? (rule.parent as postcss.AtRule).params : undefined;
    if (rule.selector === selector && context === media) rule.walkDecls(d => { result.set(d.prop, d.value); });
  });
  return result;
}
let evaluated: ReturnType<typeof evaluate> | undefined;
export function evaluatedPage() {
  evaluated ??= evaluate(readFileSync(resolve(here, 'page.mdx'), 'utf8').replace(/^import ['"]\.\/mitre-atlas\.css['"];?\s*$/gm, ''), {
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
  for (let number = first; number <= last; number++) sourceTest(`section ${number}: complete structure, text, cells, lists, IDs, links, styles and diagram placement`, async () => {
    const original = sourceDocument.getElementById(`sec${number}`)!;
    const migrated = (await renderedPage()).getElementById(`sec${number}`);
    expect(migrated).not.toBeNull();
    expect(canonical(migrated!)).toEqual(canonical(original));
    for (const selector of ['h2', 'h3', 'h4', 'p', 'strong', 'li', 'th', 'td', 'code', '.tag', '.num', '.diagram-caption']) {
      const texts = (section: Element) => [...section.querySelectorAll(selector)].filter(el => !el.closest('.mermaid-diagram')).map(text);
      expect(texts(migrated!), selector).toEqual(texts(original));
    }
    expect(iconHooks(migrated!)).toEqual(iconHooks(original));
    for (const diagram of migrated!.querySelectorAll('[data-diagram]')) expect(diagram.getAttribute('data-definition')).toBe(definitions.get(diagram.getAttribute('data-diagram')!)!);
  });
}
