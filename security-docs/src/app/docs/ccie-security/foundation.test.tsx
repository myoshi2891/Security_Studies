import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { act, cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createElement } from 'react';
import postcss from 'postcss';

// happy-dom の IntersectionObserver は交差を通知しないため、既定では observe 直後に表示域へ入ったものとして扱う
const originalObserver = globalThis.IntersectionObserver;
class ImmediateObserver {
  constructor(private readonly callback: IntersectionObserverCallback) {}
  observe(target: Element) { this.callback([{ isIntersecting: true, target } as unknown as IntersectionObserverEntry], this as unknown as IntersectionObserver); }
  unobserve() {}
  disconnect() {}
  takeRecords() { return []; }
}
beforeEach(() => { globalThis.IntersectionObserver = ImmediateObserver as unknown as typeof IntersectionObserver; });
afterEach(() => { globalThis.IntersectionObserver = originalObserver; });
afterEach(cleanup);
const here = import.meta.dir;
const source = readFileSync(resolve(here, '../../../../../Ccie-security-guide.html'), 'utf8');

describe('CCIE faithful display foundation', () => {
  test('preserves every original Mermaid theme variable, including pie labels and borders', () => {
    const implementation = readFileSync(resolve(here, 'MermaidFigure.tsx'), 'utf8');
    const theme = source.match(/themeVariables:\{([^}]+)\}/)![1];
    for (const [, key, value] of theme.matchAll(/(\w+):'([^']*)'/g)) {
      const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      expect(implementation, key).toMatch(new RegExp(`\\b${key}:\\s*['"]${escaped}['"]`));
    }
  });
  test('preserves original marker, counter, color and responsive CSS contracts in an isolated scope', () => {
    const css = readFileSync(resolve(here, 'ccie-security.css'), 'utf8');
    const original = postcss.parse(source.match(/<style>([\s\S]*?)<\/style>/)![1]);
    const migrated = postcss.parse(css);
    const required = ['.section ul>li::before', '.section ol', '.section ol>li', '.section ol>li::before', '.callout.practice ul>li::before', '.callout.source ul>li::before', '.callout.note ul>li::before', '.check::before', '.check input:checked+.box', '.check:focus-within', '.table-wrap', '.code pre', '.ref-n'];
    for (const selector of required) {
      const expected: string[] = [];
      const actual: string[] = [];
      original.walkRules(selector, rule => { rule.walkDecls(d => { expected.push(`${d.prop}:${d.value}`); }); });
      migrated.walkRules(rule => {
        if (rule.selector === `.ccie-guide.ccie-guide ${selector}`) {
          rule.walkDecls(d => { actual.push(`${d.prop}:${d.value}`); });
        }
      });
      expect(actual, selector).toEqual(expected);
      expect(expected.length).toBeGreaterThan(0);
    }
    migrated.walkRules(rule => {
      expect(rule.selector.split(',').every(s => s.trim().startsWith('.ccie-guide.ccie-guide'))).toBe(true);
    });
    expect(css).toContain('(max-width:1024px)');
    expect(css).toContain('(prefers-reduced-motion:reduce)');
    expect(css).toContain('minmax(min(260px,100%),1fr)');
  });

  test('stacks the diagram description below the SVG and scrolls only the graphic horizontally', () => {
    const migrated = postcss.parse(readFileSync(resolve(here, 'ccie-security.css'), 'utf8'));
    const decls = (selector: string) => {
      const found = new Map<string, string>();
      migrated.walkRules(rule => {
        if (rule.selector === `.ccie-guide.ccie-guide ${selector}`) rule.walkDecls(d => { found.set(d.prop, d.value); });
      });
      return found;
    };
    const figure = decls('.diagram');
    expect(figure.get('flex-direction')).toBe('column');
    expect(figure.get('overflow-x')).not.toBe('auto');
    expect(decls('.diagram [role="img"]').get('overflow-x')).toBe('auto');
  });

  test('defers Mermaid rendering until the figure nears the viewport and disconnects on unmount', async () => {
    const { MermaidFigure } = await import(new URL('./MermaidFigure.tsx', import.meta.url).href);
    let notify: IntersectionObserverCallback | undefined;
    let options: IntersectionObserverInit | undefined;
    let disconnected = 0;
    class ControlledObserver {
      constructor(cb: IntersectionObserverCallback, init?: IntersectionObserverInit) { notify = cb; options = init; }
      observe() {}
      unobserve() {}
      disconnect() { disconnected += 1; }
      takeRecords() { return []; }
    }
    globalThis.IntersectionObserver = ControlledObserver as unknown as typeof IntersectionObserver;
    const calls: string[] = [];
    const renderer = async (id: string) => { calls.push(id); return { svg: '<svg viewBox="0 0 10 10"></svg>' }; };
    const { container, unmount } = render(createElement(MermaidFigure, { id: 3, source: 'flowchart LR\nA-->B', renderer }));

    expect(calls).toHaveLength(0);
    expect(options?.rootMargin).toBeTruthy();
    const figure = container.querySelector('figure');
    if (!figure || !notify) throw new Error('observer was not attached to the figure');
    const callback = notify;
    act(() => callback([{ isIntersecting: true, target: figure } as unknown as IntersectionObserverEntry], {} as IntersectionObserver));
    await waitFor(() => expect(calls).toHaveLength(1));

    unmount();
    expect(disconnected).toBeGreaterThan(0);
  });

  test('keeps intrinsic elements independent of shared MDX element overrides', async () => {
    const moduleUrl = new URL('./GuideElements.tsx', import.meta.url).href;
    const { E } = await import(moduleUrl);
    const { container } = render(createElement(E.ul, {}, createElement(E.li, {}, '項目')));
    expect(container.innerHTML).toBe('<ul><li>項目</li></ul>');
  });

  test('renders Mermaid SVG with a unique accessible figure', async () => {
    const { MermaidFigure } = await import(new URL('./MermaidFigure.tsx', import.meta.url).href);
    const calls: string[] = [];
    const renderer = async (id: string) => { calls.push(id); return { svg: '<svg viewBox="0 0 100 50"><text>接続</text></svg>' }; };
    const { container } = render(createElement(MermaidFigure, { id: 0, source: 'flowchart LR\nA-->B', renderer }));
    await waitFor(() => expect(container.querySelector('svg')).not.toBeNull());
    expect(container.querySelector('figure')).toHaveAttribute('data-d', '0');
    expect(container.querySelector('[role="img"]')).toHaveAttribute('aria-label', '図 1');
    expect(container.querySelector('svg')).toHaveAttribute('viewBox', '0 0 100 65');
    expect(container.querySelector('svg')?.style.maxWidth).toBe('100%');
    expect(calls).toHaveLength(1);
  });

  test('links a content-specific text description to a successfully rendered diagram', async () => {
    const { MermaidFigure } = await import(new URL('./MermaidFigure.tsx', import.meta.url).href);
    const renderer = async () => ({ svg: '<svg viewBox="0 0 10 10"></svg>' });
    const { container, getByText } = render(createElement(MermaidFigure, { id: 5, source: 'flowchart LR\nA["開始<br/>入口"] --> B["終了"]', renderer }));
    await waitFor(() => expect(container.querySelector('svg')).not.toBeNull());
    const descriptionId = container.querySelector('[role="img"]')?.getAttribute('aria-describedby');
    expect(descriptionId).toBeTruthy();
    const description = container.querySelector(`[id="${descriptionId}"]`);
    expect(description).toHaveTextContent('開始 入口');
    expect(description).toHaveTextContent('終了');
    expect(getByText('図 6 のテキスト説明')).toBeInTheDocument();
    expect(container.querySelector('[role="alert"]')).toBeNull();
  });

  test('describes flowchart, pie and sequence definitions by their content', async () => {
    const { describeDiagram } = await import(new URL('./MermaidFigure.tsx', import.meta.url).href);
    expect(describeDiagram('pie showData\ntitle 配点\n"Domain 1" : 20\n"Domain 2" : 80')).toEqual(['円グラフ: 配点', 'Domain 1: 20', 'Domain 2: 80']);
    expect(describeDiagram('sequenceDiagram\nparticipant C as クライアント\nparticipant S as サーバ\nC->>S: 要求\nS-->>C: 応答')).toEqual(['シーケンス図: クライアント、サーバ', 'クライアント → サーバ: 要求', 'サーバ → クライアント: 応答']);
    expect(describeDiagram('flowchart TD\nA["入口"] -->|"検査"| B["出口"]')).toEqual(['フローチャート', '入口', '検査', '出口']);
  });

  test('gives every original diagram a non-empty description', async () => {
    const { describeDiagram } = await import(new URL('./MermaidFigure.tsx', import.meta.url).href);
    const { diagrams } = await import(new URL('./diagrams.ts', import.meta.url).href);
    const entries = Object.entries(diagrams as Record<string, string>);
    expect(entries).toHaveLength(61);
    for (const [key, definition] of entries) {
      expect((describeDiagram(definition) as string[]).length, key).toBeGreaterThan(1);
    }
  });

  test('does not reuse render identifiers across figures', async () => {
    const { MermaidFigure } = await import(new URL('./MermaidFigure.tsx', import.meta.url).href);
    const ids: string[] = [];
    const renderer = async (id: string) => { ids.push(id); return { svg: '<svg viewBox="0 0 10 10"></svg>' }; };
    render(createElement('div', {}, createElement(MermaidFigure, { id: 1, source: 'flowchart LR\nA-->B', renderer }), createElement(MermaidFigure, { id: 2, source: 'flowchart LR\nB-->C', renderer })));
    await waitFor(() => expect(ids).toHaveLength(2));
    expect(new Set(ids).size).toBe(2);
  });

  test('reports failure with the original definition instead of an empty diagram', async () => {
    const { MermaidFigure } = await import(new URL('./MermaidFigure.tsx', import.meta.url).href);
    const renderer = async () => { throw new Error('parse failure'); };
    const { findByRole, getByText } = render(createElement(MermaidFigure, { id: 2, source: 'invalid definition', renderer }));
    expect(await findByRole('alert')).toHaveTextContent('図 3 を描画できませんでした');
    fireEvent.click(getByText('図の定義'));
    expect(getByText('invalid definition')).toBeInTheDocument();
  });

  test('ignores stale async results after a definition changes', async () => {
    const { MermaidFigure } = await import(new URL('./MermaidFigure.tsx', import.meta.url).href);
    let finishFirst!: (value: { svg: string }) => void;
    const renderer = async (_id: string, code: string) => code === 'old'
      ? new Promise<{ svg: string }>(r => { finishFirst = r; })
      : { svg: '<svg><text>new</text></svg>' };
    const props = { id: 4, source: 'old', renderer };
    const { rerender, container } = render(createElement(MermaidFigure, props));
    await waitFor(() => expect(finishFirst).toBeDefined());
    rerender(createElement(MermaidFigure, { ...props, source: 'new' }));
    await waitFor(() => expect(container.querySelector('svg')?.textContent).toBe('new'));
    finishFirst({ svg: '<svg><text>old</text></svg>' });
    await new Promise(r => setTimeout(r, 0));
    expect(container.querySelector('svg')?.textContent).toBe('new');
  });
});
