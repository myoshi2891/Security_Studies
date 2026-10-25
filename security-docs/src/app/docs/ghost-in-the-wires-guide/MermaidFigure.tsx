'use client';

import { useEffect, useId, useRef, useState } from 'react';

export type DiagramRenderer = (id: string, source: string) => Promise<{ svg: string }>;
export interface MermaidFigureProps {
  id: string;
  source: string;
  label?: string;
  /** Optional renderer for isolated lifecycle tests; pages use the bundled Mermaid renderer. */
  renderer?: DiagramRenderer;
}

/** 読み込みを1回に共有しつつ、失敗時はキャッシュを破棄して呼び出し元へ伝播し、次回の描画で再試行させる */
export function createEngineLoader<T>(load: () => Promise<T>): () => Promise<T> {
  let cached: Promise<T> | undefined;
  return () => {
    cached ??= load().catch((error: unknown) => {
      cached = undefined;
      throw error;
    });
    return cached;
  };
}

// load イベントでの自動描画（mermaid.run）が .mermaid-target コンテナを書き換えないよう止める。initialize は呼ばず共有設定は変えない
const getEngine = createEngineLoader(() =>
  import('mermaid').then(({ default: mermaid }) => {
    mermaid.startOnLoad = false;
    return mermaid;
  }),
);

export const diagramConfig = {
  "theme": "dark",
  "fontFamily": "\"Hiragino Sans\",\"Noto Sans JP\",\"Yu Gothic\",\"Meiryo\",system-ui,sans-serif",
  "themeVariables": {
    "background": "#0d1b2e",
    "fontSize": "16px",
    "primaryColor": "#1b2b4a",
    "primaryTextColor": "#f3f5fa",
    "primaryBorderColor": "#7c9eff",
    "secondaryColor": "#13243d",
    "secondaryTextColor": "#f3f5fa",
    "secondaryBorderColor": "#3e5c8f",
    "tertiaryColor": "#0d1b2e",
    "tertiaryTextColor": "#f3f5fa",
    "tertiaryBorderColor": "#3e5c8f",
    "lineColor": "#93a1bd",
    "textColor": "#f3f5fa",
    "mainBkg": "#1b2b4a",
    "nodeBorder": "#7c9eff",
    "nodeTextColor": "#f3f5fa",
    "clusterBkg": "#13243d",
    "clusterBorder": "#3e5c8f",
    "titleColor": "#f3f5fa",
    "edgeLabelBackground": "#0d1b2e",
    "actorBkg": "#1b2b4a",
    "actorBorder": "#7c9eff",
    "actorTextColor": "#f3f5fa",
    "actorLineColor": "#93a1bd",
    "signalColor": "#c6d0e3",
    "signalTextColor": "#f3f5fa",
    "labelBoxBkgColor": "#13243d",
    "labelBoxBorderColor": "#7c9eff",
    "labelTextColor": "#f3f5fa",
    "loopTextColor": "#f3f5fa",
    "sequenceNumberColor": "#07111e",
    "noteBkgColor": "#2b2250",
    "noteBorderColor": "#a78bfa",
    "noteTextColor": "#f3f5fa",
    "activationBkgColor": "#13243d",
    "activationBorderColor": "#7c9eff",
    "cScale0": "#2d4f8f",
    "cScale1": "#1f6f6b",
    "cScale2": "#6b3f8f",
    "cScale3": "#8f4a3a",
    "cScale4": "#3b5fae",
    "cScale5": "#2a7f78",
    "cScale6": "#7a4aa0",
    "cScale7": "#a05a45",
    "cScale8": "#2d4f8f",
    "cScale9": "#1f6f6b",
    "cScale10": "#6b3f8f",
    "cScale11": "#8f4a3a",
    "cScaleLabel0": "#f3f5fa",
    "cScaleLabel1": "#f3f5fa",
    "cScaleLabel2": "#f3f5fa",
    "cScaleLabel3": "#f3f5fa",
    "cScaleLabel4": "#f3f5fa",
    "cScaleLabel5": "#f3f5fa",
    "cScaleLabel6": "#f3f5fa",
    "cScaleLabel7": "#f3f5fa",
    "cScaleLabel8": "#f3f5fa",
    "cScaleLabel9": "#f3f5fa",
    "cScaleLabel10": "#f3f5fa",
    "cScaleLabel11": "#f3f5fa"
  },
  "flowchart": {
    "useMaxWidth": false,
    "htmlLabels": true,
    "nodeSpacing": 45,
    "rankSpacing": 45,
    "curve": "basis"
  },
  "sequence": {
    "useMaxWidth": false,
    "wrap": false
  },
  "timeline": {
    "useMaxWidth": false
  }
} satisfies import('mermaid').MermaidConfig;

