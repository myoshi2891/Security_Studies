import { afterEach, describe, expect, test } from 'bun:test';
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createElement } from 'react';
import postcss from 'postcss';

afterEach(cleanup);
const here = import.meta.dir;
const source = readFileSync(resolve(here, '../../../../../Ccie-security-guide.html'), 'utf8');

describe('CCIE faithful display foundation', () => {
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
    expect(calls).toHaveLength(1);
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
