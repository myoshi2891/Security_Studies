import { expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import postcss from 'postcss';
import { docsConfig } from '../../../config/docs';
import { sourceTest, sourceDocument, sourceCss, definitions, scope, canonical, renderedPage, evaluatedPage } from './fidelity-helpers';
import inventory from '../../../../../docs/migration-inventory/ghost-in-the-wires-guide.json';

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
  const actual = postcss.parse(readFileSync(new URL('./ghost-in-the-wires-guide.css', import.meta.url), 'utf8'));
  const ancestry = (r: postcss.Rule) => {
    const a: string[] = [];
    for (let p = r.parent; p && p.type === 'atrule'; p = p.parent) a.unshift((p as postcss.AtRule).name + ' ' + (p as postcss.AtRule).params);
    return a.join('/');
  };
  sourceCss.walkRules(rule => {
    const selector = rule.selector.split(',').map(s => {
      s = s.trim();
      if ([':root', 'html', 'body'].includes(s)) return scope;
      if(s === 'body.lock') return scope + '.lock';
      return scope + ' ' + s.replace(/(?<![-.])\bmain\b/g, '.guide-content');
    }).join(', ');
    const found: string[] = [];
    actual.walkRules(selector, r => {if (ancestry(r) === ancestry(rule)) r.walkDecls(d => {found.push(d.prop + ':' + d.value);});});
    rule.walkDecls(d => expect(found, selector).toContain(d.prop + ':' + d.value));
  });
});
test('metadata and the shared Security Guides registry expose the new route exactly once', async () => {
  expect((await evaluatedPage()).metadata).toEqual({title: inventory.title, description: inventory.description});
  expect(docsConfig.sidebarNav.find(g => g.id === 'engineering')!.items.filter(i => i.href === inventory.route)).toEqual([{title: 'Ghost in the Wires', href: inventory.route}]);
});
sourceTest('all six diagram definitions remain byte exact', async () => {
  expect(Object.entries((await import(new URL('./diagrams.ts', import.meta.url).href)).diagrams)).toEqual([...definitions]);
});
