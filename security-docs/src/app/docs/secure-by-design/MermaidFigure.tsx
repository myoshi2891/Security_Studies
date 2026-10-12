'use client';

import { useEffect, useId, useState } from 'react';

export type DiagramRenderer = (id: string, source: string) => Promise<{ svg: string }>;
interface MermaidFigureProps { id: string; source: string; renderer?: DiagramRenderer; }

/** Per-diagram configuration avoids changing the theme of another guide's Mermaid engine. */
export const diagramConfig = {
  startOnLoad: false, theme: 'dark', securityLevel: 'strict',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Hiragino Sans","Yu Gothic","Noto Sans JP","Segoe UI",sans-serif',
  flowchart: { useMaxWidth: false, htmlLabels: true, nodeSpacing: 45, rankSpacing: 45, curve: 'basis', padding: 12 },
  state: { useMaxWidth: false },
  themeVariables: {
    darkMode: true,
    background: '#0d1b2e',
    fontSize: '16px',
    primaryColor: '#16315c',
    primaryTextColor: '#f3f5fa',
    primaryBorderColor: '#7c9eff',
    secondaryColor: '#1b2f4f',
    secondaryTextColor: '#f3f5fa',
    secondaryBorderColor: '#3e5c8f',
    tertiaryColor: '#13253d',
    tertiaryTextColor: '#f3f5fa',
    tertiaryBorderColor: '#3e5c8f',
    lineColor: '#9db8ff',
    textColor: '#f3f5fa',
    mainBkg: '#16315c',
    nodeBorder: '#7c9eff',
    nodeTextColor: '#f3f5fa',
    edgeLabelBackground: '#0d1b2e',
    clusterBkg: '#0f2036',
    clusterBorder: '#3e5c8f',
    titleColor: '#f3f5fa',
    noteBkgColor: '#1b2f4f',
    noteTextColor: '#f3f5fa',
    noteBorderColor: '#7c9eff',
    transitionColor: '#9db8ff',
    transitionLabelColor: '#f3f5fa',
    stateBkg: '#16315c',
    stateLabelColor: '#f3f5fa',
    labelColor: '#f3f5fa',
    altBackground: '#13253d',
  },
};

export const renderDiagram: DiagramRenderer = async (id, source) => {
  await document.fonts?.ready;
  const { default: mermaid } = await import('mermaid');
  // JSON is valid YAML. Mermaid applies this config to one render, retaining the original source separately.
  return mermaid.render(id, `---\nconfig: ${JSON.stringify(diagramConfig)}\n---\n${source}`);
};

function sizeSvg(markup: string, source: string) {
  const holder = document.createElement('div');
  holder.innerHTML = markup;
  const svg = holder.querySelector('svg');
  if (!svg) throw new Error('Mermaid returned no SVG');
  const box = (svg.getAttribute('viewBox') ?? '').trim().split(/\s+/).map(Number);
  if (box.length === 4 && box.every(Number.isFinite)) {
    box[3] += /^(stateDiagram|sequenceDiagram)/.test(source.trim()) ? 110 : 15;
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

export function MermaidFigure({ id, source, renderer = renderDiagram }: MermaidFigureProps) {
  const unique = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const svgId = `sbd-mermaid-${id}-${unique}`;
  const [result, setResult] = useState<{ source: string; svg?: string; failed?: boolean }>();
  useEffect(() => {
    let active = true;
    renderer(svgId, source).then(({ svg }) => {
      if (active) setResult({ source, svg: sizeSvg(svg, source) });
    }).catch((error: unknown) => {
      if (!active) return;
      console.error(`Mermaid ${id} failed to render`, error);
      setResult({ source, failed: true });
    });
    return () => { active = false; };
  }, [id, renderer, source, svgId]);
  const current = result?.source === source ? result : undefined;
  return <figure className="diagram">
    <div className={`mermaid-target${current?.failed ? ' diagram-error' : ''}`} data-diagram={id} data-definition={source} role="img" aria-label={`図${id.slice(1)}`} aria-busy={!current}>
      {current?.svg ? <div dangerouslySetInnerHTML={{ __html: current.svg }} /> : current?.failed ? <span role="alert">図の描画に失敗しました ({id})</span> : <span role="status">図{id.slice(1)}を描画中…</span>}
    </div>
    <details><summary>図{id.slice(1)}の定義（テキスト）</summary><pre>{source}</pre></details>
    <noscript>図の表示にはJavaScriptが必要です。上の図の定義を参照してください。</noscript>
  </figure>;
}
