import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { evaluate } from '@mdx-js/mdx';
import * as runtime from 'react/jsx-runtime';
import { renderToStaticMarkup } from 'react-dom/server';
import remarkFrontmatter from 'remark-frontmatter';
import remarkMdxFrontmatter from 'remark-mdx-frontmatter';
import remarkGfm from 'remark-gfm';
import postcss from 'postcss';
import { expect, test } from 'bun:test';

export const sourceHtml = readFileSync(resolve(import.meta.dir, '../../../../../Hacking-kubernetes-guide.html'), 'utf8');
export const sourceDocument = new DOMParser().parseFromString(sourceHtml.replace(/<head>[\s\S]*?<\/head>/, '').replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, ''), 'text/html');
export const definitions = new Map([...sourceHtml.matchAll(/window\.DIAGRAMS\["(d\d+)"\]\s*=\s*`([\s\S]*?)`;/g)].map(m => [m[1], m[2]]));
export const sourceCss = postcss.parse(sourceHtml.match(/<style>([\s\S]*?)<\/style>/)![1]);
export const scope = '.kubernetes-guide.kubernetes-guide';

export function canonical(node: Node): unknown {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent?.replace(/\s+/g, ' ').trim() || null;
  if (node.nodeType !== Node.ELEMENT_NODE) return null;
  const el = node as Element;
  if (el.tagName === 'SVG' || el.tagName.toLowerCase() === 'svg' || el.tagName === 'NOSCRIPT') return null;
  if (el.matches('.mermaid')) return ['diagram', el.getAttribute('data-diagram')];
  if (el.matches('pre code')) return ['code', el.getAttribute('class'), el.textContent];
  return [el.tagName, ...['id', 'class', 'href', 'target', 'rel', 'type', 'start', 'value'].map(attr => el.getAttribute(attr)), [...el.childNodes].map(canonical).filter(value => value !== null)];
}
let evaluated: ReturnType<typeof evaluate> | undefined;
export function evaluatedPage() {
  evaluated ??= evaluate(readFileSync(new URL('./page.mdx', import.meta.url), 'utf8').replace(/^import ['"](?:\.\/ccst-cybersecurity\.css|@fontsource-variable\/source-serif-4)['"];?\s*$/gm, ''), {
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
  for (const id of ids) test(`${id}: complete source structure, text, table cells, list hierarchy, links and emphasis`, async () => {
    const original = sourceDocument.getElementById(id)!;
    const migrated = (await renderedPage()).getElementById(id);
    expect(original).not.toBeNull(); expect(migrated).not.toBeNull();
    expect(canonical(migrated!)).toEqual(canonical(original));
    for (const selector of ['p', 'li', 'th', 'td', 'h1', 'h2', 'h3', 'h4', 'h5', '.ref-t', '.opt']) {
      const content = (el: Element) => [...el.querySelectorAll(selector)].filter(child => !child.closest('.mermaid')).map(child => child.textContent?.replace(/\s+/g, ' ').trim());
      expect(content(migrated!), selector).toEqual(content(original));
    }
    expect([...migrated!.querySelectorAll('pre')].map(el => el.textContent)).toEqual([...original.querySelectorAll('pre')].map(el => el.textContent));
    for (const figure of migrated!.querySelectorAll('.mermaid')) expect(figure.getAttribute('data-definition')).toBe(definitions.get(figure.getAttribute('data-diagram')!) ?? null);
  });
}
