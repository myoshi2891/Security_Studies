import postcss from 'postcss';
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
import inventory from '../../../../../docs/migration-inventory/issmp-guide.json';
export { inventory };
export const scope = '.issmp-guide.issmp-guide';
export const sourcePath = resolve(import.meta.dir, '../../../../../Issmp-guide.html');
export let sourceDocument: Document;
export let sourceCss: import('postcss').Root;
/** 文字列のSHA-256ハッシュを16進文字列で返す。 */
export const hash = (s: string) => createHash('sha256').update(s).digest('hex');
/** 原本 HTML がある環境でのみ実行し、原本は最初の実行時まで読み込まないテストを登録する */
export function sourceTest(name: string, fn: () => void | Promise<unknown>, timeout?: number) {
  test.skipIf(!existsSync(sourcePath))(name, () => {
    sourceDocument ??= new DOMParser().parseFromString(readFileSync(sourcePath, 'utf8').replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '').replace(/<link\b[^>]*>/g, ''), 'text/html');
    sourceCss ??= postcss.parse(sourceDocument.querySelector('style')!.textContent!);
    return fn();
  }, timeout);
}
/** 空白・図の描画結果・支援技術用属性の差を除いた、比較用の DOM 表現を返す */
export function canonical(n: Node): unknown {
  if (n.nodeType === 3) return n.textContent?.replace(/\s+/g, ' ').trim() || null;
  if (n.nodeType !== 1) return null;
  const e = n as Element;
  if (e.matches('[data-diagram]')) return ['diagram', e.getAttribute('class')?.split(/\s+/).filter(c => c !== 'mermaid-target').join(' '), e.getAttribute('data-diagram')];
  if (e.matches('i.ti')) return ['icon', e.getAttribute('class')];
  return [e.tagName, [...e.attributes].map(a => [a.name === 'viewbox' ? 'viewBox' : a.name, a.value]).sort((a,b) => a[0].localeCompare(b[0])), [...e.childNodes].map(canonical).filter(v => v !== null)];
}
/** 正規化した DOM 構造の SHA-256 を返す */
export function structure(e: Node) { return hash(JSON.stringify(canonical(e))); }
let evaluated: ReturnType<typeof evaluate> | undefined;
/** page.mdx をスタイル読み込みなしで評価し、結果を共有する */
export function evaluatedPage() {
  evaluated ??= evaluate(readFileSync(new URL('./page.mdx', import.meta.url), 'utf8').replace(/^import '\.\/guide\.css';\s*$/gm, ''), {
    ...runtime, development: false, baseUrl: new URL('./page.mdx', import.meta.url), remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter, remarkGfm],
  });
  return evaluated;
}
/** 評価済みのページを静的 HTML として描画し、DOM へ解析して返す */
export async function renderedPage() {
  const { default: Page } = await evaluatedPage();
  return new DOMParser().parseFromString(renderToStaticMarkup(runtime.jsx(Page, {})), 'text/html');
}
/** 台帳の章構造ハッシュと原本 DOM の比較テストを、指定範囲の章について登録する */
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
