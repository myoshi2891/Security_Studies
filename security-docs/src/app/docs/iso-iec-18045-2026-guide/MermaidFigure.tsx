'use client';

import { useEffect, useId, useRef, useState } from 'react';


export type DiagramRenderer = (id: string, source: string) => Promise<{ svg: string }>;
export interface MermaidFigureProps {
  id: string;
  source: string;
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

const getEngine = createEngineLoader(() => import('mermaid').then(({ default: mermaid }) => mermaid));
export const diagramConfig = {"startOnLoad":false,"theme":"base","securityLevel":"strict","fontFamily":"\"Hiragino Sans\",\"Hiragino Kaku Gothic ProN\",\"Noto Sans JP\",\"Yu Gothic UI\",\"Yu Gothic\",Meiryo,system-ui,sans-serif","fontSize":16,"flowchart":{"useMaxWidth":false,"htmlLabels":true,"nodeSpacing":45,"rankSpacing":45,"curve":"basis","padding":12},"sequence":{"useMaxWidth":false,"actorFontSize":16,"messageFontSize":16,"noteFontSize":16,"wrap":false,"width":190,"messageMargin":36},"pie":{"useMaxWidth":false},"themeVariables":{"fontSize":"16px","background":"#0d1b30","primaryColor":"#16294a","primaryTextColor":"#f3f5fa","primaryBorderColor":"#7c9eff","secondaryColor":"#13243f","secondaryTextColor":"#f3f5fa","secondaryBorderColor":"#3e5c8f","tertiaryColor":"#0d1b30","tertiaryTextColor":"#f3f5fa","tertiaryBorderColor":"#2d456e","mainBkg":"#16294a","nodeBorder":"#7c9eff","nodeTextColor":"#f3f5fa","textColor":"#f3f5fa","lineColor":"#93a1bd","edgeLabelBackground":"#0d1b30","clusterBkg":"#13243f","clusterBorder":"#3e5c8f","titleColor":"#f3f5fa","actorBkg":"#16294a","actorBorder":"#7c9eff","actorTextColor":"#f3f5fa","actorLineColor":"#93a1bd","signalColor":"#c6d0e3","signalTextColor":"#f3f5fa","labelBoxBkgColor":"#16294a","labelBoxBorderColor":"#7c9eff","labelTextColor":"#f3f5fa","loopTextColor":"#f3f5fa","noteBkgColor":"#2b2410","noteTextColor":"#f3f5fa","noteBorderColor":"#f2b45a","activationBkgColor":"#13243f","activationBorderColor":"#7c9eff","sequenceNumberColor":"#07111e","pie1":"#7c9eff","pie2":"#f2b45a","pie3":"#4fd1a5","pie4":"#f472b6","pie5":"#a78bfa","pie6":"#fb923c","pie7":"#86efac","pie8":"#fb7185","pie9":"#38bdf8","pie10":"#e9d5ff","pie11":"#facc15","pie12":"#5eead4","pieStrokeColor":"#0d1b30","pieOuterStrokeColor":"#0d1b30","pieStrokeWidth":"2px","pieOuterStrokeWidth":"2px","pieOpacity":"1","pieSectionTextColor":"#07111e","pieSectionTextSize":"16px","pieTitleTextColor":"#f3f5fa","pieTitleTextSize":"18px","pieLegendTextColor":"#f3f5fa","pieLegendTextSize":"16px","darkMode":true}} satisfies import('mermaid').MermaidConfig;

/** Per-render configuration keeps this guide's theme out of other routes' shared engine. */
export const renderDiagram: DiagramRenderer = async (id, source) => {
  await document.fonts?.ready;
  const config = diagramConfig;
  return (await getEngine()).render(id, `---\nconfig: ${JSON.stringify(config)}\n---\n${source}`);
};

function sizeSvg(svgMarkup: string) {
  const holder = document.createElement('div');
  holder.innerHTML = svgMarkup;
  const svg = holder.querySelector('svg');
  if (!svg) throw new Error('Mermaid returned no SVG');
  const box = (svg.getAttribute('viewBox') ?? '').trim().split(/[\s,]+/).map(Number);
  if (box.length === 4 && box.every(Number.isFinite)) {
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
  } catch { /* Preserve Mermaid's viewBox if geometry measurement is unavailable. */ }
}

/** ラベル中の <br/> 等の HTML を読み上げ用のプレーンテキストに変換する */
const plain = (text: string) => text.replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

/** 元ガイドの全18図から、ノードと接続のテキスト説明を生成する */
export function describeDiagram(source: string): string[] {
  const lines = source.trim().split('\n').map(line => line.trim()).filter(Boolean);
  if (lines[0].startsWith('pie')) return ['円グラフ', ...lines.slice(1).flatMap(line => {
    if (line.startsWith('title ')) return [plain(line.slice(6))];
    const slice = line.match(/^"([^"]+)"\s*:\s*([0-9.]+)$/);
    return slice ? [`${plain(slice[1])}: ${slice[2]}`] : [];
  })];
  if (lines[0] === 'sequenceDiagram') return ['シーケンス図', ...lines.slice(1).map(plain)];
  const edges = describeFlowchart(lines.slice(1));
  // 接続もノードも読み取れない定義は、定義本文をそのまま説明として使う
  return ['フローチャート', ...(edges.length > 0 ? edges : lines.slice(1))];
}

