import { afterEach, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { cleanup, render, fireEvent } from '@testing-library/react';
import postcss from 'postcss';
import { canonical, declarations, renderedPage, scope, sourceCss, sourceDocument } from './fidelity-helpers';

afterEach(cleanup);
test('renders the complete original hero and preserves the creation date', async () => {
  expect(canonical((await renderedPage()).querySelector('.hero')!)).toEqual(canonical(sourceDocument.querySelector('.hero')!));
});
test('retains round dots, native ordered markers, nested spacing, check counters and reference badges', () => {
  const css = postcss.parse(readFileSync(new URL('./ccst-cybersecurity.css', import.meta.url), 'utf8'));
  for (const selector of ['ul', 'ul>li', 'ul>li::before', 'ol>li::marker', 'li>ul,li>ol', '.checklist', '.n::before', '.box', '.check input:checked+.box', '.check input:checked+.box::after', '.check input:focus-visible+.box', '.check:has(input:checked)', '.check:has(input:checked) .t', '.ref-n']) {
    const original = declarations(sourceCss, selector);
    const scoped = selector.split(',').map(s => `${scope} ${s}`).join(',');
    expect(original.length).toBeGreaterThan(0);
    expect(declarations(css, scoped), selector).toEqual(original);
  }
  expect(declarations(css, `${scope} ol`)).toContain('list-style-type:decimal');
});
test('keeps every source CSS rule isolated and preserves responsive and reduced motion rules', () => {
  const css = postcss.parse(readFileSync(new URL('./ccst-cybersecurity.css', import.meta.url), 'utf8'));
  css.walkRules(rule => expect(rule.selector.split(',').every(s => s.trim().startsWith(scope) || s.trim().startsWith('.docs-main:has(.ccst-guide)') || s.trim() === ':root:has(.ccst-guide)')).toBe(true));
  expect(css.toString()).toContain('(max-width:1000px)');
  expect(css.toString()).toContain('(prefers-reduced-motion:reduce)');
  expect(css.toString()).toContain('var(--docs-header-height');
});
test('preserves the entire original TOC link order and grouped chapter labels', async () => {
  const page = await renderedPage();
  const links = (el: Element) => [...el.querySelectorAll('nav a')].map(a => [a.textContent, a.getAttribute('href')]);
  expect(links(page.querySelector('.sidebar')!)).toEqual(links(sourceDocument.querySelector('.sidebar')!));
  expect([...page.querySelectorAll('.nav-group')].map(el => el.textContent)).toEqual([...sourceDocument.querySelectorAll('.nav-group')].map(el => el.textContent));
});
test('the mobile drawer opens, traps focus, closes with Escape, and restores body scrolling', async () => {
  const { GuideSidebar } = await import(new URL('./GuideSidebar.tsx', import.meta.url).href);
  const { toc } = await import(new URL('./toc.ts', import.meta.url).href);
  const { container, getByRole } = render(createElement('div', { className: 'ccst-guide' }, createElement(GuideSidebar, { groups: toc })));
  const button = getByRole('button', { name: '目次を開く' });
  const overflow = document.body.style.overflow;
  fireEvent.click(button); expect(button).toHaveAttribute('aria-expanded', 'true');
  expect(document.body.style.overflow).toBe('hidden');
  const links = [...container.querySelectorAll<HTMLAnchorElement>('nav a')];
  expect(document.activeElement === links[0]).toBe(true);
  links.at(-1)!.focus(); fireEvent.keyDown(document, { key: 'Tab' }); expect(document.activeElement === links[0]).toBe(true);
  fireEvent.keyDown(document, { key: 'Escape' }); expect(button).toHaveAttribute('aria-expanded', 'false');
  expect(document.activeElement === button).toBe(true); expect(document.body.style.overflow).toBe(overflow);
});
test('bundles all six source icon variants as SVG without external icon fonts', async () => {
  const { GuideIcon } = await import(new URL('./GuideIcon.tsx', import.meta.url).href);
  for (const name of ['ti-info-circle', 'ti-external-link', 'ti-book', 'ti-tool', 'ti-bulb', 'ti-target']) {
    const { container, unmount } = render(createElement(GuideIcon, { name }));
    expect(container.querySelector('i')?.getAttribute('class')).toBe(`ti ${name}`);
    expect(container.querySelector('svg')).not.toBeNull(); unmount();
  }
});
test('highlights IOS and PowerShell while preserving literal code and leaving nohighlight unchanged', async () => {
  const { GuideCode } = await import(new URL('./GuideCode.tsx', import.meta.url).href);
  for (const [language, code] of [['ios', '! comment\nip access-list extended TEST\n permit tcp any host 192.168.1.1'], ['powershell', 'Get-Process | Select-Object -First 5'], ['plain', 'hello <world> {value}\n  next']]) {
    const { container, unmount } = render(createElement(GuideCode, { language, code }));
    expect(container.textContent).toBe(code);
    if (language === 'plain') expect(container.querySelector('span')).toBeNull();
    else expect(container.querySelector('[class^="hljs-"]')).not.toBeNull();
    unmount();
  }
});
