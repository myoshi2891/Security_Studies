'use client';

import { useEffect, useId, useRef, useState } from 'react';

export type DiagramRenderer = (id: string, source: string) => Promise<{ svg: string }>;
export interface MermaidFigureProps {
  id: number;
  source: string;
  /** Optional renderer for isolated lifecycle tests; pages use the bundled Mermaid renderer. */
  renderer?: DiagramRenderer;
}

let engine: Promise<typeof import('mermaid')['default']> | undefined;

async function getEngine() {
  engine ??= import('mermaid').then(({ default: mermaid }) => {
    mermaid.initialize({
      startOnLoad: false, theme: 'base', securityLevel: 'strict',
      fontFamily: '"Hiragino Sans","Noto Sans JP","Yu Gothic",sans-serif',
      flowchart: { useMaxWidth: false, htmlLabels: true, nodeSpacing: 45, rankSpacing: 45, curve: 'basis', padding: 12 },
      sequence: { useMaxWidth: false, actorMargin: 50, messageMargin: 36 },
      pie: { useMaxWidth: false },
      themeVariables: {
        fontSize: '16px', primaryColor: '#EEF1F8', primaryBorderColor: '#2E3F72', primaryTextColor: '#161B26',
        secondaryColor: '#FAF1DF', secondaryBorderColor: '#B8802A', secondaryTextColor: '#161B26',
        tertiaryColor: '#F6F7F9', tertiaryBorderColor: '#B9C0D0', tertiaryTextColor: '#161B26',
        lineColor: '#2E3F72', textColor: '#161B26', mainBkg: '#EEF1F8', nodeBorder: '#2E3F72', nodeTextColor: '#161B26',
        clusterBkg: '#F6F7F9', clusterBorder: '#B9C0D0', edgeLabelBackground: '#F6F7F9', titleColor: '#161B26',
        actorBkg: '#EEF1F8', actorBorder: '#2E3F72', actorTextColor: '#161B26', actorLineColor: '#B9C0D0',
        signalColor: '#2E3F72', signalTextColor: '#161B26', labelBoxBkgColor: '#FAF1DF', labelBoxBorderColor: '#B8802A',
        labelTextColor: '#161B26', loopTextColor: '#161B26', noteBkgColor: '#FAF1DF', noteBorderColor: '#B8802A',
        noteTextColor: '#161B26', activationBkgColor: '#EEF1F8', activationBorderColor: '#2E3F72', sequenceNumberColor: '#FFFFFF',
        pie1: '#C9D3EA', pie2: '#F1DDAE', pie3: '#BFE0DB', pie4: '#E8C7D6', pie5: '#D9DDE6',
        pieStrokeColor: '#F6F7F9', pieStrokeWidth: '2px', pieSectionTextColor: '#161B26',
        pieLegendTextColor: '#161B26', pieTitleTextColor: '#161B26', pieTitleTextSize: '18px',
        pieSectionTextSize: '16px', pieLegendTextSize: '16px', pieOuterStrokeColor: '#F6F7F9',
      },
    });
    return mermaid;
  });
  return engine;
}

export const renderDiagram: DiagramRenderer = async (id, source) => {
  await document.fonts?.ready;
  return (await getEngine()).render(id, source);
};

function sizeSvg(svgMarkup: string, source: string) {
  const holder = document.createElement('div');
  holder.innerHTML = svgMarkup;
  const svg = holder.querySelector('svg');
  if (!svg) throw new Error('Mermaid returned no SVG');
  const box = (svg.getAttribute('viewBox') ?? '').trim().split(/\s+/).map(Number);
  if (box.length === 4 && box.every(Number.isFinite)) {
    box[3] += /^(sequenceDiagram|stateDiagram)/.test(source.trim()) ? 110 : 15;
    svg.setAttribute('viewBox', box.join(' '));
    svg.style.width = `${box[2]}px`;
  }
  svg.removeAttribute('width');
  svg.removeAttribute('height');
  svg.style.maxWidth = '100%';
  svg.style.height = 'auto';
  svg.style.overflow = 'visible';
  return holder.innerHTML;
}

