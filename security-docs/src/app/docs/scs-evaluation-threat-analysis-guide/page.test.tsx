import { expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { evaluate } from '@mdx-js/mdx';
import * as runtime from 'react/jsx-runtime';
import { renderToStaticMarkup } from 'react-dom/server';
import remarkFrontmatter from 'remark-frontmatter';
import remarkMdxFrontmatter from 'remark-mdx-frontmatter';
import remarkGfm from 'remark-gfm';
import { docsConfig } from '@/config/docs';
import { extractHeadings, getSearchIndex } from '@/lib/search';
import { useMDXComponents } from '@/mdx-components';

const route = '/docs/scs-evaluation-threat-analysis-guide';
const source = readFileSync(new URL('../../../../../Scs-evaluation-threat-analysis-guide.md', import.meta.url), 'utf8');
const page = readFileSync(new URL('./page.mdx', import.meta.url), 'utf8');

test('the published MDX preserves the complete guide, exercise, 90-day plan and diagram definitions', async () => {
  const body = page.slice(page.indexOf('\n# ') + 1).replace(/\n<\/div>\n$/, '');
  const restored = body.replace(/<div className="[^"]+">\n<MermaidFigure id="d\d+" source=\{("(?:[^"\\]|\\.)*")\} \/>\n<\/div>/g,
    (_match, definition: string) => '```mermaid\n' + JSON.parse(definition) + '\n```').replace(/\[(https?:\/\/[^\]\n]+)\]\(\1\)/g, '$1');
  expect(restored).toBe(source);
  const { default: Page } = await evaluate(page, {
    ...runtime, development: false, baseUrl: import.meta.url,
    remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter, remarkGfm],
  });
  const document = new DOMParser().parseFromString(renderToStaticMarkup(runtime.jsx(Page, { components: useMDXComponents({}) })), 'text/html');
  expect([...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map(heading => heading.textContent)).toEqual(extractHeadings(source));
  expect(document.querySelectorAll('[data-diagram]')).toHaveLength(14);
  expect(document.body).toHaveTextContent('ミライ製作所');
  expect(document.body).toHaveTextContent('90日');
  expect(document.querySelectorAll('table').length).toBeGreaterThan(20);
  for (const link of document.querySelectorAll('a[href]')) expect(link.getAttribute('href')).not.toMatch(/[【】、。]/);
});

test('navigation and the generated search index expose the guide and its exercise and planning headings once', async () => {
  expect(docsConfig.sidebarNav.flatMap(section => section.items).filter(item => item.href === route)).toHaveLength(1);
  const entries = (await getSearchIndex()).filter(entry => entry.href === route);
  expect(entries).toHaveLength(1);
  expect(entries[0].headings).toEqual(extractHeadings(source));
  const index = JSON.parse(readFileSync(new URL('../../../../public/search-index.json', import.meta.url), 'utf8'));
  expect(index.filter((entry: { href: string }) => entry.href === route)).toEqual(entries);
});
