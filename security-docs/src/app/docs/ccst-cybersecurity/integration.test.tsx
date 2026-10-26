import { expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import postcss from 'postcss';
import { docsConfig } from '@/config/docs';
import { getSearchIndex } from '@/lib/search';
import { canonical, declarations, evaluatedPage, renderedPage, scope, sourceCss, sourceDocument, sourceHtml, sourceTest } from './fidelity-helpers';

sourceTest('preserves the immutable original and complete main content in source order', async () => {
  expect(createHash('sha256').update(sourceHtml).digest('hex')).toBe('cc8abf8ebc61e443018ce43196b93e55a3f20cfbb4791333cd34c4ab67d8ac4e');
  const page = (await renderedPage()).querySelector('.main')!;
  const original = sourceDocument.querySelector('main')!;
  const children = (el: Element) => [...el.childNodes].map(canonical).filter(value => value !== null);
  expect(children(page)).toEqual(children(original));
  for (const [selector, count] of Object.entries({ section: 46, 'h1,h2,h3,h4,h5': 227, table: 163, '.diagram': 50, pre: 3, ul: 48, ol: 25, li: 344, strong: 1148, '.callout': 107, '.qa': 25, '.opt': 100, '.check': 25, '.ref': 60, 'i.ti': 175, a: 124 })) {
    expect(original.querySelectorAll(selector).length, `source ${selector}`).toBe(count);
    expect(page.querySelectorAll(selector).length, selector).toBe(count);
  }
});
test('registers CCST once immediately after CCIE in Security Certifications', () => {
  expect(docsConfig.sidebarNav.find(group => group.title === 'Security Certifications')?.items).toEqual([
    { title: 'CCIE Security', href: '/docs/ccie-security' }, { title: 'CCST Cybersecurity', href: '/docs/ccst-cybersecurity' }, { title: 'ISC2 CC (Certified in Cybersecurity)', href: '/docs/cc-certified-in-cybersecurity-guide' }, { title: 'CCSP (Certified Cloud Security Professional)', href: '/docs/ccsp-study-guide' }, { title: 'CISSP (Certified Information Systems Security Professional)', href: '/docs/cissp-guide' }, { title: 'CGRC (Certified in Governance, Risk and Compliance)', href: '/docs/cgrc-guide' }, { title: 'ISSAP (Information Systems Security Architecture Professional)', href: '/docs/issap-guide' }, { title: 'CSSLP (Certified Secure Software Lifecycle Professional)', href: '/docs/csslp-guide' }, { title: 'CyberOps Associate (200-201 CBROPS)', href: '/docs/cyberops-associate-guide' }, { title: 'CyberOps Professional (350-201 CBRCOR / 300-215 CBRFIR)', href: '/docs/cyberops-professional-guide' }, { title: 'AppSec Certifications', href: '/docs/certifications' },
  ]);
  expect(docsConfig.sidebarNav.flatMap(group => group.items).filter(item => item.href === '/docs/ccst-cybersecurity')).toHaveLength(1);
});
sourceTest('publishes original title metadata and indexes all 227 headings including icon and inline-code headings', async () => {
  const metadata = (await evaluatedPage()).metadata as { title: string; description: string };
  const title = sourceDocument.querySelector('.hero h1')!.textContent!;
  expect(metadata.title).toBe(title); expect(metadata.description).toContain('100-160');
  const result = (await getSearchIndex()).filter(item => item.href === '/docs/ccst-cybersecurity');
  expect(result).toHaveLength(1); expect(result[0].title).toBe(title);
  expect(result[0].headings).toEqual([...sourceDocument.querySelectorAll('main h1,main h2,main h3,main h4,main h5')].map(el => el.textContent!.replace(/\s+/g, ' ').trim()));
});
test('publishes CCST with all headings in the static search index served to the search modal', () => {
  const index = JSON.parse(readFileSync(new URL('../../../../public/search-index.json', import.meta.url), 'utf8'));
  const results = index.filter((item: { href: string }) => item.href === '/docs/ccst-cybersecurity');
  expect(results).toHaveLength(1); expect(results[0].headings).toHaveLength(227);
});
sourceTest('resolves every original TOC link to a unique target, preserving all IDs', async () => {
  const page = await renderedPage();
  const ids = [...page.querySelectorAll('[id]')].map(el => el.id);
  expect(new Set(ids).size).toBe(ids.length);
  for (const link of page.querySelectorAll('.guide-toc a')) expect(page.getElementById(link.getAttribute('href')!.slice(1))).not.toBeNull();
  expect([...page.querySelectorAll('.main [id]')].map(el => el.id)).toEqual([...sourceDocument.querySelectorAll('main [id]')].map(el => el.id));
});
test('has no legacy scripts, remote fonts, CDN imports, unsafe URLs or inline handlers', async () => {
  const page = (await renderedPage()).querySelector('.ccst-guide')!;
  expect(page.querySelector('script,style,iframe,form')).toBeNull();
  for (const el of page.querySelectorAll('*')) for (const attr of [...el.attributes]) {
    expect(attr.name.startsWith('on')).toBe(false);
    if (['href', 'src'].includes(attr.name)) expect(attr.value).not.toMatch(/^\s*(javascript:|data:text\/html)/i);
  }
  const mdx = readFileSync(new URL('./page.mdx', import.meta.url), 'utf8');
  expect(mdx).toContain("import '@fontsource-variable/source-serif-4'");
  expect(mdx).not.toMatch(/cdn\.jsdelivr\.net|cdnjs\.cloudflare\.com/);
});
sourceTest('detects lost table cells, nested list items, questions, reference badges and emphasis', async () => {
  for (const selector of ['.sec td', '.sec li', '.qa .opt', '.ref .chip', '.sec strong']) {
    const page = await renderedPage(); const item = page.querySelector(selector)!;
    const section = item.closest('section')!; const original = sourceDocument.getElementById(section.id)!;
    expect(canonical(section)).toEqual(canonical(original));
    item.remove(); expect(canonical(section)).not.toEqual(canonical(original));
  }
});
sourceTest('detects missing round dots, ordered marker colors, ordered numbers and checklist counters', () => {
  const css = postcss.parse(readFileSync(new URL('./ccst-cybersecurity.css', import.meta.url), 'utf8'));
  for (const selector of ['ul>li::before', 'ol>li::marker', '.checklist', '.check', '.n::before']) {
    const original = declarations(sourceCss, selector);
    expect(declarations(css, `${scope} ${selector}`)).toEqual(original);
    const broken = css.clone(); broken.walkRules(`${scope} ${selector}`, rule => { rule.remove(); });
    expect(declarations(broken, `${scope} ${selector}`)).not.toEqual(original);
  }
  const broken = css.clone(); broken.walkRules(`${scope} ol`, rule => { rule.walkDecls('list-style-type', d => { d.remove(); }); });
  expect(declarations(css, `${scope} ol`)).toContain('list-style-type:decimal');
  expect(declarations(broken, `${scope} ol`)).not.toContain('list-style-type:decimal');
});
