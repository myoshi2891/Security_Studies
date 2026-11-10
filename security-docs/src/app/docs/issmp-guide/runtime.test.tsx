import { afterEach, expect, spyOn, test } from 'bun:test';
import { createElement } from 'react';
import { act, cleanup, render, waitFor } from '@testing-library/react';

afterEach(() => {
  cleanup();
  window.history.replaceState(null, '', '/');
});

test('print descriptions exist offscreen, during rendering and with interactive details closed',async()=>{
 const {MermaidFigure}=await import('./MermaidFigure');
 const saved=globalThis.IntersectionObserver;let notify:IntersectionObserverCallback|undefined;
 globalThis.IntersectionObserver=class{constructor(callback:IntersectionObserverCallback){notify=callback;}observe(){}disconnect(){}} as unknown as typeof IntersectionObserver;
 try{
  let finish:((result:{svg:string})=>void)|undefined,calls=0;
  const renderer=()=>{calls++;return new Promise<{svg:string}>(resolve=>{finish=resolve;});};
  const view=render(createElement(MermaidFigure,{id:'d1',source:'flowchart LR\nA["入力"] --> B["出力"]',renderer}));
  const fallback=()=>view.container.querySelector('.diagram-print-description')!;
  expect(calls).toBe(0);expect(fallback()).toHaveTextContent('入力 → 出力');expect(fallback().closest('details')).toBeNull();
  expect(view.container.querySelector('.diagram-description')).toBeNull();
  act(()=>notify!([{isIntersecting:true} as IntersectionObserverEntry],{} as IntersectionObserver));
  expect(calls).toBe(1);expect(fallback()).toHaveTextContent('入力 → 出力');
  await act(async()=>finish!({svg:'<svg viewBox="0 0 200 80"></svg>'}));
  expect(view.container.querySelector('.diagram-description')).not.toHaveAttribute('open');expect(fallback()).toHaveTextContent('入力 → 出力');
 }finally{globalThis.IntersectionObserver=saved;}
});

test('Mermaid retains unique IDs and intrinsic size, exposes failure definitions and ignores stale results', async () => {
  const { MermaidFigure } = await import(new URL('./MermaidFigure.tsx', import.meta.url).href);
  const original = globalThis.IntersectionObserver;
  globalThis.IntersectionObserver = undefined as unknown as typeof IntersectionObserver;
  const messages = spyOn(console, 'error').mockImplementation(() => {});
  try {
    const ids: string[] = [];
    const renderer = async (id: string) => {
      ids.push(id);
      return { svg: '<svg viewBox="0 0 1800 300" width="100%" style="max-width:100%"><text>図</text></svg>' };
    };
    const view = render(
      createElement(
        'div',
        {},
        createElement(MermaidFigure, { id: 'd1', source: 'flowchart TD\nA-->B', renderer }),
        createElement(MermaidFigure, { id: 'd2', source: 'flowchart LR\nA-->B', renderer }),
      ),
    );
    await waitFor(() => expect(view.container.querySelectorAll('svg')).toHaveLength(2));
    expect(new Set(ids).size).toBe(2);
    expect(view.container.querySelector('svg')!.style.width).toBe('1800px');
    expect(view.container.querySelector('svg')!.style.maxWidth).toBe('none');
    expect(view.container.querySelector('.diagram-viewport')).toHaveAttribute('tabindex', '0');
    let finish: ((value: { svg: string }) => void) | undefined;
    const deferred = () =>
      new Promise<{ svg: string }>(resolve => {
        finish = resolve;
      });
    const pending = render(createElement(MermaidFigure, { id: 'd1', source: 'old', renderer: deferred }));
    pending.rerender(
      createElement(MermaidFigure, {
        id: 'd1',
        source: 'new',
        renderer: async () => {
          throw new Error('broken');
        },
      }),
    );
    await waitFor(() => expect(pending.container.querySelector('[role="alert"]')).not.toBeNull());
    expect(pending.container.querySelector('pre')).toHaveTextContent('new');
    await act(async () => finish!({ svg: '<svg viewBox="0 0 10 10"></svg>' }));
    expect(pending.container.querySelector('svg')).toBeNull();
  } finally {
    globalThis.IntersectionObserver = original;
    messages.mockRestore();
  }
});

