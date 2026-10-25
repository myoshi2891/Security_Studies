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

test('sequence diagrams retain their original 110px sequence clearance and accept comma-separated viewBox values',async()=>{
 const {MermaidFigure}=await import(new URL('./MermaidFigure.tsx',import.meta.url).href);
 const original=globalThis.IntersectionObserver;globalThis.IntersectionObserver=undefined as unknown as typeof IntersectionObserver;
 try{const view=render(createElement(MermaidFigure,{id:'d3',source:'sequenceDiagram\nA->>B: request',renderer:async()=>({svg:'<svg viewBox="0,0,900,300" width="100%" height="300"></svg>'})}));
 await waitFor(()=>expect(view.container.querySelector('svg')).not.toBeNull());const svg=view.container.querySelector('svg')!;expect(svg.getAttribute('viewBox')).toBe('0 0 900 410');expect(svg.style.width).toBe('900px');expect(svg.hasAttribute('height')).toBe(false);
 }finally{globalThis.IntersectionObserver=original;}
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
test('diagram text descriptions read labels from stadium and cylinder nodes instead of node IDs',async()=>{
 const {describeDiagram}=await import(new URL('./MermaidFigure.tsx',import.meta.url).href);
 expect(describeDiagram('flowchart LR\nAPI(["APIサーバー"]) --> DB[("顧客DB")]')).toEqual(['フローチャート','APIサーバー → 顧客DB']);
 expect(describeDiagram('flowchart LR\nDB[("顧客DB")]\nAPI(["APIサーバー"]) -->|"読み取り"| DB')).toEqual(['フローチャート','APIサーバー → 顧客DB: 読み取り']);
});

test('live SVG sizing extends the viewBox only to the measured drawing bounds',async()=>{
 const {fitDiagram}=await import(new URL('./MermaidFigure.tsx',import.meta.url).href);
 const holder=document.createElement('div');holder.innerHTML='<svg viewBox="0 0 900 300"></svg>';const svg=holder.querySelector('svg')!;
 Object.defineProperty(svg,'getBBox',{configurable:true,value:()=>({x:0,y:10,width:900,height:340})});fitDiagram(svg);expect(svg.getAttribute('viewBox')).toBe('0 0 900 366');
 Object.defineProperty(svg,'getBBox',{configurable:true,value:()=>({x:0,y:0,width:900,height:200})});fitDiagram(svg);expect(svg.getAttribute('viewBox')).toBe('0 0 900 366');
 Object.defineProperty(svg,'getBBox',{configurable:true,value:()=>{throw new Error('unavailable');}});expect(()=>fitDiagram(svg)).not.toThrow();
});
test('the default renderer passes this guide configuration per render without re-initializing the shared engine',async()=>{
 const {default:mermaid}=await import('mermaid');const {renderDiagram,diagramConfig}=await import(new URL('./MermaidFigure.tsx',import.meta.url).href);
 const draw=spyOn(mermaid,'render').mockImplementation(async()=>({svg:'<svg></svg>',diagramType:'flowchart-v2'}));const init=spyOn(mermaid,'initialize');
 try{expect(await renderDiagram('secrets-lies-d1','flowchart LR\nA-->B')).toEqual({svg:'<svg></svg>',diagramType:'flowchart-v2'});expect(init).not.toHaveBeenCalled();expect(draw).toHaveBeenCalledWith('secrets-lies-d1',`---\nconfig: ${JSON.stringify(diagramConfig)}\n---\nflowchart LR\nA-->B`);
 }finally{draw.mockRestore();init.mockRestore();}
},20000);

test('all 42 exact definitions parse including pie, sequence and domain map',async()=>{
 const {diagrams}=await import('./diagrams');const {default:mermaid}=await import('mermaid');expect(Object.keys(diagrams)).toHaveLength(42);for(const definition of Object.values(diagrams))expect(await mermaid.parse(definition)).toBeTruthy();
},20000);
test('lazy engine loader disables Mermaid auto-start on the shared instance without initializing it',async()=>{
 const {default:mermaid}=await import('mermaid');const {renderDiagram}=await import(new URL('./MermaidFigure.tsx',import.meta.url).href);
 const initialize=spyOn(mermaid,'initialize');const render=spyOn(mermaid,'render').mockResolvedValue({svg:'<svg></svg>',diagramType:'flowchart'});
 try{await renderDiagram('sl-auto-start','flowchart LR\nA-->B');expect(mermaid.startOnLoad).toBe(false);expect(initialize).not.toHaveBeenCalled();expect(render).toHaveBeenCalledTimes(1);}
 finally{initialize.mockRestore();render.mockRestore();}
});

test('diagram container is a labelled group so its description and retry controls stay accessible',async()=>{
 const {MermaidFigure}=await import(new URL('./MermaidFigure.tsx',import.meta.url).href);
 const original=globalThis.IntersectionObserver;globalThis.IntersectionObserver=undefined as unknown as typeof IntersectionObserver;
 try{const view=render(createElement(MermaidFigure,{id:'d0',source:'flowchart LR\nA-->B',label:'図ラベル',renderer:async()=>({svg:'<svg viewBox="0 0 10 10"></svg>'})}));const figure=view.container.querySelector('.diagram');expect(figure).toHaveAttribute('role','group');expect(figure).toHaveAttribute('aria-label','図ラベル');await waitFor(()=>expect(view.container.querySelector('.diagram-viewport')).toHaveAttribute('role','img'));}
 finally{globalThis.IntersectionObserver=original;}
});
