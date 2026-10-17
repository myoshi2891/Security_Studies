import { expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import postcss from 'postcss';
import { canonical, renderedPage, scope, sourceCss, sourceDocument } from './fidelity-helpers';

test('hero and footer preserve complete source content and structure', async () => {
 const page = await renderedPage();
 for (const selector of ['.hero', '.footer']) expect(canonical(page.querySelector(selector)!)).toEqual(canonical(sourceDocument.querySelector(selector)!));
});
test('every original CSS declaration and media condition is preserved under the page scope', () => {
 const css = postcss.parse(readFileSync(new URL('./applied-cryptography-guide.css',import.meta.url),'utf8'));
 sourceCss.walkRules(rule => {
  const expected = rule.selector.split(',').map(s => ['html','body',':root'].includes(s.trim()) ? scope : `${scope} ${s.trim()}`).join(',');
  const media = rule.parent?.type === 'atrule' ? rule.parent.params : undefined;
  const original: string[] = [];rule.walkDecls(d=>{original.push(`${d.prop}:${d.value}`);});
  const matches: string[][] = [];css.walkRules(expected, r=>{
   if ((r.parent?.type==='atrule'?r.parent.params:undefined)!==media) return;
   const values: string[]=[];r.walkDecls(d=>{values.push(`${d.prop}:${d.value}`);});matches.push(values);
  });
  expect(matches.some(v=>JSON.stringify(v)===JSON.stringify(original)),rule.selector).toBe(true);
 });
 css.walkRules(rule => {expect(rule.selector.split(',').every(s=>s.trim().startsWith(scope)||s.trim().startsWith('.docs-main:has(.applied-guide)')||s.trim()==='html:has(.applied-guide)')).toBe(true);});
});
