import { afterEach, beforeEach, describe, expect, test, spyOn } from 'bun:test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createElement } from 'react';
import { act, cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import postcss from 'postcss';
import { Window } from 'happy-dom';
import { declarations, definitions, here, renderedPage, scope, sourceCss, sourceDocument, sourceHtml } from './fidelity-helpers';

const originalObserver = globalThis.IntersectionObserver;
beforeEach(() => { globalThis.IntersectionObserver = undefined as unknown as typeof IntersectionObserver; });
afterEach(() => { cleanup(); globalThis.IntersectionObserver = originalObserver; window.history.replaceState(null, '', '/'); });

describe('Secure by Design display foundation', () => {
  test('fills the available width without inheriting the shared 800px prose cap at desktop, tablet or phone sizes', async () => {
    const css = readFileSync(resolve(here, '../../globals.css'), 'utf8') + '\n'
      + readFileSync(resolve(here, '../docs-layout.css'), 'utf8') + '\n'
      + readFileSync(resolve(here, 'secure-by-design.css'), 'utf8');
    const markup = (await renderedPage()).querySelector('.secure-by-design-guide')!.outerHTML;
    for (const width of [1440, 900, 375]) {
      const isolated = new Window({ settings: { disableJavaScriptEvaluation: true, disableCSSFileLoading: true } });
      try {
        isolated.happyDOM.setWindowSize({ width, height: 900 });
        isolated.document.head.innerHTML = `<style>${css}</style>`;
        isolated.document.body.innerHTML = `<div class="docs-shell"><main class="docs-main"><article class="prose docs-article">${markup}</article></main></div>`;
        const bodies = isolated.document.querySelectorAll('.secure-by-design-guide .section > .prose');
        expect(bodies).toHaveLength(17);
        for (const body of bodies) {
          const style = isolated.getComputedStyle(body);
          expect(style.maxWidth, `${width}px max-width`).toBe('none');
          expect(style.width, `${width}px width`).toBe('100%');
          expect(style.marginLeft, `${width}px left margin`).toBe('0px');
          expect(style.marginRight, `${width}px right margin`).toBe('0px');
        }
        const main = isolated.document.querySelector('.secure-by-design-guide .main')!;
        const style = isolated.getComputedStyle(main);
        expect(style.maxWidth).toBe('none');
        expect(style.width).toBe(width > 1024 ? 'calc(100% - 320px)' : '100%');
        expect(style.marginLeft).toBe(width > 1024 ? '320px' : '0px');
      } finally { await isolated.happyDOM.close(); }
    }
  });

  test('preserves every source CSS declaration and media context under an isolated scope', () => {
    const css = postcss.parse(readFileSync(resolve(here, 'secure-by-design.css'), 'utf8'));
    sourceCss.walkRules(rule => {
      const parent = rule.parent;
      const media = parent?.type === 'atrule' ? (parent as postcss.AtRule).params : undefined;
      const selectors = rule.selector.split(',').map(s => s.trim());
      const map = (s: string) => ['body', 'html', ':root'].includes(s) ? scope : s.includes('body.nav-open') ? s.replace('body.nav-open', `${scope}.nav-open`) : `${scope} ${s}`;
      const expectedSelector = selectors.map(map).join(',');
      const candidates: postcss.Rule[] = [];
      css.walkRules(r => {
        const context = r.parent?.type === 'atrule' ? (r.parent as postcss.AtRule).params : undefined;
        if (r.selector === expectedSelector && context === media) candidates.push(r);
      });
      const expected: string[] = [];
      rule.walkDecls(d => { expected.push(`${d.prop}:${d.value}`); });
      expect(candidates.some(r => { const actual: string[] = []; r.walkDecls(d => { actual.push(`${d.prop}:${d.value}`); }); return JSON.stringify(actual) === JSON.stringify(expected); }), rule.selector).toBe(true);
    });
    css.walkRules(rule => { expect(rule.selector.split(',').every(s => s.trim().startsWith(scope) || ['.docs-main:has(.secure-by-design-guide)', ':root:has(.secure-by-design-guide)'].includes(s.trim()))).toBe(true); });
    for (const selector of ['.prose ul>li::before', '.prose ol', '.prose ol>li', '.prose ol>li::before', '.sidebar nav li::before']) expect(declarations(css, `${scope} ${selector}`)).toEqual(declarations(sourceCss, selector));
    expect(declarations(css, `${scope} .sidebar`)).toContain('top:var(--docs-header-height, 4rem)');
    expect(declarations(css, `${scope} .section`)).toContain('scroll-margin-top:calc(var(--docs-header-height, 4rem) + 1rem)');
  });

  test('applies source smooth scrolling to the actual document only while this guide is present and honors reduced motion', () => {
    const css = postcss.parse(readFileSync(resolve(here, 'secure-by-design.css'), 'utf8'));
    const values: [string | undefined, string][] = [];
    css.walkRules(':root:has(.secure-by-design-guide)', rule => {
      const media = rule.parent?.type === 'atrule' ? (rule.parent as postcss.AtRule).params : undefined;
      rule.walkDecls('scroll-behavior', d => { values.push([media, d.value]); });
    });
    expect(values).toEqual([[undefined, 'smooth'], ['(prefers-reduced-motion:reduce)', 'auto']]);
  });

  test('keeps intrinsic lists and tables independent of global MDX styling', async () => {
    const { E } = await import(new URL('./GuideElements.tsx', import.meta.url).href);
    const { container } = render(createElement(E.ul, {}, createElement(E.li, {}, '項目')));
    expect(container.innerHTML).toBe('<ul><li>項目</li></ul>');
  });

  test('highlights Java with escaped markup and exactly preserves whitespace and code text', async () => {
    const { JavaCode } = await import(new URL('./JavaCode.tsx', import.meta.url).href);
    const code = 'public class Example {\n  String value = "<script> & safe";\n}\n';
    const { container } = render(createElement('pre', {}, createElement(JavaCode, { code })));
    expect(container.querySelector('code')?.textContent).toBe(code);
    expect(container.querySelector('.hljs-keyword')).not.toBeNull();
    expect(container.querySelector('script')).toBeNull();
  });

  test('retains all 15 diagram definitions and every dark theme variable', async () => {
    const { diagrams } = await import(new URL('./diagrams.ts', import.meta.url).href);
    expect(Object.entries(diagrams)).toEqual([...definitions]);
    const implementation = readFileSync(resolve(here, 'MermaidFigure.tsx'), 'utf8');
    const theme = sourceHtml.match(/themeVariables:\{([\s\S]*?)\n    \}/)![1];
    for (const [, key, value] of theme.matchAll(/(\w+):\s*('.*?'|true)/g)) expect(implementation).toMatch(new RegExp(`\\b${key}:\\s*${value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`));
    expect(implementation).toContain("securityLevel: 'strict'");
  });

  test('renders diagrams with unique IDs, original labels and source-specific viewBox padding', async () => {
    const { MermaidFigure } = await import(new URL('./MermaidFigure.tsx', import.meta.url).href);
    const ids: string[] = [];
    const renderer = async (id: string) => { ids.push(id); return { svg: '<svg viewBox="0 0 100 50" width="100" height="50"></svg>' }; };
    const { container } = render(createElement('div', {}, createElement(MermaidFigure, { id: 'd1', source: 'flowchart TD\nA-->B', renderer }), createElement(MermaidFigure, { id: 'd1', source: 'stateDiagram-v2\nA-->B', renderer })));
    await waitFor(() => expect(container.querySelectorAll('svg')).toHaveLength(2));
    expect(new Set(ids).size).toBe(2);
    expect([...container.querySelectorAll('[role="img"]')].map(el => el.getAttribute('aria-label'))).toEqual(['図1', '図1']);
    expect([...container.querySelectorAll('svg')].map(el => el.getAttribute('viewBox'))).toEqual(['0 0 100 65', '0 0 100 160']);
    expect(container.querySelector('svg')?.style.width).toBe('100px');
    expect(container.querySelector('svg')?.getAttribute('height')).toBeNull();
  });

  test('exposes rendering failures with the original error text and readable source', async () => {
    const { MermaidFigure } = await import(new URL('./MermaidFigure.tsx', import.meta.url).href);
    const error = spyOn(console, 'error').mockImplementation(() => {});
    try {
      const { getByRole, getByText } = render(createElement(MermaidFigure, { id: 'd2', source: 'invalid source', renderer: async () => { throw new Error('broken'); } }));
      await waitFor(() => expect(getByRole('alert')).toHaveTextContent('図の描画に失敗しました (d2)'));
      expect(getByText('invalid source')).toBeInTheDocument();
    } finally { error.mockRestore(); }
  });

  test('discards old diagram results and errors after definition changes or unmount', async () => {
    const { MermaidFigure } = await import(new URL('./MermaidFigure.tsx', import.meta.url).href);
    let resolveOld!: (out: { svg: string }) => void;
    let rejectNew!: (error: Error) => void;
    let count = 0;
    const renderer = () => ++count === 1 ? new Promise<{ svg: string }>(resolve => { resolveOld = resolve; }) : new Promise<{ svg: string }>((_, reject) => { rejectNew = reject; });
    const error = spyOn(console, 'error').mockImplementation(() => {});
    try {
      const { container, rerender, unmount } = render(createElement(MermaidFigure, { id: 'd1', source: 'old', renderer }));
      rerender(createElement(MermaidFigure, { id: 'd1', source: 'new', renderer }));
      await act(async () => resolveOld({ svg: '<svg viewBox="0 0 10 10"></svg>' }));
      expect(container.querySelector('svg')).toBeNull();
      unmount();
      await act(async () => rejectNew(new Error('obsolete')));
      expect(error).not.toHaveBeenCalled();
    } finally { error.mockRestore(); }
  });

  test('preserves original TOC and hash selection; mobile closes on link, Escape, backdrop and desktop resize', async () => {
    const { GuideSidebar } = await import(new URL('./GuideSidebar.tsx', import.meta.url).href);
    const { toc } = await import(new URL('./toc.ts', import.meta.url).href);
    expect(toc.map((item: { id: string; title: string }) => [`#${item.id}`, item.title])).toEqual([...sourceDocument.querySelectorAll('aside nav a')].map(a => [a.getAttribute('href'), a.textContent]));
    window.history.replaceState(null, '', '#sec-12');
    const { container, getByRole } = render(createElement('div', { className: 'secure-by-design-guide' }, createElement(GuideSidebar, { items: toc })));
    await waitFor(() => expect(container.querySelector('a[aria-current="location"]')).toHaveAttribute('href', '#sec-12'));
    const button = getByRole('button', { name: '目次を開く' });
    const open = () => { fireEvent.click(button); expect(button).toHaveAttribute('aria-expanded', 'true'); };
    open(); fireEvent.keyDown(document, { key: 'Escape' }); expect(button).toHaveAttribute('aria-expanded', 'false'); expect(document.activeElement).toBe(button);
    open(); fireEvent.click(getByRole('button', { name: '目次を閉じる背景' })); expect(button).toHaveAttribute('aria-expanded', 'false');
    open(); fireEvent.click(container.querySelector('a[href="#sec-3"]')!); expect(button).toHaveAttribute('aria-expanded', 'false');
    open(); window.innerWidth = 1200; fireEvent(window, new Event('resize')); expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(document.body.style.overflow).toBe('');
  });

  test('selects the observed section and disconnects observers on unmount', async () => {
    let notify!: IntersectionObserverCallback; let disconnected = 0;
    class Observer { constructor(cb: IntersectionObserverCallback) { notify = cb; } observe() {} disconnect() { disconnected++; } }
    globalThis.IntersectionObserver = Observer as unknown as typeof IntersectionObserver;
    const { GuideSidebar } = await import(new URL('./GuideSidebar.tsx', import.meta.url).href);
    const { toc } = await import(new URL('./toc.ts', import.meta.url).href);
    const { container, unmount } = render(createElement('div', { className: 'secure-by-design-guide' }, createElement(GuideSidebar, { items: toc }), createElement('section', { id: 'sec-2' })));
    act(() => notify([{ isIntersecting: true, target: container.querySelector('section'), boundingClientRect: { top: 10 } } as unknown as IntersectionObserverEntry], {} as IntersectionObserver));
    expect(container.querySelector('a[aria-current="location"]')).toHaveAttribute('href', '#sec-2');
    unmount(); expect(disconnected).toBe(1);
  });

  test('wraps mobile keyboard focus and restores prior body overflow on unmount', async () => {
    const { GuideSidebar } = await import(new URL('./GuideSidebar.tsx', import.meta.url).href);
    const { toc } = await import(new URL('./toc.ts', import.meta.url).href);
    document.body.style.overflow = 'scroll';
    try {
      const { container, getByRole, unmount } = render(createElement('div', { className: 'secure-by-design-guide' }, createElement(GuideSidebar, { items: toc })));
      fireEvent.click(getByRole('button', { name: '目次を開く' }));
      const links = [...container.querySelectorAll<HTMLAnchorElement>('aside a')];
      expect(document.activeElement).toBe(links[0]);
      fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
      expect(document.activeElement).toBe(links.at(-1)!);
      fireEvent.keyDown(document, { key: 'Tab' });
      expect(document.activeElement).toBe(links[0]);
      expect(document.body.style.overflow).toBe('hidden');
      unmount();
      expect(document.body.style.overflow).toBe('scroll');
      expect(container.querySelector('.nav-open')).toBeNull();
    } finally { document.body.style.overflow = ''; }
  });
});
