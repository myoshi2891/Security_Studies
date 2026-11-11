import { expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import postcss from 'postcss';
import { inventory, renderedPage, structure, scope } from './fidelity-helpers';

test('MDX supplies Japanese metadata and a source-faithful hero, brand, 50-link TOC', async () => {
  const page = await renderedPage();
  const raw = readFileSync(new URL('./page.mdx', import.meta.url), 'utf8');
  expect(raw).toContain('title: '+JSON.stringify(inventory.title));
  expect(raw).toContain('export const metadata');
  for (const selector of ['.brand', '.sidebar nav', '.hero']) expect(structure(page.querySelector(selector)!)).toBe(inventory.structures[selector as keyof typeof inventory.structures]);
  expect(page.querySelectorAll('.sidebar nav a')).toHaveLength(50);
  expect(page.querySelectorAll('script,iframe,form,link')).toHaveLength(0);
});
test('every source CSS declaration and media query is retained in its scoped selector', () => {
  const css = postcss.parse(readFileSync(new URL('./guide.css', import.meta.url), 'utf8'));
  const mapped = (s: string) => s.split(',').map(s => {
    s=s.trim(); if (s === ':root' || s === 'html' || s === 'body') return scope;
    return scope+' '+s.replace(/^main(?=\s|$)/,'.guide-content');
  }).join(', ');
  for (const original of inventory.cssRules) {
    const matches: postcss.Rule[]=[];
    css.walkRules(mapped(original.selector), r => { if ((r.parent?.type === 'atrule' ? (r.parent as postcss.AtRule).params : null) === original.media) matches.push(r); });
    expect(matches.some(r => JSON.stringify(r.nodes.filter(n => n.type === 'decl').map(n => { const d=n as postcss.Declaration; return [d.prop,d.value,d.important||false]; })) === JSON.stringify(original.declarations)), original.selector).toBe(true);
  }
  css.walkRules(r => { for (const s of r.selector.split(',')) expect(s.trim().startsWith(scope) || s.includes(':has(.issmp-guide)'),s).toBe(true); });
});
test('all thirty-four diagrams retain exact original definitions independently of the archive', async () => {
  const { diagrams } = await import(new URL('./diagrams.ts', import.meta.url).href);
  expect(diagrams).toEqual(inventory.diagrams);
  const mermaid = (await import('mermaid')).default;
  mermaid.initialize({ startOnLoad:false, securityLevel:'strict' });
  for(const source of Object.values(diagrams) as string[]) expect(await mermaid.parse(source)).toBeTruthy();
});

test('foundation icon classes resolve to bundled, decorative SVG without external icon fonts', async () => {
  const page = await renderedPage();
  const icons = [...page.querySelectorAll('i.ti')];
  expect(icons.length).toBeGreaterThanOrEqual(2);
  for (const icon of icons) {
    expect(icon).toHaveAttribute('aria-hidden','true');
    expect(icon.querySelector('svg')).not.toBeNull();
  }
});
