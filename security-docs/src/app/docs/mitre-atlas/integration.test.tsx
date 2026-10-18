import { expect, test, spyOn } from 'bun:test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import postcss from 'postcss';
import { docsConfig } from '@/config/docs';
import { getSearchIndex } from '@/lib/search';
import { canonical, declarations, definitions, evaluatedPage, here, iconHooks, inventory, renderedPage, repo, scope, sourceCss, sourceDocument, sourceHtml, text, sourceTest } from './fidelity-helpers';

sourceTest('locks original HTML/Markdown hashes and the complete article inventory', async () => {
  expect(createHash('sha256').update(sourceHtml).digest('hex')).toBe(inventory.sha256);
  expect(createHash('sha256').update(readFileSync(resolve(repo, inventory.markdownSource))).digest('hex')).toBe(inventory.markdownSha256);
  const page = (await renderedPage()).querySelector('.main')!;
  const source = sourceDocument.querySelector('main')!;
  for (const [selector, count] of Object.entries({ section: 13, h1: 1, h2: 13, h3: 3, h4: 17, table: 11, 'tbody td': 228, ul: 4, ol: 1, li: 50, strong: 21, code: 63, '.mermaid-wrap': 4, '.step-card': 6, '.callout': 4 })) {
    const countNodes = (element: Element) => [...element.querySelectorAll(selector)].filter(el => !el.closest('.mermaid-diagram')).length;
    expect(countNodes(source), `source ${selector}`).toBe(count);
    expect(countNodes(page), `page ${selector}`).toBe(count);
  }
  expect([...page.querySelectorAll('section')].map(el => el.id)).toEqual(inventory.sections.map((s: { id: string }) => s.id));
});

sourceTest('preserves all source TOC links and resolves every fragment to one unique destination', async () => {
  const page = await renderedPage();
  const links = [...page.querySelectorAll('aside nav a')];
  expect(links.map(el => [text(el), el.getAttribute('href')])).toEqual([...sourceDocument.querySelectorAll('aside nav a')].map(el => [text(el), el.getAttribute('href')]));
  for (const link of links) expect(page.querySelectorAll(`[id="${link.getAttribute('href')!.slice(1)}"]`)).toHaveLength(1);
  const ids = [...page.querySelectorAll('[id]')].map(el => el.id);
  expect(new Set(ids).size).toBe(ids.length);
  expect(page.querySelectorAll('main')).toHaveLength(0);
});

test('registers MITRE ATLAS exactly once under Advanced Topics and retains all existing links', () => {
  const entry = { title: 'MITRE ATLAS', href: '/docs/mitre-atlas' };
  expect(docsConfig.sidebarNav.find(group => group.title === 'Advanced Topics')?.items).toContainEqual(entry);
  expect(docsConfig.sidebarNav.flatMap(group => group.items).filter(item => item.href === entry.href)).toEqual([entry]);
  expect(new Set(docsConfig.sidebarNav.flatMap(group=>group.items).map(item=>item.href)).size).toBe(docsConfig.sidebarNav.flatMap(group=>group.items).length);
  expect(docsConfig.sidebarNav.find(group => group.title === 'Advanced Topics')?.items).toContainEqual({ title: 'OWASP Top 10 (2025/2026)', href: '/docs/owasp' });
});

function expectedHeadings() {
  return [...sourceDocument.querySelectorAll('main h1, main h2, main h3, main h4')].map(el => {
    const clone = el.cloneNode(true) as Element;
    for (const br of clone.querySelectorAll('br')) br.replaceWith(sourceDocument.createTextNode(' '));
    return text(clone);
  });
}
sourceTest('uses the original document title and indexes all 34 compound headings without losing icon or tag headings', async () => {
  const metadata = (await evaluatedPage()).metadata as { title: string; description: string };
  expect(metadata.title).toBe(sourceHtml.match(/<title>([^<]+)<\/title>/)![1]);
  expect(metadata.description).toBe(text(sourceDocument.querySelector('.lead')!));
  const entries = (await getSearchIndex()).filter(item => item.href === '/docs/mitre-atlas');
  expect(entries).toHaveLength(1);
  expect(entries[0].title).toBe(metadata.title);
  expect(entries[0].description).toBe(metadata.description);
  expect(entries[0].headings).toEqual(expectedHeadings());
  expect(entries[0].headings).toHaveLength(34);
  expect(entries[0].content).not.toContain('import ');
});

test('publishes all registered complete search entries including the live ATLAS title, description and full headings', async () => {
  const cached = JSON.parse(readFileSync(resolve(here, '../../../../public/search-index.json'), 'utf8'));
  expect(cached).toHaveLength(docsConfig.sidebarNav.flatMap(group=>group.items).length);
  // 件数一致だけでは取り違え（欠落と重複の相殺）を検出できないため href 集合も比較する
  const sorted = (hrefs: string[]) => [...new Set(hrefs)].sort();
  expect(sorted(cached.map((item: { href: string }) => item.href))).toEqual(sorted(docsConfig.sidebarNav.flatMap(group => group.items).map(item => item.href)));
  expect(cached.filter((item: { href: string }) => item.href === '/docs/mitre-atlas')).toEqual((await getSearchIndex()).filter(item => item.href === '/docs/mitre-atlas'));
});

