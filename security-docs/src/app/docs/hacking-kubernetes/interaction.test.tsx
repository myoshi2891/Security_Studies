import { afterEach, expect, spyOn, test } from 'bun:test';
import { createElement } from 'react';
import { act, cleanup, fireEvent, render, waitFor } from '@testing-library/react';
afterEach(()=>{cleanup();window.history.replaceState(null,'','/');});
test('mobile drawer opens, traps focus, closes with Escape, backdrop and selection, and restores body scrolling',async()=>{
 const {GuideSidebar}=await import(new URL('./GuideSidebar.tsx',import.meta.url).href);
 const nav=createElement('nav',{},createElement('ul',{},createElement('li',{className:'top'},createElement('a',{href:'#s0'},'章'),createElement('ul',{className:'sub'},createElement('li',{},createElement('a',{href:'#s0-1'},'小節'))))));
 const {container}=render(createElement('div',{className:'kubernetes-guide'},createElement(GuideSidebar,{},nav),createElement('section',{id:'s0'}),createElement('section',{id:'s0-1'})));
 const toggle=container.querySelector<HTMLButtonElement>('#navToggle')!;
 fireEvent.click(toggle);expect(toggle).toHaveAttribute('aria-expanded','true');expect(document.body.style.overflow).toBe('hidden');
 const links=container.querySelectorAll<HTMLAnchorElement>('nav a');expect(document.activeElement).toBe(links[0]);links[1].focus();fireEvent.keyDown(document,{key:'Tab'});expect(document.activeElement).toBe(links[0]);
 fireEvent.keyDown(document,{key:'Escape'});expect(toggle).toHaveAttribute('aria-expanded','false');expect(document.activeElement).toBe(toggle);expect(document.body.style.overflow).toBe('');
 fireEvent.click(toggle);fireEvent.click(container.querySelector('#backdrop')!);expect(toggle).toHaveAttribute('aria-expanded','false');
 fireEvent.click(toggle);fireEvent.click(links[1]);expect(toggle).toHaveAttribute('aria-expanded','false');expect(links[1]).toHaveAttribute('aria-current','location');expect(links[1].closest('.top')).toHaveClass('open');
});
test('hash navigation selects the subsection and its parent; observers and listeners clean up',async()=>{
 const {GuideSidebar}=await import(new URL('./GuideSidebar.tsx',import.meta.url).href);
 const original=globalThis.IntersectionObserver;let callback:IntersectionObserverCallback|undefined;let disconnect=0;const targets:Element[]=[];
 globalThis.IntersectionObserver=class{constructor(cb:IntersectionObserverCallback){callback=cb;}observe(el:Element){targets.push(el);}disconnect(){disconnect++;}} as unknown as typeof IntersectionObserver;
 try{
 const {container,unmount}=render(createElement('div',{className:'kubernetes-guide'},createElement(GuideSidebar,{},createElement('nav',{},createElement('ul',{},createElement('li',{className:'top'},createElement('a',{href:'#s0'},'章'),createElement('ul',{className:'sub'},createElement('li',{},createElement('a',{href:'#s0-1'},'小節'))))))),createElement('section',{id:'s0'}),createElement('section',{id:'s0-1'})));
 expect(targets.map(el=>el.id)).toEqual(['s0','s0-1']);
 act(()=>{(window as unknown as import('happy-dom').Window).happyDOM.setURL('http://localhost/docs/hacking-kubernetes#s0-1');window.dispatchEvent(new Event('hashchange'));});
 expect(container.querySelector('[href="#s0-1"]')).toHaveAttribute('aria-current','location');
 act(()=>callback!([{target:targets[0],isIntersecting:true} as IntersectionObserverEntry],{} as IntersectionObserver));expect(container.querySelector('[href="#s0"]')).toHaveAttribute('aria-current','location');unmount();expect(disconnect).toBe(1);
 }finally{globalThis.IntersectionObserver=original;}
});
test('checklist progress increments, decrements and resets on remount without mutating the source labels',async()=>{
 const {GuideRuntime}=await import(new URL('./GuideRuntime.tsx',import.meta.url).href);
 const tree=createElement(GuideRuntime,{},createElement('span',{id:'chkDone'},'0'),createElement('div',{className:'check-card'},createElement('label',{},createElement('input',{type:'checkbox'}),'確認')));
 const view=render(tree);const input=view.container.querySelector('input')!;
 fireEvent.click(input);expect(view.container.querySelector('#chkDone')).toHaveTextContent('1');fireEvent.click(input);expect(view.container.querySelector('#chkDone')).toHaveTextContent('0');view.unmount();
 const again=render(tree);expect(again.container.querySelector('#chkDone')).toHaveTextContent('0');
});
test('Mermaid retains unique IDs and intrinsic size, exposes failure definitions and ignores stale results',async()=>{
 const {MermaidFigure}=await import(new URL('./MermaidFigure.tsx',import.meta.url).href);
 const original=globalThis.IntersectionObserver;globalThis.IntersectionObserver=undefined as unknown as typeof IntersectionObserver;
 const messages=spyOn(console,'error').mockImplementation(()=>{});
 try{
 const ids:string[]=[];const renderer=async(id:string)=>{ids.push(id);return {svg:'<svg viewBox="0 0 1800 300" width="100%" style="max-width:100%"><text>図</text></svg>'};};
 const view=render(createElement('div',{},createElement(MermaidFigure,{id:'d1',source:'flowchart LR\nA-->B',renderer}),createElement(MermaidFigure,{id:'d2',source:'flowchart LR\nA-->B',renderer})));
 await waitFor(()=>expect(view.container.querySelectorAll('svg')).toHaveLength(2));expect(new Set(ids).size).toBe(2);expect(view.container.querySelector('svg')!.style.width).toBe('1800px');expect(view.container.querySelector('svg')!.style.maxWidth).toBe('none');expect(view.container.querySelector('[role="img"]')).toHaveAttribute('tabindex','0');
 let finish:((value:{svg:string})=>void)|undefined;
 const deferred=()=>new Promise<{svg:string}>(resolve=>{finish=resolve;});
 const pending=render(createElement(MermaidFigure,{id:'d1',source:'old',renderer:deferred}));
 pending.rerender(createElement(MermaidFigure,{id:'d1',source:'new',renderer:async()=>{throw new Error('broken');}}));await waitFor(()=>expect(pending.container.querySelector('[role="alert"]')).not.toBeNull());expect(pending.container.querySelector('pre')).toHaveTextContent('new');
 await act(async()=>finish!({svg:'<svg viewBox="0 0 10 10"></svg>'}));expect(pending.container.querySelector('svg')).toBeNull();
 }finally{globalThis.IntersectionObserver=original;messages.mockRestore();}
});
test('all twelve diagram definitions parse in the real Mermaid engine and retain per-diagram settings and dark theme',async()=>{
 const {diagrams,diagramOverrides}=await import(new URL('./diagrams.ts',import.meta.url).href);
 const {definitions,sourceHtml}=await import('./fidelity-helpers');expect(Object.entries(diagrams)).toEqual([...definitions]);expect(definitions.size).toBe(12);
 const {default:mermaid}=await import('mermaid');mermaid.initialize({startOnLoad:false,securityLevel:'strict'});for(const [id,source] of definitions)expect(await mermaid.parse(source),id).toBeTruthy();
 expect(diagramOverrides).toEqual(JSON.parse(sourceHtml.match(/window.DIAGRAM_CFG = (.*);/)![1]));
 const component=(await import('node:fs')).readFileSync(new URL('./MermaidFigure.tsx',import.meta.url),'utf8');
 for(const [,key,value] of sourceHtml.match(/themeVariables:\s*\{([\s\S]*?)\n\s*\}/)![1].matchAll(/(\w+):\s*'([^']*)'/g))expect(component).toContain(`${key}: '${value}'`);
});

