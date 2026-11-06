import { expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import postcss from 'postcss';
import { inventory, renderedPage, structure, scope } from './fidelity-helpers';

test('MDX supplies Japanese metadata and a source-faithful hero, brand, nineteen-link TOC and footer', async () => {
  const page = await renderedPage();
  const raw = readFileSync(new URL('./page.mdx', import.meta.url), 'utf8');
  expect(raw).toContain('title: '+JSON.stringify(inventory.title));
  expect(raw).toContain('export const metadata');
  for (const selector of ['.brand', '.sidebar nav', '#top', '.footer']) expect(structure(page.querySelector(selector)!)).toBe(inventory.structures[selector as keyof typeof inventory.structures]);
  expect(page.querySelectorAll('.sidebar nav a')).toHaveLength(19);
  expect(page.querySelectorAll('script,iframe,form,link')).toHaveLength(0);
});
test('every source CSS declaration and media query is retained in its scoped selector', () => {
  const css = postcss.parse(readFileSync(new URL('./guide.css', import.meta.url), 'utf8'));
  const mapped = (s: string) => s.split(',').map(s => {
    s=s.trim(); if (s === ':root' || s === 'html' || s === 'body') return scope;
    if(s === 'body.lock') return scope+'.lock';
    return scope+' '+s.replace(/^main(?=\s|$)/,'.guide-content');
  }).join(', ');
  for (const original of inventory.cssRules) {
    const matches: postcss.Rule[]=[];
    css.walkRules(mapped(original.selector), r => { if ((r.parent?.type === 'atrule' ? (r.parent as postcss.AtRule).params : null) === original.media) matches.push(r); });
    expect(matches.some(r => JSON.stringify(r.nodes.filter(n => n.type === 'decl').map(n => { const d=n as postcss.Declaration; return [d.prop,d.value,d.important||false]; })) === JSON.stringify(original.declarations)), original.selector).toBe(true);
  }
  css.walkRules(r => { for (const s of r.selector.split(',')) expect(s.trim().startsWith(scope) || s.includes(':has(.iso24759-guide)'),s).toBe(true); });
});
test('all eight diagrams retain exact original definitions independently of the archive', async () => {
  const { diagrams } = await import(new URL('./diagrams.ts', import.meta.url).href);
  expect(diagrams).toEqual(inventory.diagrams);
  const mermaid = (await import('mermaid')).default;
  mermaid.initialize({ startOnLoad:false, securityLevel:'strict' });
  for(const source of Object.values(diagrams) as string[]) expect(await mermaid.parse(source)).toBeTruthy();
});
test('all Tabler icon classes have local SVG replacements', async () => {
  const { GuideIcon } = await import(new URL('./GuideIcon.tsx', import.meta.url).href);
  const {renderToStaticMarkup} = await import('react-dom/server');
  const {createElement} = await import('react');
  for(const name of ['ti-shield-lock','ti-alert-triangle','ti-bulb','ti-code','ti-info-circle','ti-external-link']) expect(renderToStaticMarkup(createElement(GuideIcon,{name,className:'ti '+name}))).toContain('<svg');
});