sourceTest('all four source definitions pass the real Mermaid parser with the readability theme and original palette', async () => {
  const { default: mermaid } = await import('mermaid');
  const { diagramConfig } = await import('./MermaidDiagram');
  expect(definitions.size).toBe(4);
  for (const [id, source] of definitions) expect(await mermaid.parse(`---\nconfig: ${JSON.stringify(diagramConfig)}\n---\n${source}`), id).toBeTruthy();
  const theme = sourceHtml.match(/themeVariables:\s*\{([\s\S]*?)\}/)![1];
  const readabilityOverrides: Record<string, string> = { fontSize: '18px', primaryTextColor: '#f8fafc', secondaryTextColor: '#f8fafc', nodeTextColor: '#f8fafc', titleColor: '#f8fafc', lineColor: '#cbd5e1' };
  for (const [, key, value] of theme.matchAll(/(\w+):\s*'([^']*)'/g)) expect(diagramConfig.themeVariables).toHaveProperty(key, readabilityOverrides[key] ?? value);
});

test('the default renderer uses per-diagram configuration without initializing the shared engine', async () => {
  const { default: mermaid } = await import('mermaid');
  const { diagramConfig, renderDiagram } = await import('./MermaidDiagram');
  const render = spyOn(mermaid, 'render').mockResolvedValue({ svg: '<svg></svg>', diagramType: 'flowchart-v2' });
  const initialize = spyOn(mermaid, 'initialize');
  try {
    expect(await renderDiagram('figure', 'flowchart LR\nA-->B')).toMatchObject({ svg: '<svg></svg>' });
    expect(render).toHaveBeenCalledWith('figure', `---\nconfig: ${JSON.stringify(diagramConfig)}\n---\nflowchart LR\nA-->B`);
    expect(initialize).not.toHaveBeenCalled();
  } finally { render.mockRestore(); initialize.mockRestore(); }
});

test('rejects legacy scripts, CDN imports, unsafe schemes and handler attributes; blank-target links are protected', async () => {
  const page = (await renderedPage()).querySelector('.atlas-guide')!;
  expect(page.querySelector('script, style, iframe, form')).toBeNull();
  for (const el of page.querySelectorAll('*')) for (const attr of [...el.attributes]) {
    expect(attr.name.startsWith('on')).toBe(false);
    if (['href', 'src'].includes(attr.name)) expect(attr.value).not.toMatch(/^\s*(javascript:|data:text\/html)/i);
  }
  for (const link of page.querySelectorAll('a[target="_blank"]')) expect(link.getAttribute('rel')).toBe('noopener noreferrer');
  expect(readFileSync(resolve(here, 'page.mdx'), 'utf8')).not.toMatch(/cdn\.jsdelivr\.net|<script|DIAGRAMS\s*=/);
});

sourceTest('comparison detects missing list items, changed cells, lost tags, missing step numbers and removed URLs', async () => {
  for (const selector of ['li', 'td', '.tag', '.num', 'a']) {
    const section = (await renderedPage()).querySelector(`.main section ${selector}`)!.closest('section')!;
    const original = sourceDocument.getElementById(section.id)!;
    const clone = section.cloneNode(true) as Element;
    expect(canonical(clone)).toEqual(canonical(original));
    clone.querySelector(selector)!.remove();
    expect(canonical(clone)).not.toEqual(canonical(original));
  }
});

sourceTest('list and numbered-card contracts detect missing marker restoration and lost number styling', () => {
  const css = postcss.parse(readFileSync(resolve(here, 'mitre-atlas.css'), 'utf8'));
  for (const [selector, property, value] of [['ul', 'list-style-type', 'disc'], ['ol', 'list-style-type', 'decimal'], ['ul.ref-list', 'list-style-type', 'none']]) {
    expect(declarations(css, `${scope} ${selector}`).get(property)).toBe(value);
    const damaged = css.clone(); damaged.walkRules(`${scope} ${selector}`, rule => { rule.remove(); });
    expect(declarations(damaged, `${scope} ${selector}`).get(property)).not.toBe(value);
  }
  expect(declarations(css, `${scope} .step-card .num`)).toEqual(declarations(sourceCss, '.step-card .num'));
});

sourceTest('icon comparison allows library classes but detects removal or substitution of original hooks', async () => {
  const section = (await renderedPage()).getElementById('sec5')!;
  const clone = section.cloneNode(true) as Element;
  const original = sourceDocument.getElementById('sec5')!;
  expect(iconHooks(clone)).toEqual(iconHooks(original));
  clone.querySelector('.ti-bug')!.classList.replace('ti-bug', 'ti-info-circle');
  expect(iconHooks(clone)).not.toEqual(iconHooks(original));
});
