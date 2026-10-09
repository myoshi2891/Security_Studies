import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import postcss from 'postcss';
import { docsConfig } from '@/config/docs';
import { getSearchIndex } from '@/lib/search';
import { canonical, definitions, evaluatedPage, renderedPage, sourceDocument, sourceHtml } from './fidelity-helpers';

describe('CCIE complete migration', () => {
  test('matches the full body inventory, including all inline emphasis and CLI token spans', async () => {
    const page = (await renderedPage()).querySelector('.ccie-guide')!;
    const original = sourceDocument.querySelector('main')!;
    const counts = new Map([
      ['.section', 13], ['.section h2, .section h3, .section h4', 139], ['.hero h1', 1],
      ['table', 85], ['.diagram', 61], ['.code pre', 34], ['.section ul, .section ol', 49],
      ['.section li', 196], ['.check', 7], ['.ref', 59], ['strong', 683],
    ]);
    for (const [selector, count] of counts) {
      expect(original.querySelectorAll(selector).length, `source ${selector}`).toBe(count);
      expect(page.querySelectorAll(selector).length, selector).toBe(count);
    }
    expect([...page.querySelectorAll('.code code.cli span')].map(canonical)).toEqual([...original.querySelectorAll('.code code.cli span')].map(canonical));
  });

  test('retains the complete original in-page TOC and resolves every fragment to one unique ID', async () => {
    const page = await renderedPage();
    const links = [...page.querySelectorAll('.guide-toc a')];
    expect(links.map(el => [el.textContent, el.getAttribute('href')])).toEqual([...sourceDocument.querySelectorAll('aside nav a')].map(el => [el.textContent, el.getAttribute('href')]));
    for (const link of links) expect(page.getElementById(link.getAttribute('href')!.slice(1))).not.toBeNull();
    const ids = [...page.querySelectorAll('[id]')].map(el => el.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test('adds Security Certifications immediately before Resources with only CCIE', () => {
    const category = docsConfig.sidebarNav.find(section => section.title === 'Security Certifications');
    expect(category?.items).toEqual([{ title: 'CCIE Security', href: '/docs/ccie-security' }]);
    expect(docsConfig.sidebarNav.findIndex(section => section.title === 'Security Certifications') + 1).toBe(docsConfig.sidebarNav.findIndex(section => section.title === 'Resources'));
    expect(docsConfig.sidebarNav.find(section => section.title === 'Resources')?.items).toContainEqual({ title: 'AppSec Certifications', href: '/docs/certifications' });
  });

  test('publishes the original document title and a meaningful description as Next metadata', async () => {
    const metadata = (await evaluatedPage()).metadata as { title?: string; description?: string } | undefined;
    expect(metadata?.title).toBe(sourceDocument.querySelector('h1')!.textContent!);
    expect(metadata?.description).toContain('CCIE Security');
  });

  test('is discoverable through the existing search index with its original title', async () => {
    const results = (await getSearchIndex()).filter(item => item.href === '/docs/ccie-security');
    expect(results).toHaveLength(1);
    expect(results[0].title).toBe(sourceDocument.querySelector('h1')!.textContent!);
    expect(results[0].description).toContain('61');
    expect(results[0].content).toContain('CCIE Security');
  });

  test('all 61 original definitions pass the real bundled Mermaid parser', async () => {
    const { default: mermaid } = await import('mermaid');
    mermaid.initialize({ startOnLoad: false, securityLevel: 'strict' });
    expect(definitions.size).toBe(61);
    for (const [id, definition] of definitions) expect(await mermaid.parse(definition), `diagram ${id}`).toBeTruthy();
  });

  test('has no legacy scripts, CDN imports, unsafe URL schemes or handler attributes', async () => {
    const page = (await renderedPage()).querySelector('.ccie-guide')!;
    expect(page.querySelector('script, style, iframe, form')).toBeNull();
    for (const el of page.querySelectorAll('*')) {
      for (const attr of [...el.attributes]) {
        expect(attr.name.startsWith('on')).toBe(false);
        if (['href', 'src'].includes(attr.name)) expect(attr.value).not.toMatch(/^\s*(javascript:|data:text\/html)/i);
      }
    }
    const mdx = readFileSync(new URL('./page.mdx', import.meta.url), 'utf8');
    expect(mdx).toContain("import '@fontsource-variable/source-serif-4'");
    expect(mdx).toContain("import './ccie-security.css'");
    expect(mdx).not.toContain('cdn.jsdelivr.net');
    expect(mdx).not.toContain('cdnjs.cloudflare.com');
  });

  test('the fidelity comparator detects a deleted item, a changed cell and missing emphasis', async () => {
    for (const selector of ['.section li', '.section td', '.section strong']) {
      const page = await renderedPage();
      const item = page.querySelector(selector)!;
      const section = item.closest('.section')!;
      const original = sourceDocument.getElementById(section.id)!;
      expect(canonical(section)).toEqual(canonical(original));
      item.remove();
      expect(canonical(section)).not.toEqual(canonical(original));
    }
  });

  test('the stylesheet comparison detects missing dots and missing ordered numbers', () => {
    const source = postcss.parse(sourceHtml.match(/<style>([\s\S]*?)<\/style>/)![1]);
    const migrated = postcss.parse(readFileSync(new URL('./ccie-security.css', import.meta.url), 'utf8'));
    for (const selector of ['.section ul>li::before', '.section ol>li::before']) {
      const expected: string[] = [];
      source.walkRules(selector, rule => { rule.walkDecls(d => { expected.push(`${d.prop}:${d.value}`); }); });
      const damaged = migrated.clone();
      damaged.walkRules(`.ccie-guide.ccie-guide ${selector}`, rule => { rule.remove(); });
      const actual: string[] = [];
      damaged.walkRules(`.ccie-guide.ccie-guide ${selector}`, rule => { rule.walkDecls(d => { actual.push(`${d.prop}:${d.value}`); }); });
      expect(actual).not.toEqual(expected);
    }
  });
});
