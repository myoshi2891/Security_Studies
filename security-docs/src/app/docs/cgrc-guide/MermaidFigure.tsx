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
  "theme": "base",
  "fontFamily": "\"Noto Sans JP\",\"Hiragino Sans\",\"Yu Gothic\",system-ui,sans-serif",
  "themeVariables": {
    "fontFamily": "\"Noto Sans JP\",\"Hiragino Sans\",\"Yu Gothic\",system-ui,sans-serif",
    "fontSize": "16px",
    "primaryColor": "#EEF1F8",
    "primaryBorderColor": "#2E3F72",
    "primaryTextColor": "#161B26",
    "secondaryColor": "#FAF1DF",
    "tertiaryColor": "#F6F7F9",
    "lineColor": "#2E3F72",
    "textColor": "#161B26",
    "edgeLabelBackground": "#F6F7F9",
    "clusterBkg": "#F6F7F9",
    "clusterBorder": "#B7C0D2",
    "pie1": "#C9D3EA",
    "pie2": "#F1DDAE",
    "pie3": "#BFE0DB",
    "pie4": "#E8C7D6",
    "pie5": "#A9B8DC",
    "pie6": "#E6C98A",
    "pie7": "#9CCBC5",
    "pieStrokeColor": "#F6F7F9",
    "pieStrokeWidth": "2px",
    "pieOuterStrokeColor": "#F6F7F9",
    "pieOuterStrokeWidth": "2px",
    "pieOpacity": "1",
    "pieSectionTextColor": "#161B26",
    "pieLegendTextColor": "#161B26",
    "pieTitleTextColor": "#161B26",
    "pieTitleTextSize": "18px",
    "pieSectionTextSize": "16px",
    "pieLegendTextSize": "16px"
  },
  "flowchart": {
    "useMaxWidth": false,
    "htmlLabels": true,
    "nodeSpacing": 40,
    "rankSpacing": 45,
    "curve": "basis"
  },
  "pie": {
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
  if (lines[0]?.startsWith('stateDiagram')) return ['ステート図', ...lines.slice(1).map(describeTransition)];
  const edges = describeFlowchart(lines.slice(1));
  return ['フローチャート', ...(edges.length > 0 ? edges : lines.slice(1))];
}

/** `A --> B: ラベル` の状態遷移。`[*]` は遷移元なら開始、遷移先なら終了を表す */
const TRANSITION_PATTERN = /^(\[\*\]|[\w.]+)\s*-->\s*(\[\*\]|[\w.]+)\s*(?::\s*(.*))?$/;

function describeTransition(line: string): string {
  const match = TRANSITION_PATTERN.exec(line);
  if (!match) return plain(line);
  const [, from, to, label] = match;
  const source = from === '[*]' ? '[*]（開始）' : from;
  const target = to === '[*]' ? '[*]（終了）' : to;
  return `${source} → ${target}${label ? `: ${plain(label)}` : ''}`;
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
  const svgId = `cgrc-mermaid-${id}-${unique}`;
  const descriptionId = `${svgId}-description`;
  // d3 形式は番号、それ以外（dg-overflow など）は dg- 接頭辞を除いた名前を表示名にする
  const figureNumber = /^d(\d+)$/.exec(id)?.[1];
  const figureLabel = label ?? (figureNumber ? `図 ${Number(figureNumber)}` : `図: ${id.replace(/^dg-/, '')}`);
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
      data-key={id}
      className="mermaid-target"
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
