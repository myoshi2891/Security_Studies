import { afterEach, expect, spyOn, test } from 'bun:test';
import { createElement } from 'react';
import { act, cleanup, render, waitFor } from '@testing-library/react';
afterEach(()=>{cleanup();window.history.replaceState(null,'','/');});
test('Mermaid retains unique IDs and intrinsic size, exposes failure definitions and ignores stale results',async()=>{
 const {MermaidFigure}=await import(new URL('./MermaidFigure.tsx',import.meta.url).href);
 const original=globalThis.IntersectionObserver;globalThis.IntersectionObserver=undefined as unknown as typeof IntersectionObserver;
 const messages=spyOn(console,'error').mockImplementation(()=>{});
 try{
 const ids:string[]=[];const renderer=async(id:string)=>{ids.push(id);return {svg:'<svg viewBox="0 0 1800 300" width="100%" style="max-width:100%"><text>図</text></svg>'};};
 const view=render(createElement('div',{},createElement(MermaidFigure,{id:'d1',source:'flowchart LR\nA-->B',renderer}),createElement(MermaidFigure,{id:'d2',source:'flowchart LR\nA-->B',renderer})));
 await waitFor(()=>expect(view.container.querySelectorAll('svg')).toHaveLength(2));expect(new Set(ids).size).toBe(2);expect(view.container.querySelector('svg')!.style.width).toBe('1800px');expect(view.container.querySelector('svg')!.style.maxWidth).toBe('none');expect(view.container.querySelector('.diagram-viewport')).toHaveAttribute('tabindex','0');
 let finish:((value:{svg:string})=>void)|undefined;
 const deferred=()=>new Promise<{svg:string}>(resolve=>{finish=resolve;});
 const pending=render(createElement(MermaidFigure,{id:'d1',source:'old',renderer:deferred}));
 pending.rerender(createElement(MermaidFigure,{id:'d1',source:'new',renderer:async()=>{throw new Error('broken');}}));await waitFor(()=>expect(pending.container.querySelector('[role="alert"]')).not.toBeNull());expect(pending.container.querySelector('pre')).toHaveTextContent('new');
 await act(async()=>finish!({svg:'<svg viewBox="0 0 10 10"></svg>'}));expect(pending.container.querySelector('svg')).toBeNull();
 }finally{globalThis.IntersectionObserver=original;messages.mockRestore();}
});

