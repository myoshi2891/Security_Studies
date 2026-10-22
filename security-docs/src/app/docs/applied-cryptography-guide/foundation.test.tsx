import { expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import postcss from 'postcss';
import { canonical, renderedPage, scope, sourceCss, sourceDocument, sourceTest } from './fidelity-helpers';

sourceTest('hero and footer preserve complete source content and structure', async () => {
 const page = await renderedPage();
 for (const selector of ['.hero', '.footer']) expect(canonical(page.querySelector(selector)!)).toEqual(canonical(sourceDocument.querySelector(selector)!));
});
sourceTest('every original CSS declaration and media condition is preserved under the page scope', () => {
 const css = postcss.parse(readFileSync(new URL('./applied-cryptography-guide.css',import.meta.url),'utf8'));
 sourceCss.walkRules(rule => {
  // body.drawer-open はページスコープ配下で一致し得ないため移行しない（開閉は .sidebar.open / .backdrop.show、overflow は GuideSidebar が制御）
  // 除外はカンマ区切りの個々のセレクターに限定し、同じ規則の他セレクターは検証を続ける
  // 括弧内のカンマ（:is(a, b) 等）で分割しないよう postcss.list.comma で解析する
  const selectors = postcss.list.comma(rule.selector).filter(s => !s.includes('body.drawer-open'));
  if (selectors.length === 0) return;
  const expected = JSON.stringify(selectors.map(s => ['html','body',':root'].includes(s) ? scope : `${scope} ${s}`));
  const media = rule.parent?.type === 'atrule' ? rule.parent.params : undefined;
  const original: string[] = [];rule.walkDecls(d=>{original.push(`${d.prop}:${d.value}`);});
  const matches: string[][] = [];css.walkRules(r=>{
   if (JSON.stringify(postcss.list.comma(r.selector))!==expected) return;
   if ((r.parent?.type==='atrule'?r.parent.params:undefined)!==media) return;
   const values: string[]=[];r.walkDecls(d=>{values.push(`${d.prop}:${d.value}`);});matches.push(values);
  });
  expect(matches.some(v=>JSON.stringify(v)===JSON.stringify(original)),rule.selector).toBe(true);
 });
 css.walkRules(rule => {expect(postcss.list.comma(rule.selector).every(s=>s.startsWith(scope)||s.startsWith('.docs-main:has(.applied-guide)')||s==='html:has(.applied-guide)')).toBe(true);});
});
test('page CSS emits no body.drawer-open selector, scoped or unscoped', () => {
 const css = postcss.parse(readFileSync(new URL('./applied-cryptography-guide.css',import.meta.url),'utf8'));
 // `${scope} body.drawer-open` のようなスコープ付きの変種も含めて出力しない
 css.walkRules(rule => {expect(rule.selector.split(',').some(s=>s.includes('body.drawer-open')),rule.selector).toBe(false);});
});
