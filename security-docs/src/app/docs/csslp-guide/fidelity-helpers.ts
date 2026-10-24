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

const sourcePath = resolve(import.meta.dir, '../../../../../archive/security-certifications/Csslp-guide.html');
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
  const outer=sourceDocument.querySelector('.hero > p');
  if(outer?.querySelector('p')){const inner=outer.querySelector('p')!;const trailing=[...outer.childNodes].slice([...outer.childNodes].indexOf(inner)+1);outer.after(inner,...trailing);sourceDocument.querySelector('.hero')!.append(sourceDocument.createElement('p'));}
  definitions = new Map(Object.entries(Function('window', sourceHtml.match(/<script>\s*(window\.DIAGRAMS[\s\S]*?)<\/script>/)![1] + 'return window.DIAGRAMS;')({}) as Record<string,string>));
  sourceCss = postcss.parse(sourceHtml.match(/<style>([\s\S]*?)<\/style>/)![1]);
}
/** 原本に依存するテスト。原本がない環境（CI）ではスキップし、原本非依存のテストは常に実行する */
export function sourceTest(name: string, fn: () => void | Promise<unknown>, timeout?: number) {
  test.skipIf(!hasSource)(name, () => { loadSource(); return fn(); }, timeout);
}
export const scope = '.csslp-guide.csslp-guide';

/** Compare every source node and attribute; only icons and runtime diagram markup have explicit adapters. */
export function canonical(node: Node): unknown {
 if(node.nodeType===Node.TEXT_NODE)return node.textContent?.replace(/\s+/g,' ').trim()||null;
 if(node.nodeType!==Node.ELEMENT_NODE)return null;
 const el=node as Element;
 if(el.tagName==='NOSCRIPT')return null;
 if(el.matches('.mmd[id]'))return ['diagram',el.id];
 if(el.tagName==='I')return ['icon',el.getAttribute('class')];
 const attrs=[...el.attributes].filter(a=>a.name!=='style').map(a=>[a.name,a.value]).sort((a,b)=>a[0].localeCompare(b[0]));
 const style=(el.getAttribute('style')||'').split(';').map(s=>s.trim().replace(/\s+/g,'')).filter(Boolean).sort();
 return [el.tagName,attrs,style,el.matches('code.language-python') ? [el.textContent?.replace(/\s+/g,' ').trim()] : [...el.childNodes].map(canonical).filter(v=>v!==null)];
}
let evaluated: ReturnType<typeof evaluate> | undefined;
export function evaluatedPage() {
  evaluated ??= evaluate(readFileSync(new URL('./page.mdx', import.meta.url), 'utf8').replace(/^import ['"](?:\.\/csslp-guide\.css|@fontsource-variable\/source-serif-4)['"];?\s*$/gm, ''), {
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
export function sectionContracts(ids:string[]) {
 for(const id of ids)sourceTest(id+': complete source structure, cells, list hierarchy, references, emphasis and diagram definitions',async()=>{
  const original=sourceDocument.getElementById(id),actual=(await renderedPage()).getElementById(id);expect(original).not.toBeNull();expect(actual).not.toBeNull();expect(canonical(actual!)).toEqual(canonical(original!));
  for(const selector of ['th','td','li','a','strong','h3','h4','p','code'])expect([...actual!.querySelectorAll(selector)].filter(e=>!e.closest('.mmd')).map(e=>e.textContent?.replace(/\s+/g,' ').trim()),selector).toEqual([...original!.querySelectorAll(selector)].map(e=>e.textContent?.replace(/\s+/g,' ').trim()));
  for(const figure of actual!.querySelectorAll('.mmd[data-diagram]'))expect(figure.getAttribute('data-definition')).toBe(definitions.get(figure.getAttribute('data-diagram')!)??null);
 });
}
