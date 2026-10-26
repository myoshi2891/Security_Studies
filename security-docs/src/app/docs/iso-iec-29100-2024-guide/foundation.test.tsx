import { expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import postcss from 'postcss';
import { sourceTest, sourceDocument, sourceCss, definitions, scope, canonical, renderedPage, evaluatedPage } from './fidelity-helpers';
import inventory from '../../../../../docs/migration-inventory/iso-iec-29100-2024-guide.json';

for (const selector of ['.hero', '.brand', '.sidebar nav', '.footer']) {
  test(`${selector}: fixed source structure SHA-256 survives even without archived originals`, async () => {
    const node = (await renderedPage()).querySelector(selector);
    expect(node).not.toBeNull();
    expect(createHash('sha256').update(JSON.stringify(canonical(node!))).digest('hex')).toBe(inventory.structures[selector as keyof typeof inventory.structures]);
  });
  sourceTest(`${selector}: every source text, attribute and emphasis survives`, async () => {
    expect(canonical((await renderedPage()).querySelector(selector)!)).toEqual(canonical(sourceDocument.querySelector(selector)!));
  });
}
sourceTest('every CSS declaration, pseudo element and media condition survives scoped migration', () => {
  const actual = postcss.parse(readFileSync(new URL('./iso-iec-29100-2024-guide.css', import.meta.url), 'utf8'));
  const ancestry = (r: postcss.Rule) => {
    const a: string[] = [];
    for (let p = r.parent; p && p.type === 'atrule'; p = p.parent) a.unshift((p as postcss.AtRule).name + ' ' + (p as postcss.AtRule).params);
    return a.join('/');
  };
  sourceCss.walkRules(rule => {
    const selector = rule.selector.split(',').map(s => {
      s = s.trim();
      if ([':root', 'html', 'body'].includes(s)) return scope;
      if(s.startsWith('body.nav-open')) return scope + '.nav-open' + s.slice(13);
      return scope + ' ' + s.replace(/(?<![-.])\bmain\b/g, '.guide-content');
    }).join(', ');
    const found: string[] = [];
    actual.walkRules(selector, r => {if (ancestry(r) === ancestry(rule)) r.walkDecls(d => {found.push(d.prop + ':' + d.value);});});
    rule.walkDecls(d => expect(found, selector).toContain(d.prop + ':' + d.value));
  });
});
test('page metadata matches the source title and migration description', async () => {
 expect((await evaluatedPage()).metadata).toEqual({title: inventory.title, description: inventory.description});
});
sourceTest('all twelve diagram definitions remain byte exact', async () => {
  expect(Object.entries((await import(new URL('./diagrams.ts', import.meta.url).href)).diagrams)).toEqual([...definitions]);
});
