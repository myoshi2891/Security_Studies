import { describe, expect, test, spyOn } from 'bun:test';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import postcss from 'postcss';
import { docsConfig } from '@/config/docs';
import { getSearchIndex } from '@/lib/search';
import { canonical, declarations, definitions, evaluatedPage, here, renderedPage, scope, sourceCss, sourceDocument, sourceHtml, sourceTest } from './fidelity-helpers';

describe('Secure by Design complete migration', () => {
  sourceTest('locks source hash and complete content inventory without counting diagram fallback text as article content', async () => {
    const inventory = JSON.parse(readFileSync(resolve(here, '../../../../../docs/migration-inventory/secure-by-design.json'), 'utf8'));
    expect(createHash('sha256').update(sourceHtml).digest('hex')).toBe(inventory.sha256);
    const original = sourceDocument.querySelector('main')!;
    const page = (await renderedPage()).querySelector('.main')!;
    for (const [selector, count] of Object.entries({ section: 17, h1: 1, h2: 17, h3: 59, table: 35, '.section ul': 11, '.section ol': 3, '.section li': 37, '.code-block pre': 8, strong: 136, '.callout': 19, '.ref-card': 32, 'figure.diagram': 15 })) {
      expect(original.querySelectorAll(selector).length, `source ${selector}`).toBe(count);
      expect(page.querySelectorAll(selector).length, `migrated ${selector}`).toBe(count);
    }
    expect([...page.querySelectorAll('.section')].map(el => el.id)).toEqual(inventory.sections.map((item: { id: string }) => item.id));
  });

  sourceTest('resolves every original TOC link to one unique destination, including the top anchor', async () => {
    const page = await renderedPage();
    const links = [...page.querySelectorAll('aside a')];
    expect(links.map(el => [el.textContent, el.getAttribute('href')])).toEqual([...sourceDocument.querySelectorAll('aside a')].map(el => [el.textContent, el.getAttribute('href')]));
    for (const link of links) expect(page.querySelectorAll(`[id="${link.getAttribute('href')!.slice(1)}"]`)).toHaveLength(1);
    const ids = [...page.querySelectorAll('[id]')].map(el => el.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(page.querySelector('main main')).toBeNull();
  });

  test('registers the guide exactly once under Security Guides and retains existing navigation', () => {
    const entry = { title: 'Secure by Design 入門ガイド', href: '/docs/secure-by-design' };
    expect(docsConfig.sidebarNav.find(section => section.title === 'Security Guides')?.items).toContainEqual(entry);
    expect(docsConfig.sidebarNav.flatMap(section => section.items).filter(item => item.href === entry.href)).toEqual([entry]);
    expect(docsConfig.sidebarNav.find(section => section.title === 'Security Guides')?.items).toContainEqual({ title: 'Secure SDLC Guide', href: '/docs/secdev-guide' });
  });

  sourceTest('exports original metadata and indexes all 77 article headings through live search', async () => {
    const metadata = (await evaluatedPage()).metadata as { title: string; description: string };
    expect(metadata.title).toBe(sourceDocument.querySelector('h1')!.textContent!);
    expect(metadata.description).toBe(sourceHtml.match(/<meta name="description" content="([^"]+)"/)![1]);
    const entries = (await getSearchIndex()).filter(item => item.href === '/docs/secure-by-design');
    expect(entries).toHaveLength(1);
    expect(entries[0].title).toBe(metadata.title);
    expect(entries[0].description).toBe(metadata.description);
    expect(entries[0].headings).toEqual([...sourceDocument.querySelectorAll('main h1, main h2, main h3')].map(el => el.textContent));
    expect(entries[0].content).not.toContain('import ');
  });

  test('publishes the same title, description and full heading inventory in the browser search asset', async () => {
    const cached = JSON.parse(readFileSync(resolve(here, '../../../../public/search-index.json'), 'utf8'));
    const entries = cached.filter((item: { href: string }) => item.href === '/docs/secure-by-design');
    const live = (await getSearchIndex()).find(item => item.href === '/docs/secure-by-design');
    expect(entries).toEqual([live]);
  });

  sourceTest('preserves all 32 reference numbers, descriptions, categories and safe external link attributes', async () => {
    const page = await renderedPage();
    const refs = [...page.querySelectorAll('.ref-card')];
    expect(refs.map(canonical)).toEqual([...sourceDocument.querySelectorAll('.ref-card')].map(canonical));
    expect(refs.map(el => Number(el.querySelector('.ref-badge')?.textContent))).toEqual(Array.from({ length: 32 }, (_, i) => i + 1));
    for (const link of page.querySelectorAll('a[target="_blank"]')) expect(link.getAttribute('rel')).toBe('noopener noreferrer');
  });

  sourceTest('all 15 original definitions pass the real local Mermaid parser with the per-diagram config', async () => {
    const { default: mermaid } = await import('mermaid');
    const { diagramConfig } = await import('./MermaidFigure');
    expect(definitions.size).toBe(15);
    for (const [id, source] of definitions) expect(await mermaid.parse(`---\nconfig: ${JSON.stringify(diagramConfig)}\n---\n${source}`), id).toBeTruthy();
  });

  test('the default renderer passes the dark config with each source without resetting the shared Mermaid engine', async () => {
    const { default: mermaid } = await import('mermaid');
    const { diagramConfig, renderDiagram } = await import('./MermaidFigure');
    const render = spyOn(mermaid, 'render').mockResolvedValue({ svg: '<svg></svg>', diagramType: 'flowchart-v2' });
    const initialize = spyOn(mermaid, 'initialize');
    try {
      expect(await renderDiagram('figure', 'flowchart TD\nA-->B')).toMatchObject({ svg: '<svg></svg>' });
      expect(render).toHaveBeenCalledWith('figure', `---\nconfig: ${JSON.stringify(diagramConfig)}\n---\nflowchart TD\nA-->B`);
      expect(initialize).not.toHaveBeenCalled();
    } finally { render.mockRestore(); initialize.mockRestore(); }
  });

  test('the default renderer still renders when waiting for fonts fails', async () => {
    const { default: mermaid } = await import('mermaid');
    const { renderDiagram } = await import('./MermaidFigure');
    const render = spyOn(mermaid, 'render').mockResolvedValue({ svg: '<svg></svg>', diagramType: 'flowchart-v2' });
    const warn = spyOn(console, 'warn').mockImplementation(() => {});
    const fonts = Object.getOwnPropertyDescriptor(document, 'fonts');
    Object.defineProperty(document, 'fonts', { configurable: true, value: { ready: Promise.reject(new Error('font load failed')) } });
    try {
      expect(await renderDiagram('figure', 'flowchart TD\nA-->B')).toMatchObject({ svg: '<svg></svg>' });
      expect(render).toHaveBeenCalledTimes(1);
      expect(warn).toHaveBeenCalled();
    } finally {
      if (fonts) Object.defineProperty(document, 'fonts', fonts); else delete (document as { fonts?: unknown }).fonts;
      render.mockRestore(); warn.mockRestore();
    }
  });

  test('has no legacy scripts, CDN dependencies, unsafe URLs or HTML handler attributes', async () => {
    const page = (await renderedPage()).querySelector('.secure-by-design-guide')!;
    expect(page.querySelector('script, style, iframe, form')).toBeNull();
    for (const el of page.querySelectorAll('*')) for (const attr of [...el.attributes]) {
      expect(attr.name.startsWith('on')).toBe(false);
      if (['href', 'src'].includes(attr.name)) expect(attr.value).not.toMatch(/^\s*(javascript:|data:text\/html)/i);
    }
    const mdx = readFileSync(resolve(here, 'page.mdx'), 'utf8');
    expect(mdx).not.toMatch(/cdn\.jsdelivr\.net|cdnjs\.cloudflare\.com|window\.DIAGRAMS/);
    expect(mdx).toContain("import './secure-by-design.css'");
  });

  sourceTest('comparison detects removed list items, changed table cells, missing emphasis, changed code and changed URLs', async () => {
    for (const selector of ['.section li', '.section td', '.section strong', '.code-block code', '.ref-url']) {
      const section = (await renderedPage()).querySelector(selector)!.closest('.section')!;
      const copy = section.cloneNode(true) as Element;
      const original = sourceDocument.getElementById(section.id)!;
      expect(canonical(copy)).toEqual(canonical(original));
      copy.querySelector(selector)?.remove();
      expect(canonical(copy)).not.toEqual(canonical(original));
    }
  });

  sourceTest('CSS contracts detect removed dots, numbering, resets, increments and sidebar marker suppression', () => {
    const original = postcss.parse(readFileSync(resolve(here, 'secure-by-design.css'), 'utf8'));
    for (const selector of ['.prose ul>li::before', '.prose ol', '.prose ol>li', '.prose ol>li::before', '.sidebar nav li::before']) {
      const expected = declarations(sourceCss, selector);
      expect(expected.length).toBeGreaterThan(0);
      expect(declarations(original, `${scope} ${selector}`)).toEqual(expected);
      const damaged = original.clone();
      damaged.walkRules(`${scope} ${selector}`, rule => { rule.remove(); });
      expect(declarations(damaged, `${scope} ${selector}`)).not.toEqual(expected);
    }
  });
});
