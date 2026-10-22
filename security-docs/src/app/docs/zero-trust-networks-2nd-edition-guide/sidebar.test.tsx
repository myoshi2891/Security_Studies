import {afterEach,expect,test} from 'bun:test';
import {Window} from 'happy-dom';
import {createElement as h} from 'react';
import {act,cleanup,fireEvent,render} from '@testing-library/react';
import {GuideSidebar} from './GuideSidebar';
afterEach(()=>{cleanup();(window as unknown as Window).happyDOM.setURL('http://localhost/');});
// 原本に依存しない25節の目次。原本との一致は integration.test.tsx で検証する
const ids=["intro-0", "intro-1", "intro-2", "intro-3", "intro-4", "ch1", "ch2", "ch3", "ch4", "ch5", "ch6", "ch7", "ch8", "ch9", "ch10", "ch11", "ch12", "appendix", "cross-a", "cross-b", "cross-c", "glossary", "quiz", "plan", "sources"];
const nav=()=>h('nav',{},ids.map((id,i)=>h('a',{href:`#${id}`,key:i},`章${i+1}`)));
const sections=()=>ids.map((id,i)=>h('section',{id,key:i},h('h2',{},`章${i+1}`)));
const harness=()=>h('div',{className:'zero-trust-guide'},h(GuideSidebar,{children:nav()}),...sections());

test('the original twenty-five links are focus trapped and Escape/background restore focus and scrolling',()=>{
 const view=render(harness());const btn=view.container.querySelector('#menuBtn')!;const links=view.container.querySelectorAll<HTMLAnchorElement>('nav a');expect(links).toHaveLength(25);
 fireEvent.click(btn);expect(btn).toHaveAttribute('aria-expanded','true');expect(document.body.style.overflow).toBe('hidden');expect(document.activeElement).toBe(links[0]);
 fireEvent.keyDown(document,{key:'Tab',shiftKey:true});expect(document.activeElement).toBe(links[24]);fireEvent.keyDown(document,{key:'Tab'});expect(document.activeElement).toBe(links[0]);
 fireEvent.keyDown(document,{key:'Escape'});expect(btn).toHaveAttribute('aria-expanded','false');expect(document.activeElement).toBe(btn);expect(document.body.style.overflow).toBe('');
 fireEvent.click(btn);fireEvent.click(view.container.querySelector('#backdrop')!);expect(btn).toHaveAttribute('aria-expanded','false');expect(document.activeElement).toBe(btn);
 fireEvent.click(btn);view.unmount();expect(document.body.style.overflow).toBe('');
});
test('selecting any original chapter from the open drawer closes it and focuses that chapter heading',()=>{
 const view=render(harness());const btn=view.container.querySelector('#menuBtn')!;
 for(let n=1;n<=25;n++){
  fireEvent.click(btn);const link=view.container.querySelector(`[href="#${ids[n-1]}"]`)!;fireEvent.click(link);
  expect(btn).toHaveAttribute('aria-expanded','false');expect(link).toHaveAttribute('aria-current','location');expect(document.activeElement).toBe(view.container.querySelector(`#${ids[n-1]} h2`));expect(document.body.style.overflow).toBe('');
 }
});
test('scroll tracking retains intersecting chapters across notifications and removes previous activation',()=>{
 const saved=globalThis.IntersectionObserver;let notify:IntersectionObserverCallback|undefined;let disconnected=0;const targets:Element[]=[];
 globalThis.IntersectionObserver=class{constructor(cb:IntersectionObserverCallback){notify=cb;}observe(el:Element){targets.push(el);}disconnect(){disconnected++;}} as unknown as typeof IntersectionObserver;
 try{const view=render(harness());expect(targets.map(t=>t.id)).toEqual(ids);
  const change=(index:number,on:boolean)=>act(()=>notify!([{target:targets[index],isIntersecting:on} as IntersectionObserverEntry],{} as IntersectionObserver));
  change(0,true);change(1,true);expect(view.container.querySelector('[href="#intro-1"]')).toHaveAttribute('aria-current','location');change(1,false);expect(view.container.querySelector('[href="#intro-0"]')).toHaveAttribute('aria-current','location');expect(view.container.querySelector('[href="#intro-1"]')).not.toHaveClass('active');
  view.unmount();expect(disconnected).toBe(1);
 }finally{globalThis.IntersectionObserver=saved;}
});
test('hash changes select the original chapter and closed-panel selection preserves link focus',()=>{
 const view=render(harness());act(()=>{(window as unknown as Window).happyDOM.setURL('http://localhost/#ch6');window.dispatchEvent(new Event('hashchange'));});const link=view.container.querySelector<HTMLAnchorElement>('[href="#ch6"]')!;expect(link).toHaveAttribute('aria-current','location');link.focus();fireEvent.click(link);expect(document.activeElement).toBe(link);expect(view.container.querySelector('#menuBtn')).toHaveAttribute('aria-expanded','false');
});
test('shared header interaction closes the drawer and resize restores desktop scrolling',()=>{
 const view=render(h('div',{},h('header',{className:'docs-header'},h('button',{},'検索')),harness()));const btn=view.container.querySelector('#menuBtn')!;
 fireEvent.click(btn);fireEvent.pointerDown(view.container.querySelector('.docs-header button')!);expect(btn).toHaveAttribute('aria-expanded','false');expect(document.activeElement).toBe(btn);
 const {innerWidth:width,innerHeight:height}=window;const viewport=(window as unknown as Window).happyDOM;
 const previousWidth=Object.getOwnPropertyDescriptor(window,'innerWidth');
 try{
  viewport.setWindowSize({width:1440,height:900});
  // Earlier suites may assign an own innerWidth property, shadowing Happy DOM's viewport getter.
  Object.defineProperty(window,'innerWidth',{configurable:true,writable:true,value:1440});
  expect(window.innerWidth).toBe(1440);fireEvent.click(btn);fireEvent(window,new Event('resize'));
  expect(btn).toHaveAttribute('aria-expanded','false');expect(document.body.style.overflow).toBe('');
 }finally{
  viewport.setWindowSize({width,height});
  if(previousWidth)Object.defineProperty(window,'innerWidth',previousWidth);else Reflect.deleteProperty(window,'innerWidth');
 }
});
