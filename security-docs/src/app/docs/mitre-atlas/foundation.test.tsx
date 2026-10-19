import { afterEach, describe, expect, test, spyOn } from 'bun:test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createElement } from 'react';
import { act, cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { Window } from 'happy-dom';
import postcss from 'postcss';
import { declarations, definitions, here, scope, sourceCss, sourceDocument, sourceTest } from './fidelity-helpers';

afterEach(() => { cleanup(); window.history.replaceState(null, '', '/'); });
describe('MITRE ATLAS display foundation', () => {
  sourceTest('retains every source CSS declaration and media condition in an isolated scope', () => {
    const css = postcss.parse(readFileSync(resolve(here, 'mitre-atlas.css'), 'utf8'));
    sourceCss.walkRules(rule => {
      const media = rule.parent?.type === 'atrule' ? (rule.parent as postcss.AtRule).params : undefined;
      const selector = rule.selector.split(',').map(s => [':root', 'body'].includes(s.trim()) ? scope : `${scope} ${s.trim()}`).join(',');
      const original: string[] = []; rule.walkDecls(d => { original.push(`${d.prop}:${d.value}`); });
      const candidates: string[][] = [];
      css.walkRules(r => {
        const context = r.parent?.type === 'atrule' ? (r.parent as postcss.AtRule).params : undefined;
        if (r.selector === selector && media === context) { const values: string[] = []; r.walkDecls(d => { values.push(`${d.prop}:${d.value}`); }); candidates.push(values); }
      });
      expect(candidates.some(values => JSON.stringify(values) === JSON.stringify(original)), rule.selector).toBe(true);
    });
    css.walkRules(rule => { expect(rule.selector.split(',').every(s => s.trim().startsWith(scope) || s.trim() === '.docs-main:has(.atlas-guide)')).toBe(true); });
    expect(declarations(css, `${scope} .sidebar`).get('top')).toBe('var(--docs-header-height, 4rem)');
    expect(declarations(css, `${scope} section`).get('scroll-margin-top')).toBe('calc(var(--docs-header-height, 4rem) + 1rem)');
  });

  test('restores browser list markers after real Tailwind preflight and fills desktop, tablet and phone widths', async () => {
    const css = readFileSync(resolve(here, '../../../../node_modules/tailwindcss/preflight.css'), 'utf8') + '\n'
      + readFileSync(resolve(here, '../../globals.css'), 'utf8') + '\n'
      + readFileSync(resolve(here, '../docs-layout.css'), 'utf8') + '\n'
      + readFileSync(resolve(here, 'mitre-atlas.css'), 'utf8');
    for (const width of [1440, 900, 375]) {
      const isolated = new Window({ settings: { disableJavaScriptEvaluation: true, disableCSSFileLoading: true } });
      try {
        isolated.happyDOM.setWindowSize({ width, height: 900 });
        isolated.document.head.innerHTML = `<style>${css}</style>`;
        isolated.document.body.innerHTML = '<div class="docs-shell"><main class="docs-main"><article class="prose docs-article"><div class="atlas-guide app"><aside class="sidebar"></aside><div class="main"><section><ul><li>点</li></ul><ol><li>番号</li></ol><ul class="ref-list"><li>出典</li></ul></section></div></div></article></main></div>';
        const style = (selector: string) => isolated.getComputedStyle(isolated.document.querySelector(selector)!);
        expect(style('.atlas-guide').width).toBe('100%');
        expect(style('.atlas-guide').maxWidth).toBe('none');
        expect(style('.atlas-guide .main').width).toBe(width > 900 ? 'calc(100% - 260px)' : '100%');
        expect(style('.atlas-guide .main').maxWidth).toBe('none');
        expect(style('.atlas-guide ul:not(.ref-list)').listStyleType).toBe('disc');
        expect(style('.atlas-guide ol').listStyleType).toBe('decimal');
        expect(style('.atlas-guide .ref-list').listStyleType).toBe('none');
        expect(style('.atlas-guide ul:not(.ref-list)').paddingLeft).toBe('40px');
        expect(style('.atlas-guide ol').paddingLeft).toBe('40px');
        expect(style('.atlas-guide ul:not(.ref-list) li').marginTop).toBe('0px');
        expect(style('.atlas-guide ul:not(.ref-list) li').marginBottom).toBe('0px');
        expect(style('.atlas-guide .ref-list li').marginTop).toBe('0px');
        expect(style('.atlas-guide .ref-list li').marginBottom).toBe('0px');
        expect(style('.sidebar').position).toBe(width > 900 ? 'sticky' : 'fixed');
        expect(style('.sidebar').visibility).toBe(width > 900 ? 'visible' : 'hidden');
      } finally { await isolated.happyDOM.close(); }
    }
  });

  test('uses native elements so global MDX list and table overrides do not alter the guide', async () => {
    const { E } = await import(new URL('./GuideElements.tsx', import.meta.url).href);
    const { container } = render(createElement(E.ul, {}, createElement(E.li, {}, '項目')));
    expect(container.innerHTML).toBe('<ul><li>項目</li></ul>');
  });

  sourceTest('retains all four definitions, accessible descriptions and original palette with readable typography', async () => {
    const { diagrams } = await import(new URL('./diagrams.ts', import.meta.url).href);
    const { diagramConfig } = await import(new URL('./MermaidDiagram.tsx', import.meta.url).href);
    expect(Object.entries(diagrams)).toEqual([...definitions]);
    expect(diagramConfig).toMatchObject({ startOnLoad: false, theme: 'base', securityLevel: 'strict', htmlLabels: false, flowchart: { curve: 'linear', htmlLabels: false, useMaxWidth: false, nodeSpacing: 45, rankSpacing: 45 }, themeVariables: { primaryColor: '#5b21b6', secondaryColor: '#115e59', edgeLabelBackground: '#1f1f28', fontSize: '18px', darkMode: true, textColor: '#f8fafc' } });
    for (const definition of Object.values(diagrams) as string[]) expect(definition).toMatch(/accTitle:.*\n\s*accDescr:/);
  });

  sourceTest('renders unique accessible SVG targets at their intrinsic size and exposes source text', async () => {
    const { MermaidDiagram } = await import(new URL('./MermaidDiagram.tsx', import.meta.url).href);
    const ids: string[] = [];
    const source = definitions.get('structure')!;
    const renderer = async (id: string) => { ids.push(id); return { svg: '<svg viewBox="0 0 100 50" aria-label="図1"></svg>' }; };
    const { container } = render(createElement('div', {}, createElement(MermaidDiagram, { id: 'structure', source, renderer }), createElement(MermaidDiagram, { id: 'structure', source, renderer })));
    await waitFor(() => expect(container.querySelectorAll('svg')).toHaveLength(2));
    expect(new Set(ids).size).toBe(2);
    expect(container.querySelector('[role="img"]')).toHaveAttribute('aria-label', '図1 ATLASのデータモデル');
    expect(container.querySelector('svg')?.style.maxWidth).toBe('none');
    expect(container.querySelector('svg')?.style.width).toBe('100px');
    expect(container.querySelector('svg')?.style.height).toBe('auto');
    expect(container.querySelector('svg')?.getAttribute('viewBox')).toBe('0 0 100 50');
    expect(container.querySelector('pre')?.textContent).toBe(source);
  });

  sourceTest('keeps a wide diagram at its natural width inside a keyboard-accessible scroll region and retains its title and description', async () => {
    const { MermaidDiagram } = await import(new URL('./MermaidDiagram.tsx', import.meta.url).href);
    const source = definitions.get('lifecycle')!;
    const renderer = async () => ({ svg: '<svg viewBox="0 0 1800 420" width="100%" height="420" style="max-width:100%"><text>Reconnaissance 偵察</text></svg>' });
    const result = render(createElement(MermaidDiagram, { id: 'lifecycle', source, renderer }));
    await waitFor(() => expect(result.container.querySelector('svg')).not.toBeNull());
    const svg = result.container.querySelector('svg')!;
    expect(svg.style.width).toBe('1800px');
    expect(svg.style.maxWidth).toBe('none');
    expect(svg.getAttribute('width')).toBeNull();
    expect(svg.getAttribute('height')).toBeNull();
    expect(svg.getAttribute('viewBox')).toBe('0 0 1800 420');
    const viewport = svg.closest('.diagram-viewport')!;
    expect(viewport).toHaveAttribute('tabindex', '0');
    expect(viewport).toHaveAttribute('role', 'img');
    expect(viewport).toHaveAttribute('aria-label', '図2 攻撃者ライフサイクル');
    const descriptionId = viewport.getAttribute('aria-describedby')!;
    expect(result.container.querySelector(`[id="${descriptionId}"]`)).toHaveTextContent('16のTactics');
  });

  test('sets explicit high-contrast text for nodes, subgraphs and edge labels without relying on Mermaid defaults', async () => {
    const { diagramConfig } = await import(new URL('./MermaidDiagram.tsx', import.meta.url).href);
    const theme = diagramConfig.themeVariables;
    const luminance = (hex: string) => {
      const rgb = hex.slice(1).match(/../g)!.map((channel: string) => parseInt(channel, 16) / 255).map((n: number) => n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4);
      return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
    };
    for (const [foreground, background] of [['primaryTextColor', 'primaryColor'], ['secondaryTextColor', 'secondaryColor'], ['tertiaryTextColor', 'tertiaryColor'], ['nodeTextColor', 'mainBkg'], ['titleColor', 'clusterBkg'], ['textColor', 'edgeLabelBackground']]) {
      expect(theme[foreground], foreground).toBe('#f8fafc');
      const a = luminance(theme[foreground]), b = luminance(theme[background]);
      expect((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05), `${foreground}/${background}`).toBeGreaterThanOrEqual(7);
    }
    expect(diagramConfig.fontFamily).toContain('Hiragino Sans');
  });

  test('scrolls only the graphic, leaves the caption and description in normal flow and avoids CSS shrinking', () => {
    const css = postcss.parse(readFileSync(resolve(here, 'mitre-atlas.css'), 'utf8'));
    expect(declarations(css, `${scope} .diagram-viewport`).get('overflow-x')).toBe('auto');
    expect(declarations(css, `${scope} .diagram-viewport`).get('max-width')).toBe('100%');
    expect(declarations(css, `${scope} .mermaid-diagram svg`).get('max-width')).toBe('none');
    for (const selector of ['.diagram-caption', '.diagram-accessible-description']) {
      expect(declarations(css, `${scope} ${selector}`).get('font-size')).toBe('14px');
      expect(declarations(css, `${scope} ${selector}`).get('color')).toBe('#cbd5e1');
    }
    expect(declarations(css, `${scope} .diagram-viewport:focus-visible`).get('outline')).toBe('2px solid var(--color-text-info)');
  });

  test('shows failed rendering with the original error text and ignores stale results or failures', async () => {
    const { MermaidDiagram } = await import(new URL('./MermaidDiagram.tsx', import.meta.url).href);
    const error = spyOn(console, 'error').mockImplementation(() => {});
    try {
      const failed = render(createElement(MermaidDiagram, { id: 'jailbreak', source: 'broken', renderer: async () => { throw new Error('broken'); } }));
      await waitFor(() => expect(failed.getByRole('alert')).toHaveTextContent('図の描画に失敗しました (jailbreak)'));
      failed.unmount(); error.mockClear();
      let old!: (out: { svg: string }) => void; let obsolete!: (e: Error) => void; let count = 0;
      const renderer = () => ++count === 1 ? new Promise<{ svg: string }>(resolve => { old = resolve; }) : new Promise<{ svg: string }>((_, reject) => { obsolete = reject; });
      const result = render(createElement(MermaidDiagram, { id: 'structure', source: 'old', renderer }));
      result.rerender(createElement(MermaidDiagram, { id: 'structure', source: 'new', renderer }));
      await act(async () => old({ svg: '<div>not SVG</div>' }));
      expect(result.container.querySelector('svg')).toBeNull();
      result.unmount(); await act(async () => obsolete(new Error('stale')));
      expect(error).not.toHaveBeenCalled();
    } finally { error.mockRestore(); }
  });

  sourceTest('preserves the thirteen grouped links from the source sidebar', async () => {
    const { GuideSidebar } = await import(new URL('./GuideSidebar.tsx', import.meta.url).href);
    const { toc } = await import(new URL('./toc.ts', import.meta.url).href);
    const { container } = render(createElement('div', { className: 'atlas-guide' }, createElement(GuideSidebar, { groups: toc })));
    expect([...container.querySelectorAll('nav a')].map(el => [el.textContent?.trim(), el.getAttribute('href')])).toEqual([...sourceDocument.querySelectorAll('aside nav a')].map(el => [el.textContent?.trim(), el.getAttribute('href')]));
  });

  test('groups the sidebar links and closes the mobile drawer on Escape, backdrop, link and desktop resize', async () => {
    const { GuideSidebar } = await import(new URL('./GuideSidebar.tsx', import.meta.url).href);
    const { toc } = await import(new URL('./toc.ts', import.meta.url).href);
    window.history.replaceState(null, '', '#sec8');
    const { container, getByRole } = render(createElement('div', { className: 'atlas-guide' }, createElement(GuideSidebar, { groups: toc })));
    expect([...container.querySelectorAll('.nav-section-title')].map(el => el.textContent)).toEqual(['基礎', '戦術と技術', '防御と事例', '実践']);
    await waitFor(() => expect(container.querySelector('[aria-current="location"]')).toHaveAttribute('href', '#sec8'));
    const button = getByRole('button', { name: '目次を開く' });
    const open = () => { fireEvent.click(button); expect(button).toHaveAttribute('aria-expanded', 'true'); };
    open(); fireEvent.keyDown(document, { key: 'Escape' }); expect(button).toHaveAttribute('aria-expanded', 'false'); expect(document.activeElement).toBe(button);
    open(); fireEvent.click(getByRole('button', { name: '目次を閉じる背景' })); expect(button).toHaveAttribute('aria-expanded', 'false');
    open(); fireEvent.click(container.querySelector('a[href="#sec3"]')!); expect(button).toHaveAttribute('aria-expanded', 'false');
    open(); window.innerWidth = 1000; fireEvent(window, new Event('resize')); expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(document.body.style.overflow).toBe('');
  });

  test('wraps mobile keyboard focus and restores prior scroll state on unmount', async () => {
    const { GuideSidebar } = await import(new URL('./GuideSidebar.tsx', import.meta.url).href);
    const { toc } = await import(new URL('./toc.ts', import.meta.url).href);
    document.body.style.overflow = 'scroll';
    try {
      const result = render(createElement('div', { className: 'atlas-guide' }, createElement(GuideSidebar, { groups: toc })));
      fireEvent.click(result.getByRole('button', { name: '目次を開く' }));
      const links = [...result.container.querySelectorAll<HTMLAnchorElement>('nav a')];
      expect(document.activeElement).toBe(links[0]);
      fireEvent.keyDown(document, { key: 'Tab', shiftKey: true }); expect(document.activeElement).toBe(links.at(-1)!);
      fireEvent.keyDown(document, { key: 'Tab' }); expect(document.activeElement).toBe(links[0]);
      result.unmount(); expect(document.body.style.overflow).toBe('scroll');
    } finally { document.body.style.overflow = ''; }
  });

  test('observes section changes and disconnects scroll tracking on unmount', async () => {
    const previous = globalThis.IntersectionObserver;
    let notify!: IntersectionObserverCallback; let disconnected = 0;
    class Observer { constructor(callback: IntersectionObserverCallback) { notify = callback; } observe() {} disconnect() { disconnected++; } }
    globalThis.IntersectionObserver = Observer as unknown as typeof IntersectionObserver;
    try {
      const { GuideSidebar } = await import(new URL('./GuideSidebar.tsx', import.meta.url).href);
      const { toc } = await import(new URL('./toc.ts', import.meta.url).href);
      const result = render(createElement('div', { className: 'atlas-guide' }, createElement(GuideSidebar, { groups: toc }), createElement('section', { id: 'sec2' })));
      act(() => notify([{ isIntersecting: true, target: result.container.querySelector('section'), boundingClientRect: { top: 10 } } as unknown as IntersectionObserverEntry], {} as IntersectionObserver));
      expect(result.container.querySelector('[aria-current="location"]')).toHaveAttribute('href', '#sec2');
      result.unmount(); expect(disconnected).toBe(1);
    } finally { globalThis.IntersectionObserver = previous; }
  });
});