/** `A["x"]` / `C{"x"}` / `B("x")` / スタジアム形 `S(["x"])` / 円柱形 `D[("x")]` のノード定義（ID とラベル） */
const NODE_PATTERN = /(\w+)\s*(?:\(\[|\[\(|\[\[?|\(\(?|\{\{?)"([^"]*)"(?:\]\)|\)\]|\]\]?|\)\)?|\}\}?)/g;
/**
 * ノード定義を ID に置換した行から接続を読み取る（連鎖 `A --> B --> C` は先読みで終点を消費しない）。
 * 1: 始点 / 2: `<`（双方向） / 3: 中間ラベル（`-- "x" -->`） / 4: 終端（`>` は有向、`-` は無向、`.-` で閉じたラベル直後は空の無向） / 5: パイプラベル / 6: 終点
 */
const EDGE_PATTERN = /(\w+)\s*(<)?(?:--|-\.|==)(?:\s*"([^"]*)"\s*(?:--|\.-|==))?(-?>|-|(?<=\.-))\s*(?:\|"([^"]*)"\|)?\s*(?=(\w+))/g;

/** フローチャートの接続を「始点 → 終点: ラベル」形式で列挙し、接続のないノードはラベルのみ残す */
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
  // ノードのラベルは接続より後の行で定義されることがあるため、全行を読んでから解決する
  const name = (id: string) => labels.get(id) || id;
  const connected = new Set(edges.flatMap(({ from, to }) => [from, to]));
  const isolated = [...labels].filter(([id, label]) => !connected.has(id) && label).map(([, label]) => label);
  return [
    ...edges.map(({ from, to, arrow, label }) => `${name(from)} ${arrow} ${name(to)}${label ? `: ${label}` : ''}`),
    ...isolated,
  ];
}

export function MermaidFigure({ id, source, renderer = renderDiagram }: MermaidFigureProps) {
  const unique = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const svgId = `iso18045-mermaid-${id}-${unique}`;
  const descriptionId = `${svgId}-description`;
  const [result, setResult] = useState<{ source: string; svg?: string; failed?: boolean }>();
  // 再試行ボタンで増やし、描画 effect を再実行させる
  const [attempt, setAttempt] = useState(0);
  const figureRef = useRef<HTMLDivElement>(null);
  // IntersectionObserver 非対応環境では即時描画する（state は描画結果に影響しないため hydration 差異は生じない）
  const [nearView, setNearView] = useState(() => typeof IntersectionObserver === 'undefined');

  // 表示域に近づくまで描画を遅らせ、18図の一斉描画で初期表示が重くなるのを防ぐ
  useEffect(() => {
    const figure = figureRef.current;
    if (!figure || nearView) return;
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      setNearView(true);
      observer.disconnect();
    }, { rootMargin: '600px 0px' });
    observer.observe(figure);
    return () => observer.disconnect();
  }, [nearView]);

  useEffect(() => {
    if (!nearView) return;
    let active = true;
    // 古い描画の結果・失敗ログは破棄する（定義変更やアンマウント後に完了した場合）
    renderer(svgId, source).then(({ svg }) => {
      if (!active) return;
      setResult({ source, svg: sizeSvg(svg) });
    }).catch((error: unknown) => {
      if (!active) return;
      console.error(`Mermaid figure ${id} failed to render`, error);
      setResult({ source, failed: true });
    });
    return () => { active = false; };
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
    <div ref={figureRef} className="mermaid" data-diagram={id} data-definition={source}>
      {current?.svg ? (
        <div className="diagram-viewport" role="img" aria-label={`図 ${Number(id.slice(1))}`} tabIndex={0} aria-describedby={descriptionId} dangerouslySetInnerHTML={{ __html: current.svg }} />
      ) : current?.failed ? (
        <div className="diagram-error">
          <p role="alert">図 {Number(id.slice(1))} を描画できませんでした。</p>
          <button type="button" className="diagram-retry" onClick={retry}>図 {Number(id.slice(1))} の描画を再試行</button>
          <details><summary>図の定義</summary><pre>{source}</pre></details>
        </div>
      ) : <p role="status">図 {Number(id.slice(1))} を描画中…</p>}
      {/* 描画結果が確定したら成否に関わらず図の内容をテキストで読めるようにする（描画中は原本どおり出さない） */}
      {current && <details className="diagram-description">
        <summary>図 {Number(id.slice(1))} のテキスト説明</summary>
        <ul id={descriptionId}>{describeDiagram(source).map((line, index) => <li key={index}>{line}</li>)}</ul>
      </details>}
      <noscript>図の表示にはJavaScriptが必要です。</noscript>
    </div>
  );
}
