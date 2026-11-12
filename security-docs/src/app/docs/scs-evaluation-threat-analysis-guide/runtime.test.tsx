import {afterEach,beforeEach,expect,test} from 'bun:test';
import {act,cleanup,fireEvent,render,waitFor} from '@testing-library/react';
import {createElement} from 'react';
import {MermaidFigure,sizeSvg} from './MermaidFigure';
import {GuideCode} from './GuideCode';
import {diagramConfig} from './diagrams';
import {evaluatedPage,sourceTest,sourceHtml} from './fidelity-helpers';
const savedObserver=globalThis.IntersectionObserver;
beforeEach(()=>{globalThis.IntersectionObserver=class {constructor(private callback:IntersectionObserverCallback){} observe(target:Element){this.callback([{target,isIntersecting:true} as IntersectionObserverEntry],this as unknown as IntersectionObserver);}disconnect(){}} as unknown as typeof IntersectionObserver;});
afterEach(()=>{cleanup();globalThis.IntersectionObserver=savedObserver;});
const svg='<svg viewBox="0 0 2400 120" width="2400" height="120"><text>図</text></svg>';
test('diagram rendering retains natural SVG width, readable height and overflow',()=>{
 const holder=document.createElement('div');holder.innerHTML=sizeSvg(svg);const s=holder.querySelector('svg')!;
 expect(s.getAttribute('viewBox')).toBe('0 0 2400 135');expect(s.hasAttribute('width')).toBe(false);expect(s.hasAttribute('height')).toBe(false);expect(s.style.width).toBe('2400px');expect(s.style.maxWidth).toBe('none');expect(s.style.height).toBe('auto');
});
test('diagram failure shows byte-exact source and allows a successful retry',async()=>{
 let calls=0;const source='flowchart TD\n A --> B';
 const renderer=async()=>{if(++calls===1)throw new Error('first failure');return{svg};};
 const {container,getByRole}=render(createElement(MermaidFigure,{id:'test',label:'図テスト',source,renderer}));
 await waitFor(()=>expect(getByRole('alert')).toBeDefined());expect(container.querySelector('pre')?.textContent).toBe(source);
 expect(getByRole('alert').closest('[role="img"]')===null).toBe(true);
 expect(container.querySelector('pre')?.closest('[role="img"]')===null).toBe(true);
 expect(getByRole('button',{name:'図の描画を再試行'}).closest('[role="img"]')===null).toBe(true);
 fireEvent.click(getByRole('button',{name:'図の描画を再試行'}));await waitFor(()=>expect(container.querySelector('svg')).not.toBeNull());expect(calls).toBe(2);expect(getByRole('img',{name:'図テスト'}).querySelector('svg')).not.toBeNull();
});
test('malformed renderer output follows the same visible failure path',async()=>{
 const {getByRole}=render(createElement(MermaidFigure,{id:'invalid',label:'図テスト',source:'flowchart TD\nA-->B',renderer:async()=>({svg:'invalid'})}));await waitFor(()=>expect(getByRole('alert')).toBeDefined());
});
test('a stale asynchronous diagram result cannot overwrite a changed source',async()=>{
 let finish!:(value:{svg:string})=>void;const renderer=()=>new Promise<{svg:string}>(resolve=>{finish=resolve;});
 const view=render(createElement(MermaidFigure,{id:'stale',label:'図テスト',source:'old',renderer}));
 await waitFor(()=>expect(finish).toBeDefined());const first=finish;
 view.rerender(createElement(MermaidFigure,{id:'stale',label:'図テスト',source:'new',renderer}));await act(async()=>{first({svg});});
 expect(view.container.querySelector('svg')).toBeNull();view.unmount();await act(async()=>{finish({svg});});
});
test('unsupported code languages retain literal text without unsafe markup',()=>{
 const source='<script>alert("x")</script>\n  & unchanged';const {container}=render(createElement(GuideCode,{source,className:'language-unsupported'}));expect(container.querySelector('code')?.textContent).toBe(source);expect(container.querySelector('script')).toBeNull();
});
test('closing or unmounting an open drawer restores scrolling and background access',async()=>{
 const saved=document.body.style.overflow;document.body.style.overflow='auto';const {default:Page}=await evaluatedPage();const view=render(createElement(Page,{}));
 fireEvent.click(view.container.querySelector('#menuBtn')!);expect(document.body.style.overflow).toBe('hidden');expect(view.container.querySelector<HTMLElement>('.guide-content')?.inert).toBe(true);view.unmount();expect(document.body.style.overflow).toBe('auto');document.body.style.overflow=saved;
});
sourceTest('diagram configuration retains source theme, spacing and Gantt options per render',()=>{
 const original=Function('return '+sourceHtml.match(/mermaid\.initialize\((\{[\s\S]*?\n\s*\})\);/)![1])();delete original.startOnLoad;original.securityLevel='strict';expect(diagramConfig).toEqual(original);
});

test('sequence diagrams retain original 110px padding even if SVG aria role uses the shorter sequence label',()=>{
 const holder=document.createElement('div');holder.innerHTML=sizeSvg('<svg viewBox="0 0 2400 120" aria-roledescription="sequence"></svg>','sequenceDiagram');expect(holder.querySelector('svg')?.getAttribute('viewBox')).toBe('0 0 2400 230');
});
