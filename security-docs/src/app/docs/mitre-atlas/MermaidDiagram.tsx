'use client';

import { useEffect, useId, useState } from 'react';

export type DiagramRenderer = (id: string, source: string) => Promise<{ svg: string }>;
export const diagramConfig = {
  startOnLoad: false, theme: 'base', securityLevel: 'strict', htmlLabels: false,
  themeVariables: {
    fontSize: '16px', primaryColor: '#5b21b6', primaryTextColor: '#ede9fe', primaryBorderColor: '#ddd6fe',
    lineColor: '#8a8a96', secondaryColor: '#115e59', secondaryTextColor: '#ccfbf1', secondaryBorderColor: '#99f6e4',
    tertiaryColor: '#1f1f28', background: '#16161d', mainBkg: '#5b21b6', nodeTextColor: '#ede9fe',
    clusterBkg: '#1a1a22', clusterBorder: '#34343f', titleColor: '#ddd6fe', edgeLabelBackground: '#1f1f28',
  },
  flowchart: { curve: 'linear', htmlLabels: false, useMaxWidth: false, nodeSpacing: 45, rankSpacing: 45 },
};
export const renderDiagram: DiagramRenderer = async (id, source) => {
  try { await document.fonts?.ready; } catch { /* A failed optional font must not prevent the diagram. */ }
  const { default: mermaid } = await import('mermaid');
  return mermaid.render(id, `---\nconfig: ${JSON.stringify(diagramConfig)}\n---\n${source}`);
};
function sizeSvg(markup: string) {
  const holder = document.createElement('div'); holder.innerHTML = markup;
  const svg = holder.querySelector('svg');
  if (!svg) throw new Error('Mermaid returned no SVG');
  Object.assign(svg.style, { maxWidth: '100%', height: 'auto', display: 'block', margin: '0 auto', overflow: 'visible' });
  return holder.innerHTML;
}
export function MermaidDiagram({ id, source, renderer = renderDiagram }: { id: string; source: string; renderer?: DiagramRenderer }) {
  const unique = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const svgId = `atlas-${id}-${unique}`;
  const title = source.match(/^\s*accTitle:\s*(.*)$/m)?.[1] ?? id;
  const description = source.match(/^\s*accDescr:\s*(.*)$/m)?.[1] ?? '';
  const [result, setResult] = useState<{ source: string; svg?: string; failed?: boolean }>();
  useEffect(() => {
    let active = true;
    renderer(svgId, source).then(({ svg }) => {
      if (active) setResult({ source, svg: sizeSvg(svg) });
    }).catch((error: unknown) => {
      if (!active) return;
      console.error(`Mermaid ${id} failed to render`, error); setResult({ source, failed: true });
    });
    return () => { active = false; };
  }, [id, renderer, source, svgId]);
  const current = result?.source === source ? result : undefined;
  return <div className="mermaid-diagram" data-diagram={id} data-definition={source}>
    <div role="img" aria-label={title} aria-describedby={`${svgId}-description`} aria-busy={!current}>
      {current?.svg ? <div dangerouslySetInnerHTML={{ __html: current.svg }} /> : current?.failed ? <p className="diagram-error" role="alert">図の描画に失敗しました ({id})</p> : <span role="status">{title}を描画中…</span>}
    </div>
    <p id={`${svgId}-description`} className="diagram-accessible-description">{description}</p>
    <details className="diagram-definition"><summary>図の定義（テキスト）</summary><pre>{source}</pre></details>
    <noscript>図の表示にはJavaScriptが必要です。図の説明・定義を参照してください。</noscript>
  </div>;
}
