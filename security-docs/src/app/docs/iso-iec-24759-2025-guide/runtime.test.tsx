import { afterEach, expect, spyOn, test } from 'bun:test';
import { createElement } from 'react';
import { act, cleanup, render, waitFor } from '@testing-library/react';
afterEach(()=>{cleanup();window.history.replaceState(null,'','/');});
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
 expect(describeDiagram('flowchart LR\nA["入力"] --> B["処理"] --> C["出力"]')).toEqual(['フローチャート','入力 → 処理','処理 → 出力']);
 expect(describeDiagram('sequenceDiagram\nA->>B: 要求<br/>送信')).toEqual(['シーケンス図','A->>B: 要求 送信']);
});
test('state diagram descriptions name the start and end pseudo states, keep labels and retain non-transition lines',async()=>{
 const {describeDiagram}=await import(new URL('./MermaidFigure.tsx',import.meta.url).href);
 expect(describeDiagram('stateDiagram-v2\n[*] --> 起動\n起動 --> 運用: 自己テスト<br/>合格\n起動 --> エラー\nエラー --> [*]\nnote right of エラー: 出力<br/>禁止')).toEqual(['ステート図','[*]（開始） → 起動','起動 → 運用: 自己テスト 合格','起動 → エラー','エラー → [*]（終了）','note right of エラー: 出力 禁止']);
 const {diagrams}=await import('./diagrams');const description=describeDiagram(diagrams.d5);
 expect(description.slice(0,4)).toEqual(['ステート図','[*]（開始） → 電源投入','電源投入 → 起動時自己テスト','起動時自己テスト → 通常動作: 合格']);
 expect(description).toContain('エラー状態 → 初期化状態: 回復可能なエラーで 再初期化');expect(description).toContain('ハードエラー → [*]（終了）');expect(description.some((line:string)=>line.includes('-->'))).toBe(false);
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

test('all 8 exact definitions parse including flowchart and sequence diagrams',async()=>{
 const {diagrams}=await import('./diagrams');const {default:mermaid}=await import('mermaid');expect(Object.keys(diagrams)).toHaveLength(8);for(const definition of Object.values(diagrams))expect(await mermaid.parse(definition)).toBeTruthy();
},20000);
test('lazy engine loader disables Mermaid auto-start on the shared instance without initializing it',async()=>{
 const {default:mermaid}=await import('mermaid');const {renderDiagram}=await import(new URL('./MermaidFigure.tsx',import.meta.url).href);
 const initialize=spyOn(mermaid,'initialize');const render=spyOn(mermaid,'render').mockResolvedValue({svg:'<svg></svg>',diagramType:'flowchart'});
 try{await renderDiagram('sl-auto-start','flowchart LR\nA-->B');expect(mermaid.startOnLoad).toBe(false);expect(initialize).not.toHaveBeenCalled();expect(render).toHaveBeenCalledTimes(1);}
 finally{initialize.mockRestore();render.mockRestore();}
});

test('the figure is a labelled group so its text description stays readable, with the image role only on the rendered SVG viewport',async()=>{
 const {MermaidFigure}=await import(new URL('./MermaidFigure.tsx',import.meta.url).href);
 const original=globalThis.IntersectionObserver;globalThis.IntersectionObserver=undefined as unknown as typeof IntersectionObserver;
 try{
 const view=render(createElement(MermaidFigure,{id:'d2',source:'flowchart LR\nA["入力"] --> B["出力"]',ariaLabel:'入出力の図',renderer:async()=>({svg:'<svg viewBox="0 0 200 100"><text>図</text></svg>'})}));
 const figure=view.container.querySelector('.mmd')!;
 // 描画中も status が読み上げから消えないよう、外側は常に group
 expect(figure).toHaveAttribute('role','group');expect(figure).toHaveAttribute('aria-label','入出力の図');
 await waitFor(()=>expect(view.container.querySelector('svg')).not.toBeNull());
 expect(figure).toHaveAttribute('role','group');
 const viewport=view.container.querySelector('.diagram-viewport')!;
 expect(viewport).toHaveAttribute('role','img');expect(viewport).toHaveAttribute('aria-label','入出力の図');
 const description=view.container.querySelector('.diagram-description')!;
 expect(description.closest('[role="img"]')).toBeNull();
 expect([...description.querySelectorAll('li')].map(li=>li.textContent)).toEqual(['フローチャート','入力 → 出力']);
 }finally{globalThis.IntersectionObserver=original;}
});

test('failed and stale renders remove only their own temporary output from document.body, even after unmount',async()=>{
 const {MermaidFigure}=await import(new URL('./MermaidFigure.tsx',import.meta.url).href);
 const original=globalThis.IntersectionObserver;globalThis.IntersectionObserver=undefined as unknown as typeof IntersectionObserver;
 const messages=spyOn(console,'error').mockImplementation(()=>{});
 // Mermaid は描画中に #d{id} を body 直下へ置き、構文エラーではこれを残したまま失敗する
 const temporary=(id:string)=>{const node=document.createElement('div');node.id='d'+id;document.body.append(node);return node;};
 const figures=()=>document.body.querySelectorAll(':scope > [id^="diso24759-mermaid-"]');
 try{
  const failed=render(createElement(MermaidFigure,{id:'d1',source:'broken',renderer:async(id:string)=>{temporary(id);throw new Error('parse');}}));
  await waitFor(()=>expect(failed.container.querySelector('[role="alert"]')).not.toBeNull());expect(figures()).toHaveLength(0);failed.unmount();

  const settle:Array<()=>void>=[];const pendingRender=(id:string)=>new Promise<{svg:string}>((resolve,reject)=>{temporary(id);settle.push(()=>reject(new Error('late')));});
  const unmounted=render(createElement(MermaidFigure,{id:'d2',source:'a',renderer:pendingRender}));await waitFor(()=>expect(figures()).toHaveLength(1));
  // 描画中の一時要素は Mermaid が使用中なので、アンマウント時点では取り除かず、完了時に片付ける
  unmounted.unmount();expect(figures()).toHaveLength(1);await act(async()=>settle[0]());expect(figures()).toHaveLength(0);

  let finishOld:((value:{svg:string})=>void)|undefined;const ids:string[]=[];
  const stale=render(createElement(MermaidFigure,{id:'d3',source:'old',renderer:(id:string)=>{ids.push(id);temporary(id);return new Promise<{svg:string}>(resolve=>{finishOld=resolve;});}}));
  await waitFor(()=>expect(figures()).toHaveLength(1));
  let finishNew:((value:{svg:string})=>void)|undefined;
  stale.rerender(createElement(MermaidFigure,{id:'d3',source:'new',renderer:(id:string)=>{ids.push(id);temporary(id);return new Promise<{svg:string}>(resolve=>{finishNew=resolve;});}}));
  await waitFor(()=>expect(figures()).toHaveLength(2));expect(new Set(ids).size).toBe(2);
  await act(async()=>finishOld!({svg:'<svg viewBox="0 0 10 10"></svg>'}));
  expect(document.getElementById('d'+ids[0])).toBeNull();expect(document.getElementById('d'+ids[1])).not.toBeNull();
  await act(async()=>finishNew!({svg:'<svg viewBox="0 0 10 10"></svg>'}));expect(stale.container.querySelector('svg')).not.toBeNull();expect(figures()).toHaveLength(0);
 }finally{for(const node of figures())node.remove();globalThis.IntersectionObserver=original;messages.mockRestore();}
});