/** ラベル中の <br/> 等の HTML を読み上げ用のプレーンテキストに変換する */
const plain = (text: string) => text.replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

/** 図の定義からテキスト説明（1行目が図の種類と概要、以降が内容）を生成する */
export function describeDiagram(source: string): string[] {
  const lines = source.trim().split('\n').map(line => line.trim()).filter(Boolean);
  const header = lines[0] ?? '';

  if (header.startsWith('pie')) {
    const title = lines.find(line => line.startsWith('title '))?.slice('title '.length) ?? '';
    const slices = lines.flatMap(line => {
      const slice = line.match(/^"([^"]*)"\s*:\s*(.+)$/);
      return slice ? [`${plain(slice[1])}: ${slice[2].trim()}`] : [];
    });
    return [`円グラフ: ${plain(title)}`, ...slices];
  }

  if (header.startsWith('sequenceDiagram')) {
    const names = new Map<string, string>();
    const steps: string[] = [];
    for (const line of lines.slice(1)) {
      const participant = line.match(/^(?:participant|actor)\s+(\S+)(?:\s+as\s+(.+))?$/);
      if (participant) {
        names.set(participant[1], plain(participant[2] ?? participant[1]));
        continue;
      }
      const message = line.match(/^([^\s-]+)\s*--?(?:>>|>|x|\))[+-]?\s*([^\s:]+)\s*:\s*(.*)$/);
      if (message) {
        const name = (key: string) => names.get(key) ?? key;
        steps.push(`${name(message[1])} → ${name(message[2])}: ${plain(message[3])}`);
        continue;
      }
      const note = line.match(/^Note\s+[^:]+:\s*(.*)$/i);
      if (note) steps.push(`注記: ${plain(note[1])}`);
    }
    return [`シーケンス図: ${[...names.values()].join('、')}`, ...steps];
  }

  const labels = [...new Set([...source.matchAll(/"([^"]*)"/g)].map(match => plain(match[1])).filter(Boolean))];
  // 引用符付きラベルがない定義は、定義本文をそのまま説明として使う
  return ['フローチャート', ...(labels.length > 0 ? labels : lines.slice(1))];
}

export function MermaidFigure({ id, source, renderer = renderDiagram }: MermaidFigureProps) {
  const unique = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const svgId = `ccie-mermaid-${id}-${unique}`;
  const descriptionId = `${svgId}-description`;
  const [result, setResult] = useState<{ source: string; svg?: string; failed?: boolean }>();
  const figureRef = useRef<HTMLElement>(null);
  // IntersectionObserver 非対応環境では即時描画する（state は描画結果に影響しないため hydration 差異は生じない）
  const [nearView, setNearView] = useState(() => typeof IntersectionObserver === 'undefined');

  // 表示域に近づくまで描画を遅らせ、61図の一斉描画で初期表示が重くなるのを防ぐ
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
    renderer(svgId, source).then(({ svg }) => {
      const sized = sizeSvg(svg, source);
      if (active) setResult({ source, svg: sized });
    }).catch(() => {
      if (active) setResult({ source, failed: true });
    });
    return () => { active = false; };
  }, [nearView, renderer, source, svgId]);

  const current = result?.source === source ? result : undefined;
  return (
    <figure ref={figureRef} className="diagram" data-d={id} data-definition={source}>
      {current?.svg ? (
        <>
          <div role="img" aria-label={`図 ${id + 1}`} aria-describedby={descriptionId} dangerouslySetInnerHTML={{ __html: current.svg }} />
          <details className="diagram-description">
            <summary>図 {id + 1} のテキスト説明</summary>
            <ul id={descriptionId}>{describeDiagram(source).map((line, index) => <li key={index}>{line}</li>)}</ul>
          </details>
        </>
      ) : current?.failed ? (
        <div className="diagram-error">
          <p role="alert">図 {id + 1} を描画できませんでした。</p>
          <details><summary>図の定義</summary><pre>{source}</pre></details>
        </div>
      ) : <p role="status">図 {id + 1} を描画中…</p>}
      <noscript>図の表示にはJavaScriptが必要です。</noscript>
    </figure>
  );
}