test('sequence diagrams preserve source height allowance and comma-separated viewBox values',async()=>{
 const {MermaidFigure}=await import(new URL('./MermaidFigure.tsx',import.meta.url).href);
 const original=globalThis.IntersectionObserver;globalThis.IntersectionObserver=undefined as unknown as typeof IntersectionObserver;
 try{const view=render(createElement(MermaidFigure,{id:'d3',source:'sequenceDiagram\nA->>B: request',renderer:async()=>({svg:'<svg viewBox="0,0,900,300" width="100%" height="300"></svg>'})}));
 await waitFor(()=>expect(view.container.querySelector('svg')).not.toBeNull());const svg=view.container.querySelector('svg')!;expect(svg.getAttribute('viewBox')).toBe('0 0 900 410');expect(svg.style.width).toBe('900px');expect(svg.hasAttribute('height')).toBe(false);
 }finally{globalThis.IntersectionObserver=original;}
});
test('all fourteen immutable definitions parse locally and renderer configuration is isolated',async()=>{
 const {diagrams}=await import(new URL('./diagrams.ts',import.meta.url).href);const {definitions,sourceHtml}=await import('./fidelity-helpers');expect(Object.entries(diagrams).map(([id, source])=>['d'+id,source])).toEqual([...definitions]);expect(definitions.size).toBe(14);
 const {default:mermaid}=await import('mermaid');for(const [id,source] of definitions)expect(await mermaid.parse(source),id).toBeTruthy();
 const {renderDiagram,diagramConfig}=await import(new URL('./MermaidFigure.tsx',import.meta.url).href);
 const draw=spyOn(mermaid,'render').mockImplementation(async()=>({svg:'<svg></svg>',diagramType:'flowchart-v2'}));const init=spyOn(mermaid,'initialize');
 try{await renderDiagram('applied-d1','flowchart LR\nA-->B');expect(init).not.toHaveBeenCalled();expect(draw).toHaveBeenCalledWith('applied-d1',`---\nconfig: ${JSON.stringify(diagramConfig)}\n---\nflowchart LR\nA-->B`);
 expect(diagramConfig.sequence).toEqual({useMaxWidth:false,actorMargin:60,messageMargin:40,noteMargin:12});expect(diagramConfig.securityLevel).toBe('strict');
 // themeVariables の配色を全面的に反映できるのは base テーマのみ
 expect(diagramConfig.theme).toBe('base');
 for(const [,key,value] of sourceHtml.match(/themeVariables:\s*\{([\s\S]*?)\n\s*\}/)![1].matchAll(/(\w+):\s*'([^']*)'/g))expect((diagramConfig.themeVariables as Record<string,unknown>)[key]).toBe(value);
 }finally{draw.mockRestore();init.mockRestore();}
});
test('all source icon names have decorative local SVG equivalents and code retains exact Python/Bash text',async()=>{
 const {GuideIcon,guideIcons}=await import(new URL('./GuideIcon.tsx',import.meta.url).href);for(const name of ['ti-lock','ti-shield-lock','ti-alert-triangle','ti-quote','ti-bulb','ti-info-circle','ti-chevron-right']) expect(guideIcons[name],name).toBeDefined();const {GuideCode}=await import(new URL('./GuideCode.tsx',import.meta.url).href);const {sourceDocument}=await import('./fidelity-helpers');
 for(const icon of sourceDocument.querySelectorAll('i.ti')){const name=[...icon.classList].find(c=>c.startsWith('ti-'));const {container}=render(createElement(GuideIcon,{name}));expect(container.querySelector(`i.ti.${name} svg`)).toHaveAttribute('aria-hidden','true');}
 for(const source of sourceDocument.querySelectorAll('pre code')){const {container}=render(createElement(GuideCode,{code:source.textContent,language:source.className.replace('language-','')}));expect(container.textContent).toBe(source.textContent);expect(container.querySelector('code')).toHaveClass(source.className);if(source.className==='language-python')expect(container.querySelector('[class^="hljs-"]')).not.toBeNull();}
});
test('lazy diagrams wait for intersection, disconnect observers and support retries after engine loading fails',async()=>{
 const {MermaidFigure,createEngineLoader}=await import(new URL('./MermaidFigure.tsx',import.meta.url).href);
 const saved=globalThis.IntersectionObserver;let notify:IntersectionObserverCallback|undefined;let disconnected=0;
 globalThis.IntersectionObserver=class{constructor(cb:IntersectionObserverCallback){notify=cb;}observe(){}disconnect(){disconnected++;}} as unknown as typeof IntersectionObserver;
 try{
  let calls=0;const renderer=async()=>{calls++;return {svg:'<svg viewBox="0 0 200 80"></svg>'};};
  const view=render(createElement(MermaidFigure,{id:'d1',source:'flowchart LR\nA-->B',renderer}));expect(calls).toBe(0);
  act(()=>notify!([{isIntersecting:true} as IntersectionObserverEntry],{} as IntersectionObserver));await waitFor(()=>expect(view.container.querySelector('svg')).not.toBeNull());expect(calls).toBe(1);view.unmount();expect(disconnected).toBeGreaterThan(0);
  let loads=0;const load=createEngineLoader(async()=>{loads++;if(loads===1)throw new Error('retry');return 'engine';});await expect(load()).rejects.toThrow('retry');expect(await load()).toBe('engine');expect(await load()).toBe('engine');expect(loads).toBe(2);
 }finally{globalThis.IntersectionObserver=saved;}
});
test('a failed diagram offers a retry button that re-runs rendering and shows the diagram on success',async()=>{
 const {MermaidFigure}=await import(new URL('./MermaidFigure.tsx',import.meta.url).href);
 const original=globalThis.IntersectionObserver;globalThis.IntersectionObserver=undefined as unknown as typeof IntersectionObserver;
 const messages=spyOn(console,'error').mockImplementation(()=>{});
 try{
 let calls=0;const renderer=async()=>{calls++;if(calls===1)throw new Error('engine load failed');return {svg:'<svg viewBox="0 0 10 10"></svg>'};};
 const view=render(createElement(MermaidFigure,{id:'d3',source:'flowchart LR\nA-->B',renderer}));
 await waitFor(()=>expect(view.container.querySelector('[role="alert"]')).not.toBeNull());expect(view.container.querySelector('pre')).toHaveTextContent('A-->B');
 const retry=[...view.container.querySelectorAll('button')].find(b=>b.textContent?.includes('再試行'));expect(retry).toBeDefined();
 await act(async()=>{retry!.click();});
 await waitFor(()=>expect(view.container.querySelector('svg')).not.toBeNull());expect(calls).toBe(2);expect(view.container.querySelector('[role="alert"]')).toBeNull();
 }finally{globalThis.IntersectionObserver=original;messages.mockRestore();}
});
test('a failed diagram still shows its text description alongside the error and definition',async()=>{
 const {MermaidFigure}=await import(new URL('./MermaidFigure.tsx',import.meta.url).href);
 const original=globalThis.IntersectionObserver;globalThis.IntersectionObserver=undefined as unknown as typeof IntersectionObserver;
 const messages=spyOn(console,'error').mockImplementation(()=>{});
 try{
 const view=render(createElement(MermaidFigure,{id:'d4',source:'flowchart LR\nA["入力"] --> B["出力"]',renderer:async()=>{throw new Error('broken');}}));
 await waitFor(()=>expect(view.container.querySelector('[role="alert"]')).not.toBeNull());
 expect(view.container.querySelector('svg')).toBeNull();expect(view.container.querySelector('pre')).toHaveTextContent('A["入力"]');
 const description=view.container.querySelector('.diagram-description');expect(description).not.toBeNull();
 expect([...description!.querySelectorAll('li')].map(li=>li.textContent)).toEqual(['フローチャート','入力 → 出力']);
 }finally{globalThis.IntersectionObserver=original;messages.mockRestore();}
});
test('diagram text descriptions resolve quoted node labels across edges, chains and isolated nodes',async()=>{
 const {describeDiagram}=await import(new URL('./MermaidFigure.tsx',import.meta.url).href);
 expect(describeDiagram('flowchart TD\nA["開始<br/>入力"] --> B{"判定"}\nB -- "はい" --> C("完了")\nB -->|"いいえ"| A\nC <--> E\nD["孤立"]')).toEqual(['フローチャート','開始 入力 → 判定','判定 → 完了: はい','判定 → 開始 入力: いいえ','完了 ↔ E','孤立']);
 expect(describeDiagram('sequenceDiagram\nA->>B: 要求<br/>送信')).toEqual(['シーケンス図','A->>B: 要求 送信']);
});
