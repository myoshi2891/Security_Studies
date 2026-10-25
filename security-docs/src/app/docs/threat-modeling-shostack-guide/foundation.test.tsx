import { expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import postcss from 'postcss';
import { docsConfig } from '../../../config/docs';
import { sourceTest, sourceDocument, sourceCss, definitions, scope, canonical, renderedPage, evaluatedPage } from './fidelity-helpers';

sourceTest('hero, brand, sidebar nav, sidebar-foot and footer retain exact source structure and content', async () => {
  const page = await renderedPage();
  for (const selector of ['.hero', '.brand', '.sidebar nav', '.sidebar-foot', '.footer']) {
    expect(canonical(page.querySelector(selector)!)).toEqual(canonical(sourceDocument.querySelector(selector)!));
  }
});

sourceTest('every original CSS declaration and media ancestry survives under page scope including list and badge styles', () => {
  const actual = postcss.parse(readFileSync(new URL('./threat-modeling-shostack-guide.css', import.meta.url), 'utf8'));
  const ancestry = (r: postcss.Rule) => {
    const a: string[] = [];
    for (let p = r.parent; p && p.type === 'atrule'; p = p.parent) {
      a.unshift((p as postcss.AtRule).name + ' ' + (p as postcss.AtRule).params);
    }
    return a.join('/');
  };
  sourceCss.walkRules(rule => {
    const selector = rule.selector.split(',').map(s => {
      s = s.trim();
      if ([':root', 'html', 'body'].includes(s)) return scope;
      return scope + ' ' + s.replace(/(?<![-.])\bmain\b/g, '.guide-content');
    }).join(', ');
    const found: string[] = [];
    actual.walkRules(selector, r => {
      if (ancestry(r) === ancestry(rule)) {
        r.walkDecls(d => { found.push(d.prop + ':' + d.value); });
      }
    });
    rule.walkDecls(d => expect(found, selector).toContain(d.prop + ':' + d.value));
  });
});

test('metadata and Security Guides navigation register Threat Modeling (Shostack) exactly once', async () => {
  const page = await evaluatedPage();
  expect(page.metadata).toMatchObject({
    title: '脅威モデリング（Threat Modeling）入門ガイド',
    description: 'Adam Shostack『Threat Modeling: Designing for Security』を軸にした、初学者向けステップバイステップの脅威モデリング解説。',
  });
  const items = docsConfig.sidebarNav.find(g => g.id === 'engineering')!.items;
  expect(items.filter(i => i.href === '/docs/threat-modeling-shostack-guide')).toEqual([
    { title: '脅威モデリング入門ガイド (Shostack)', href: '/docs/threat-modeling-shostack-guide' },
  ]);
});

sourceTest('all 9 Mermaid definitions remain verbatim', async () => {
  const { diagrams } = await import(new URL('./diagrams.ts', import.meta.url).href);
  expect(Object.entries(diagrams)).toEqual([...definitions]);
});
