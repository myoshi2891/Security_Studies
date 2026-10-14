import {afterEach,expect,test} from 'bun:test';
import {createElement as h} from 'react';
import {act,cleanup,fireEvent,render} from '@testing-library/react';
afterEach(()=>{cleanup();window.history.replaceState(null,'','/');});
const nav=()=>h('nav',{},h('ul',{},h('li',{},h('a',{href:'#sec-5','data-target':'sec-5'},'親')),h('li',{className:'nav-sub'},h('a',{href:'#step-1','data-target':'step-1','data-parent':'sec-5'},'手順')),h('li',{},h('a',{href:'#sec-6','data-target':'sec-6'},'次'))));
test('flat mobile TOC traps all visible links, closes on Escape/background/selection and restores scrolling and focus',async()=>{
 const {GuideSidebar}=await import(new URL('./GuideSidebar.tsx',import.meta.url).href);
 const view=render(h('div',{className:'wahh-guide'},h(GuideSidebar,{},nav())));const btn=view.container.querySelector<HTMLButtonElement>('#menuBtn')!;const links=view.container.querySelectorAll<HTMLAnchorElement>('nav a');
 fireEvent.click(btn);expect(btn).toHaveAttribute('aria-expanded','true');expect(document.body.style.overflow).toBe('hidden');expect(document.activeElement).toBe(links[0]);
 links[0].focus();fireEvent.keyDown(document,{key:'Tab',shiftKey:true});expect(document.activeElement).toBe(links[2]);fireEvent.keyDown(document,{key:'Tab'});expect(document.activeElement).toBe(links[0]);
 fireEvent.keyDown(document,{key:'Escape'});expect(btn).toHaveAttribute('aria-expanded','false');expect(document.activeElement).toBe(btn);expect(document.body.style.overflow).toBe('');
 fireEvent.click(btn);fireEvent.click(view.container.querySelector('#backdrop')!);expect(btn).toHaveAttribute('aria-expanded','false');
 fireEvent.click(btn);fireEvent.click(links[1]);expect(btn).toHaveAttribute('aria-expanded','false');expect(links[1]).toHaveAttribute('aria-current','location');expect(links[0]).toHaveClass('active');expect(links[2]).not.toHaveClass('active');
 fireEvent.click(btn);view.unmount();expect(document.body.style.overflow).toBe('');
});
test('scroll tracking retains visible entries between callbacks, prioritizes the last step and clears obsolete parent activation',async()=>{
 const {GuideSidebar}=await import(new URL('./GuideSidebar.tsx',import.meta.url).href);
 const saved=globalThis.IntersectionObserver;let cb:IntersectionObserverCallback|undefined;let disconnected=0;const targets:Element[]=[];
 globalThis.IntersectionObserver=class{constructor(callback:IntersectionObserverCallback){cb=callback;}observe(el:Element){targets.push(el);}disconnect(){disconnected++;}} as unknown as typeof IntersectionObserver;
 try{const view=render(h('div',{className:'wahh-guide'},h(GuideSidebar,{},nav()),h('section',{id:'sec-5'},h('section',{id:'step-1',className:'step'})),h('section',{id:'sec-6'})));
 expect(targets.map(el=>el.id)).toEqual(['sec-5','step-1','sec-6']);
 const notify=(id:string,on:boolean)=>act(()=>cb!([{target:targets.find(e=>e.id===id),isIntersecting:on} as IntersectionObserverEntry],{} as IntersectionObserver));
 notify('step-1',true);notify('sec-6',true);expect(view.container.querySelector('[href="#step-1"]')).toHaveAttribute('aria-current','location');notify('step-1',false);expect(view.container.querySelector('[href="#sec-6"]')).toHaveAttribute('aria-current','location');expect(view.container.querySelector('[href="#sec-5"]')).not.toHaveClass('active');
 act(()=>{window.history.replaceState(null,'','/#step-1');window.dispatchEvent(new Event('hashchange'));});expect(view.container.querySelector('[href="#step-1"]')).toHaveAttribute('aria-current','location');view.unmount();expect(disconnected).toBe(1);
 }finally{globalThis.IntersectionObserver=saved;}
});
