import { afterEach, expect, mock, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { cleanup, render, waitFor } from '@testing-library/react';
import { definitions, sourceHtml, sourceTest } from './fidelity-helpers';
const observer = globalThis.IntersectionObserver;
afterEach(() => { cleanup(); globalThis.IntersectionObserver = observer; });
const load = () => import(new URL('./MermaidFigure.tsx', import.meta.url).href);

sourceTest('all 50 immutable diagram definitions pass the real bundled Mermaid parser', async () => {
  const { diagrams } = await import(new URL('./diagrams.ts', import.meta.url).href);
  expect(Object.entries(diagrams)).toEqual([...definitions]);
  expect(Object.keys(diagrams)).toHaveLength(50);
  const { default: mermaid } = await import('mermaid');
  mermaid.initialize({ startOnLoad: false, securityLevel: 'strict' });
  for (const [id, code] of definitions) expect(await mermaid.parse(code), id).toBeTruthy();
});
sourceTest('preserves every literal original Mermaid theme setting using strict local rendering', () => {
  const code = readFileSync(new URL('./MermaidFigure.tsx', import.meta.url), 'utf8');
  const theme = sourceHtml.match(/themeVariables:\s*\{([\s\S]*?)\n\s*\}/)![1];
  for (const [, key, value] of theme.matchAll(/(\w+):\s*'([^']*)'/g)) expect(code).toContain(`${key}: '${value}'`);
  expect(code).toContain("securityLevel: 'strict'");
  expect(code).toContain("import('mermaid')");
});
test('does not render before entering the viewport and disconnects its observer', async () => {
  const { MermaidFigure } = await load();
  let notify: IntersectionObserverCallback | undefined;
  let disconnected = 0;
  class ControlledObserver {
    constructor(cb: IntersectionObserverCallback) { notify = cb; }
    observe() {} unobserve() {} disconnect() { disconnected++; } takeRecords() { return []; }
  }
  globalThis.IntersectionObserver = ControlledObserver as unknown as typeof IntersectionObserver;
  let calls = 0;
  const renderer = async () => { calls++; return { svg: '<svg viewBox="0 0 200 80"></svg>' }; };
  const { container, unmount } = render(createElement(MermaidFigure, { id: 'd0', source: 'flowchart LR\nA-->B', renderer }));
  expect(calls).toBe(0);
  const { act } = await import('@testing-library/react');
  act(() => notify!([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver));
  await waitFor(() => expect(container.querySelector('svg')).not.toBeNull());
  expect(calls).toBe(1); unmount(); expect(disconnected).toBeGreaterThan(0);
});
test('gives diagrams unique accessible IDs, intrinsic SVG width and linked descriptions', async () => {
  globalThis.IntersectionObserver = undefined as unknown as typeof IntersectionObserver;
  const { MermaidFigure } = await load();
  const ids: string[] = [];
  const renderer = async (id: string) => { ids.push(id); return { svg: '<svg viewBox="0 0 200 80"></svg>' }; };
  const { container } = render(createElement('div', null, createElement(MermaidFigure, { id: 'd0', source: 'flowchart LR\nA["開始"]-->B["終了"]', renderer }), createElement(MermaidFigure, { id: 'd0', source: 'sequenceDiagram\nA->>B: hello', renderer })));
  await waitFor(() => expect(container.querySelectorAll('svg')).toHaveLength(2));
  expect(new Set(ids).size).toBe(2);
  expect([...container.querySelectorAll('svg')].map(svg => svg.getAttribute('viewBox'))).toEqual(['0 0 200 95', '0 0 200 190']);
  for (const svg of container.querySelectorAll('svg')) expect(svg.style.width).toBe('200px');
  for (const img of container.querySelectorAll('[role="img"]')) {
    expect(img.getAttribute('tabindex')).toBe('0');
    expect(container.querySelector(`[id="${img.getAttribute('aria-describedby')}"]`)).not.toBeNull();
  }
});
sourceTest('gives every archived diagram definition a non-empty content description', async () => {
  const { describeDiagram } = await load();
  for (const definition of definitions.values()) expect(describeDiagram(definition).length).toBeGreaterThan(1);
});
test('shows the exact original definition on failure rather than silently dropping a figure', async () => {
  globalThis.IntersectionObserver = undefined as unknown as typeof IntersectionObserver;
  const { MermaidFigure } = await load();
  const { findByRole, getByText } = render(createElement(MermaidFigure, { id: 'd7', source: 'invalid <source>', renderer: async () => { throw new Error('intentional renderer failure'); } }));
  expect(await findByRole('alert')).toHaveTextContent('図 8 を描画できませんでした');
  expect(getByText('invalid <source>')).toBeInTheDocument();
});
test('ignores stale asynchronous results and retries a failed engine import', async () => {
  globalThis.IntersectionObserver = undefined as unknown as typeof IntersectionObserver;
  const { MermaidFigure, createEngineLoader } = await load();
  let resolve!: (value: { svg: string }) => void;
  const renderer = async (_id: string, source: string) => source === 'old' ? new Promise<{ svg: string }>(r => { resolve = r; }) : { svg: '<svg><text>new</text></svg>' };
  const { container, rerender } = render(createElement(MermaidFigure, { id: 'd0', source: 'old', renderer }));
  await waitFor(() => expect(resolve).toBeDefined());
  rerender(createElement(MermaidFigure, { id: 'd0', source: 'new', renderer }));
  await waitFor(() => expect(container.querySelector('svg')?.textContent).toBe('new'));
  resolve({ svg: '<svg><text>old</text></svg>' });
  await new Promise(r => setTimeout(r, 0)); expect(container.querySelector('svg')?.textContent).toBe('new');
  let calls = 0;
  const engine = createEngineLoader(async () => { calls++; if (calls === 1) throw new Error('retry'); return 'engine'; });
  await expect(engine()).rejects.toThrow('retry'); expect(await engine()).toBe('engine'); expect(await engine()).toBe('engine'); expect(calls).toBe(2);
});
test('describes pie charts as a plain-text title followed by each labelled slice', async () => {
  const { describeDiagram } = await load();
  expect(describeDiagram('pie showData\n  title 攻撃<br/>経路の<b>割合</b>\n  "フィッシング" : 45\n  "マルウェア<br>感染":  30 \n  不正な行')).toEqual(['円グラフ: 攻撃 経路の割合', 'フィッシング: 45', 'マルウェア 感染: 30']);
  expect(describeDiagram('pie\n"A" : 1')).toEqual(['円グラフ: ', 'A: 1']);
  expect(describeDiagram('pie')).toEqual(['円グラフ: ']);
});
test('describes undirected dotted edges closed by .- with their labels (d44)', async () => {
  const { describeDiagram } = await load();
  const { diagrams } = await import(new URL('./diagrams.ts', import.meta.url).href);
  const lines: string[] = describeDiagram(diagrams.d44);
  expect(lines).toContain('攻撃者 Adversary — 被害者 Victim 組織・人・資産: 標的として狙う');
  expect(lines).toContain('能力 Capability マルウェア・攻撃手法 — インフラ Infrastructure C2 サーバー・ドメイン・IP: インフラ経由で配送');
  expect(describeDiagram('flowchart LR\nA -. "x" .- B\nC -. "y" .-> D')).toEqual(['フローチャート', 'A — B: x', 'C → D: y']);
});
test('initializes the bundled Mermaid engine once with the strict original theme and renders through it', async () => {
  // mock.module はプロセス全体に残るため、実モジュールを退避して finally で復元する（実パーサーのテストが共有する）
  const realMermaid = { ...(await import('mermaid')) };
  const initialize = mock((_config: Record<string, unknown>) => {});
  const renders: [string, string][] = [];
  mock.module('mermaid', () => ({ default: { initialize, render: async (id: string, code: string) => { renders.push([id, code]); return { svg: `<svg data-id="${id}"></svg>` }; } } }));
  try {
    const { renderDiagram } = await load();
    expect(await renderDiagram('first', 'flowchart LR\nA-->B')).toEqual({ svg: '<svg data-id="first"></svg>' });
    await renderDiagram('second', 'pie\n"A" : 1');
    expect(initialize).toHaveBeenCalledTimes(1);
    expect(initialize.mock.calls[0]?.[0]).toMatchObject({ startOnLoad: false, theme: 'base', securityLevel: 'strict', flowchart: { htmlLabels: true }, themeVariables: { fontSize: '16px', primaryColor: '#EEF1F8' } });
    expect(renders).toEqual([['first', 'flowchart LR\nA-->B'], ['second', 'pie\n"A" : 1']]);
  } finally { mock.module('mermaid', () => realMermaid); }
});