/** Per-render configuration keeps this guide's theme out of other routes' shared engine. */
export const renderDiagram: DiagramRenderer = async (id, source) => {
  await document.fonts?.ready;
  const config = diagramConfig;
  return (await getEngine()).render(id, `---\nconfig: ${JSON.stringify(config)}\n---\n${source}`);
};

function sizeSvg(svgMarkup: string, source: string) {
  const holder = document.createElement('div');
  holder.innerHTML = svgMarkup;
  const svg = holder.querySelector('svg');
  if (!svg) throw new Error('Mermaid returned no SVG');
  const box = (svg.getAttribute('viewBox') ?? '').trim().split(/[\s,]+/).map(Number);
  if (box.length === 4 && box.every(Number.isFinite)) {
    box[3] += /sequenceDiagram|stateDiagram/.test(source) ? 110 : 15;
    svg.setAttribute('viewBox', box.join(' '));
    svg.style.width = `${box[2]}px`;
  }
  svg.removeAttribute('width');
  svg.removeAttribute('height');
  // 幅の広い図は自然な px 幅のまま、コンテナの横スクロール（overflow-x: auto）で読ませる
  svg.style.maxWidth = 'none';
  svg.style.height = 'auto';
  svg.style.overflow = 'visible';
  return holder.innerHTML;
}

/** Match the original live drawing bounds instead of adding fixed sequence padding. */
export function fitDiagram(svg: SVGSVGElement): void {
  const box = (svg.getAttribute('viewBox') ?? '').trim().split(/[\s,]+/).map(Number);
  if (box.length !== 4 || !box.every(Number.isFinite) || typeof svg.getBBox !== 'function') return;
  try {
    const bounds = svg.getBBox();
    if (!Number.isFinite(bounds.y + bounds.height)) return;
    box[3] = Math.max(box[3], bounds.y + bounds.height + 16 - box[1]);
    svg.setAttribute('viewBox', box.join(' '));
  } catch {
    /* Preserve Mermaid's viewBox if geometry measurement is unavailable. */
  }
}

/** ラベル中の <br/> 等の HTML を読み上げ用のプレーンテキストに変換する */
const plain = (text: string) =>
  text
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();

/** 元ガイドの全9図から、ノードと接続のテキスト説明を生成する */
export function describeDiagram(source: string): string[] {
  const lines = source
    .trim()
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean);
  if (lines[0]?.startsWith('pie')) return ['円グラフ', ...lines.slice(1).map(plain)];
  if (lines[0] === 'sequenceDiagram') return ['シーケンス図', ...lines.slice(1).map(plain)];
  const edges = describeFlowchart(lines.slice(1));
  return ['フローチャート', ...(edges.length > 0 ? edges : lines.slice(1))];
}