test('sequence diagrams retain their original 110px sequence clearance and accept comma-separated viewBox values', async () => {
  const { MermaidFigure } = await import(new URL('./MermaidFigure.tsx', import.meta.url).href);
  const original = globalThis.IntersectionObserver;
  globalThis.IntersectionObserver = undefined as unknown as typeof IntersectionObserver;
  try {
    const view = render(
      createElement(MermaidFigure, {
        id: 'd7',
        source: 'sequenceDiagram\nF->>D: request',
        renderer: async () => ({ svg: '<svg viewBox="0,0,900,300" width="100%" height="300"></svg>' }),
      }),
    );
    await waitFor(() => expect(view.container.querySelector('svg')).not.toBeNull());
    const svg = view.container.querySelector('svg')!;
    expect(svg.getAttribute('viewBox')).toBe('0 0 900 410');
    expect(svg.style.width).toBe('900px');
    expect(svg.hasAttribute('height')).toBe(false);
  } finally {
    globalThis.IntersectionObserver = original;
  }
});

test('lazy diagrams wait for intersection, disconnect observers and support retries after engine loading fails', async () => {
  const { MermaidFigure, createEngineLoader } = await import(new URL('./MermaidFigure.tsx', import.meta.url).href);
  const saved = globalThis.IntersectionObserver;
  let notify: IntersectionObserverCallback | undefined;
  let disconnected = 0;
  globalThis.IntersectionObserver = class {
    constructor(cb: IntersectionObserverCallback) {
      notify = cb;
    }
    observe() {}
    disconnect() {
      disconnected++;
    }
  } as unknown as typeof IntersectionObserver;
  try {
    let calls = 0;
    const renderer = async () => {
      calls++;
      return { svg: '<svg viewBox="0 0 200 80"></svg>' };
    };
    const view = render(createElement(MermaidFigure, { id: 'd1', source: 'flowchart TD\nA-->B', renderer }));
    expect(calls).toBe(0);
    act(() => notify!([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver));
    await waitFor(() => expect(view.container.querySelector('svg')).not.toBeNull());
    expect(calls).toBe(1);
    view.unmount();
    expect(disconnected).toBeGreaterThan(0);
    let loads = 0;
    const load = createEngineLoader(async () => {
      loads++;
      if (loads === 1) throw new Error('retry');
      return 'engine';
    });
    await expect(load()).rejects.toThrow('retry');
    expect(await load()).toBe('engine');
    expect(await load()).toBe('engine');
    expect(loads).toBe(2);
  } finally {
    globalThis.IntersectionObserver = saved;
  }
});

test('a failed diagram offers a retry button that re-runs rendering and shows the diagram on success', async () => {
  const { MermaidFigure } = await import(new URL('./MermaidFigure.tsx', import.meta.url).href);
  const original = globalThis.IntersectionObserver;
  globalThis.IntersectionObserver = undefined as unknown as typeof IntersectionObserver;
  const messages = spyOn(console, 'error').mockImplementation(() => {});
  try {
    let calls = 0;
    const renderIds: string[] = [];
    const renderer = async (renderId: string) => {
      calls++;
      renderIds.push(renderId);
      if (calls === 1) throw new Error('engine load failed');
      return { svg: '<svg viewBox="0 0 10 10"></svg>' };
    };
    const view = render(createElement(MermaidFigure, { id: 'd3', source: 'flowchart TD\nA-->B', renderer }));
    await waitFor(() => expect(view.container.querySelector('[role="alert"]')).not.toBeNull());
    expect(view.container.querySelector('pre')).toHaveTextContent('A-->B');
    const retry = [...view.container.querySelectorAll('button')].find(b => b.textContent?.includes('再試行'));
    expect(retry).toBeDefined();
    await act(async () => {
      retry!.click();
    });
    await waitFor(() => expect(view.container.querySelector('svg')).not.toBeNull());
    expect(calls).toBe(2);
    // 再試行のたびに別の ID を渡し、前回の描画が残した一時要素と衝突させない
    expect(new Set(renderIds).size).toBe(2);
    expect(view.container.querySelector('[role="alert"]')).toBeNull();
  } finally {
    globalThis.IntersectionObserver = original;
    messages.mockRestore();
  }
});

test('a failed diagram still shows its text description alongside the error and definition', async () => {
  const { MermaidFigure } = await import(new URL('./MermaidFigure.tsx', import.meta.url).href);
  const original = globalThis.IntersectionObserver;
  globalThis.IntersectionObserver = undefined as unknown as typeof IntersectionObserver;
  const messages = spyOn(console, 'error').mockImplementation(() => {});
  try {
    const view = render(
      createElement(MermaidFigure, {
        id: 'd4',
        source: 'flowchart LR\nA["入力"] --> B["出力"]',
        renderer: async () => {
          throw new Error('broken');
        },
      }),
    );
    await waitFor(() => expect(view.container.querySelector('[role="alert"]')).not.toBeNull());
    expect(view.container.querySelector('svg')).toBeNull();
    expect(view.container.querySelector('pre')).toHaveTextContent('A["入力"]');
    const description = view.container.querySelector('.diagram-description');
    expect(description).not.toBeNull();
    expect([...description!.querySelectorAll('li')].map(li => li.textContent)).toEqual(['フローチャート', '入力 → 出力']);
  } finally {
    globalThis.IntersectionObserver = original;
    messages.mockRestore();
  }
});

test('diagram text descriptions resolve quoted node labels across edges, chains and isolated nodes', async () => {
  const { describeDiagram } = await import(new URL('./MermaidFigure.tsx', import.meta.url).href);
  expect(
    describeDiagram('flowchart TD\nA["開始<br/>入力"] --> B{"判定"}\nB -- "はい" --> C("完了")\nB -->|"いいえ"| A\nC <--> E\nD["孤立"]'),
  ).toEqual(['フローチャート', '開始 入力 → 判定', '判定 → 完了: はい', '判定 → 開始 入力: いいえ', '完了 ↔ E', '孤立']);
  expect(describeDiagram('sequenceDiagram\nA->>B: 要求<br/>送信')).toEqual(['シーケンス図', 'A->>B: 要求 送信']);
});

test('diagram text descriptions read labels from stadium and cylinder nodes instead of node IDs', async () => {
  const { describeDiagram } = await import(new URL('./MermaidFigure.tsx', import.meta.url).href);
  expect(describeDiagram('flowchart LR\nAPI(["APIサーバー"]) --> DB[("顧客DB")]')).toEqual(['フローチャート', 'APIサーバー → 顧客DB']);
  expect(describeDiagram('flowchart LR\nDB[("顧客DB")]\nAPI(["APIサーバー"]) -->|"読み取り"| DB')).toEqual([
    'フローチャート',
    'APIサーバー → 顧客DB: 読み取り',
  ]);
});

test('state diagram descriptions mark [*] as start or end, keep transition labels and pass through non-transition lines', async () => {
  const { describeDiagram } = await import(new URL('./MermaidFigure.tsx', import.meta.url).href);
  expect(
    describeDiagram('stateDiagram-v2\n[*] --> Draft\nDraft --> Approved: 審査<br/>完了\nApproved --> [*]\nstate Approved {\n}'),
  ).toEqual(['ステート図', '[*]（開始） → Draft', 'Draft → Approved: 審査 完了', 'Approved → [*]（終了）', 'state Approved {', '}']);
});


test('live SVG sizing extends the viewBox only to the measured drawing bounds', async () => {
  const { fitDiagram } = await import(new URL('./MermaidFigure.tsx', import.meta.url).href);
  const holder = document.createElement('div');
  holder.innerHTML = '<svg viewBox="0 0 900 300"></svg>';
  const svg = holder.querySelector('svg')!;
  Object.defineProperty(svg, 'getBBox', { configurable: true, value: () => ({ x: 0, y: 10, width: 900, height: 340 }) });
  fitDiagram(svg);
  expect(svg.getAttribute('viewBox')).toBe('0 0 900 366');
  Object.defineProperty(svg, 'getBBox', { configurable: true, value: () => ({ x: 0, y: 0, width: 900, height: 200 }) });
  fitDiagram(svg);
  expect(svg.getAttribute('viewBox')).toBe('0 0 900 366');
  Object.defineProperty(svg, 'getBBox', {
    configurable: true,
    value: () => {
      throw new Error('unavailable');
    },
  });
  expect(() => fitDiagram(svg)).not.toThrow();
});

test('the default renderer passes this guide configuration per render without re-initializing the shared engine', async () => {
  const { default: mermaid } = await import('mermaid');
  const { renderDiagram, diagramConfig } = await import(new URL('./MermaidFigure.tsx', import.meta.url).href);
  const draw = spyOn(mermaid, 'render').mockImplementation(async () => ({ svg: '<svg></svg>', diagramType: 'flowchart-v2' }));
  const init = spyOn(mermaid, 'initialize');
  try {
    expect(await renderDiagram('exploitation-d1', 'flowchart TD\nA-->B')).toEqual({ svg: '<svg></svg>', diagramType: 'flowchart-v2' });
    expect(init).not.toHaveBeenCalled();
    expect(draw).toHaveBeenCalledWith('exploitation-d1', `---\nconfig: ${JSON.stringify(diagramConfig)}\n---\nflowchart TD\nA-->B`);
  } finally {
    draw.mockRestore();
    init.mockRestore();
  }
}, 20000);

test('all 34 exact definitions parse including flowchart and sequence diagrams', async () => {
  const { diagrams } = await import('./diagrams');
  const { default: mermaid } = await import('mermaid');
  expect(Object.keys(diagrams)).toHaveLength(34);
  for (const definition of Object.values(diagrams)) {
    expect(await mermaid.parse(definition)).toBeTruthy();
  }
}, 20000);

test('lazy engine loader disables Mermaid auto-start on the shared instance without initializing it', async () => {
  const { default: mermaid } = await import('mermaid');
  const { renderDiagram } = await import(new URL('./MermaidFigure.tsx', import.meta.url).href);
  const initialize = spyOn(mermaid, 'initialize');
  const render = spyOn(mermaid, 'render').mockResolvedValue({ svg: '<svg></svg>', diagramType: 'flowchart' });
  try {
    await renderDiagram('exploitation-auto-start', 'flowchart TD\nA-->B');
    expect(mermaid.startOnLoad).toBe(false);
    expect(initialize).not.toHaveBeenCalled();
    expect(render).toHaveBeenCalledTimes(1);
  } finally {
    initialize.mockRestore();
    render.mockRestore();
  }
});

test('figure label fallback keeps d-number IDs numeric and names other IDs without NaN', async () => {
  const { MermaidFigure } = await import(new URL('./MermaidFigure.tsx', import.meta.url).href);
  const original = globalThis.IntersectionObserver;
  globalThis.IntersectionObserver = undefined as unknown as typeof IntersectionObserver;
  try {
    for (const [id, expected] of [['d3', '図 3'], ['d12', '図 12'], ['dg-overflow', '図: overflow'], ['summary', '図: summary']]) {
      const view = render(createElement(MermaidFigure, { id, source: 'flowchart LR\nA-->B', renderer: async () => ({ svg: '<svg viewBox="0 0 10 10"></svg>' }) }));
      await waitFor(() => expect(view.container.querySelector('.diagram-viewport')).toHaveAttribute('aria-label', expected));
      expect(view.container.textContent).not.toContain('NaN');
      view.unmount();
    }
  } finally {
    globalThis.IntersectionObserver = original;
  }
});

test('only the rendered viewport is an image; the outer container keeps its description and retry controls exposed', async () => {
  const { MermaidFigure } = await import(new URL('./MermaidFigure.tsx', import.meta.url).href);
  const original = globalThis.IntersectionObserver;
  globalThis.IntersectionObserver = undefined as unknown as typeof IntersectionObserver;
  try {
    const view = render(createElement(MermaidFigure, { id: 'd1', source: 'flowchart LR\nA-->B', label: '図ラベル', renderer: async () => ({ svg: '<svg viewBox="0 0 10 10"></svg>' }) }));
    const figure = view.container.querySelector('.mermaid-target');
    expect(figure).not.toBeNull();
    expect(figure?.hasAttribute('role')).toBe(false);
    expect(figure?.hasAttribute('aria-label')).toBe(false);
    await waitFor(() => expect(view.container.querySelector('.diagram-viewport')).toHaveAttribute('role', 'img'));
    expect(view.container.querySelector('.diagram-viewport')).toHaveAttribute('aria-label', '図ラベル');
  } finally {
    globalThis.IntersectionObserver = original;
  }
});

test('failed and stale renders remove only their own temporary output from document.body, even after unmount', async () => {
  const { MermaidFigure } = await import(new URL('./MermaidFigure.tsx', import.meta.url).href);
  const original = globalThis.IntersectionObserver;
  globalThis.IntersectionObserver = undefined as unknown as typeof IntersectionObserver;
  const messages = spyOn(console, 'error').mockImplementation(() => {});
  // Mermaid は描画中に #d{id} / #i{id} を body 直下へ置き、構文エラーではこれを残したまま失敗する
  const temporary = (id: string) => {
    for (const prefix of ['d', 'i']) {
      const node = document.createElement('div');
      node.id = prefix + id;
      document.body.append(node);
    }
  };
  const leftovers = () => document.body.querySelectorAll(':scope > [id^="dissmp-mermaid-"], :scope > [id^="iissmp-mermaid-"]');
  const svg = { svg: '<svg viewBox="0 0 10 10"></svg>' };
  try {
    const failed = render(createElement(MermaidFigure, { id: 'd1', source: 'broken', renderer: async (id: string) => { temporary(id); throw new Error('parse'); } }));
    await waitFor(() => expect(failed.container.querySelector('[role="alert"]')).not.toBeNull());
    expect(leftovers()).toHaveLength(0);
    failed.unmount();

    const succeeded = render(createElement(MermaidFigure, { id: 'd2', source: 'a', renderer: async (id: string) => { temporary(id); return svg; } }));
    await waitFor(() => expect(succeeded.container.querySelector('svg')).not.toBeNull());
    expect(leftovers()).toHaveLength(0);
    succeeded.unmount();

    // 描画中の一時要素は Mermaid が使用中なので、アンマウント時点では取り除かず、完了時に片付ける
    let rejectLate: (reason: Error) => void = () => {};
    const unmounted = render(createElement(MermaidFigure, { id: 'd3', source: 'a', renderer: (id: string) => { temporary(id); return new Promise<{ svg: string }>((_, reject) => { rejectLate = reject; }); } }));
    await waitFor(() => expect(leftovers()).toHaveLength(2));
    unmounted.unmount();
    expect(leftovers()).toHaveLength(2);
    await act(async () => rejectLate(new Error('late')));
    expect(leftovers()).toHaveLength(0);

    const ids: string[] = [];
    let finishOld: (value: { svg: string }) => void = () => {};
    let finishNew: (value: { svg: string }) => void = () => {};
    const stale = render(createElement(MermaidFigure, { id: 'd4', source: 'old', renderer: (id: string) => { ids.push(id); temporary(id); return new Promise<{ svg: string }>(resolve => { finishOld = resolve; }); } }));
    await waitFor(() => expect(ids).toHaveLength(1));
    stale.rerender(createElement(MermaidFigure, { id: 'd4', source: 'new', renderer: (id: string) => { ids.push(id); temporary(id); return new Promise<{ svg: string }>(resolve => { finishNew = resolve; }); } }));
    await waitFor(() => expect(ids).toHaveLength(2));
    expect(new Set(ids).size).toBe(2);
    await act(async () => finishOld(svg));
    expect(document.getElementById('d' + ids[0])).toBeNull();
    expect(document.getElementById('d' + ids[1])).not.toBeNull();
    await act(async () => finishNew(svg));
    await waitFor(() => expect(stale.container.querySelector('svg')).not.toBeNull());
    expect(leftovers()).toHaveLength(0);
  } finally {
    for (const node of leftovers()) node.remove();
    globalThis.IntersectionObserver = original;
    messages.mockRestore();
  }
});