test('mobile focus wrapping excludes collapsed submenu links and preserves focus in the shared header',async()=>{
 const {GuideSidebar}=await import(new URL('./GuideSidebar.tsx',import.meta.url).href);
 const group=(id:string)=>createElement('li',{className:'top'},createElement('a',{href:`#${id}`},id),createElement('ul',{className:'sub'},createElement('li',{},createElement('a',{href:`#${id}-1`},`${id}-1`))));
 const {container}=render(createElement('div',{},createElement('header',{className:'docs-header'},createElement('button',{id:'search-button'},'検索')),createElement('div',{className:'kubernetes-guide'},createElement(GuideSidebar,{},createElement('nav',{},createElement('ul',{},group('s0'),group('s1')))))));
 const toggle=container.querySelector<HTMLButtonElement>('#navToggle')!;fireEvent.click(toggle);
 const first=container.querySelector<HTMLAnchorElement>('[href="#s0"]')!;first.focus();fireEvent.keyDown(document,{key:'Tab',shiftKey:true});
 expect(document.activeElement===container.querySelector('[href="#s1"]')).toBe(true);
 const search=container.querySelector<HTMLButtonElement>('#search-button')!;search.focus();fireEvent.pointerDown(search);expect(toggle).toHaveAttribute('aria-expanded','false');expect(document.activeElement===search).toBe(true);
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
test('the bundled renderer uses per-diagram settings without mutating the shared Mermaid engine',async()=>{
 const {default:mermaid}=await import('mermaid');const calls:[string,string][]=[];
 const init=spyOn(mermaid,'initialize');
 const draw=spyOn(mermaid,'render').mockImplementation(async(id:string,source:string)=>{calls.push([id,source]);return {svg:'<svg></svg>',diagramType:'flowchart-v2'};});
 try{
  const {renderDiagram}=await import(new URL('./MermaidFigure.tsx',import.meta.url).href);
  const source='flowchart LR\nA-->B';
  await Promise.all([renderDiagram('kubernetes-mermaid-d2-one',source),renderDiagram('kubernetes-mermaid-d5-two',source)]);
  expect(init).not.toHaveBeenCalled();expect(calls).toHaveLength(2);
  for(const [index,[id,definition]] of calls.entries()){
   expect(id).toBe(index===0?'kubernetes-mermaid-d2-one':'kubernetes-mermaid-d5-two');
   const config=JSON.parse(definition.match(/^---\nconfig: (.+)\n---\n/)![1]);
   expect(config).toMatchObject({theme:'dark',securityLevel:'strict',flowchart:{wrappingWidth:index===0?150:100,nodeSpacing:index===0?45:25,rankSpacing:50,curve:'basis'}});
   expect(definition.endsWith(source)).toBe(true);
  }
 }finally{init.mockRestore();draw.mockRestore();}
});
test('local icons retain their source classes and decorative SVG semantics',async()=>{
 const {GuideIcon}=await import(new URL('./GuideIcon.tsx',import.meta.url).href);
 for(const name of ['ti-shield-lock','ti-external-link'] as const){const {container}=render(createElement(GuideIcon,{name}));expect(container.querySelector(`i.ti.${name}`)).toHaveAttribute('aria-hidden','true');expect(container.querySelector('svg')).toHaveAttribute('aria-hidden','true');}
});