/** `A["x"]` / `C{"x"}` / `B("x")` / スタジアム形 `S(["x"])` / 円柱形 `D[("x")]` のノード定義（ID とラベル） */
const NODE_PATTERN = /(\w+)\s*(?:\(\[|\[\(|\[\[?|\(\(?|\{\{?)"([^"]*)"(?:\]\)|\)\]|\]\]?|\)\)?|\}\}?)/g;
/**
 * ノード定義を ID に置換した行から接続を読み取る（連鎖 `A --> B --> C` は先読みで終点を消費しない）。
 */
const EDGE_PATTERN = /(\w+)\s*(<)?(?:--|-\.|==)(?:\s*"([^"]*)"\s*(?:--|\.-|==))?(-?>|-|(?<=\.-))\s*(?:\|"([^"]*)"\|)?\s*(?=(\w+))/g;

function describeFlowchart(body: string[]): string[] {
  const labels = new Map<string, string>();
  const edges: { from: string; to: string; arrow: string; label: string }[] = [];
  for (const line of body) {
    const stripped = line.replace(NODE_PATTERN, (_match, id: string, label: string) => {
      if (!labels.has(id)) labels.set(id, plain(label));
      return id;
    });
    for (const [, from, back, midLabel, head, pipeLabel, to] of stripped.matchAll(EDGE_PATTERN)) {
      const arrow = head.endsWith('>') ? (back ? '↔' : '→') : '—';
      edges.push({ from, to, arrow, label: plain(midLabel ?? pipeLabel ?? '') });
    }
  }
  const name = (id: string) => labels.get(id) || id;
  const connected = new Set(edges.flatMap(({ from, to }) => [from, to]));
  const isolated = [...labels]
    .filter(([id, label]) => !connected.has(id) && label)
    .map(([, label]) => label);
  return [
    ...edges.map(({ from, to, arrow, label }) => `${name(from)} ${arrow} ${name(to)}${label ? `: ${label}` : ''}`),
    ...isolated,
  ];
}

export function MermaidFigure({ id, source, label, renderer = renderDiagram }: MermaidFigureProps) {
  const unique = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const svgId = `ghost-mermaid-${id}-${unique}`;
  const descriptionId = `${svgId}-description`;
  const figureLabel = label ?? `図 ${Number(id.slice(1))}`;
  const [result, setResult] = useState<{ source: string; svg?: string; failed?: boolean }>();
  const [attempt, setAttempt] = useState(0);
  const figureRef = useRef<HTMLDivElement>(null);
  const [nearView, setNearView] = useState(() => typeof IntersectionObserver === 'undefined');

  useEffect(() => {
    const figure = figureRef.current;
    if (!figure || nearView) return;
    const observer = new IntersectionObserver(
      entries => {
        if (!entries.some(entry => entry.isIntersecting)) return;
        setNearView(true);
        observer.disconnect();
      },
      { rootMargin: '600px 0px' },
    );
    observer.observe(figure);
    return () => observer.disconnect();
  }, [nearView]);

  useEffect(() => {
    if (!nearView) return;
    let active = true;
    renderer(svgId, source)
      .then(({ svg }) => {
        if (!active) return;
        setResult({ source, svg: sizeSvg(svg, source) });
      })
      .catch((error: unknown) => {
        if (!active) return;
        console.error(`Mermaid figure ${id} failed to render`, error);
        setResult({ source, failed: true });
      });
    return () => {
      active = false;
    };
  }, [attempt, id, nearView, renderer, source, svgId]);

  useEffect(() => {
    const svg = figureRef.current?.querySelector('svg');
    if (svg) fitDiagram(svg);
  }, [result]);

  const retry = () => {
    setResult(undefined);
    setAttempt(value => value + 1);
  };

  const current = result?.source === source ? result : undefined;
  return (
    <div
      ref={figureRef}
      className="mermaid-target"
      role="img"
      aria-label={figureLabel}
      data-diagram={id}
      data-definition={source}
    >
      {current?.svg ? (
        <div
          className="diagram-viewport"
          role="img"
          aria-label={figureLabel}
          tabIndex={0}
          aria-describedby={descriptionId}
          dangerouslySetInnerHTML={{ __html: current.svg }}
        />
      ) : current?.failed ? (
        <div className="diagram-error">
          <p role="alert">{figureLabel} を描画できませんでした。</p>
          <button type="button" className="diagram-retry" onClick={retry}>
            {figureLabel} の描画を再試行
          </button>
          <details>
            <summary>図の定義</summary>
            <pre className="mermaid-error">{source}</pre>
          </details>
        </div>
      ) : (
        <p role="status">{figureLabel} を描画中…</p>
      )}
      {current && (
        <details className="diagram-description">
          <summary>{figureLabel} のテキスト説明</summary>
          <ul id={descriptionId}>
            {describeDiagram(source).map((line, index) => (
              <li key={index}>{line}</li>
            ))}
          </ul>
        </details>
      )}
      <noscript>図の表示にはJavaScriptが必要です。</noscript>
    </div>
  );
}
