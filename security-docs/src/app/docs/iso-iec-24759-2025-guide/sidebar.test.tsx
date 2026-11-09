import {afterEach,expect,test} from 'bun:test';
import {readFileSync} from 'node:fs';
import {Window} from 'happy-dom';
import {createElement as h} from 'react';
import {act,cleanup,fireEvent,render} from '@testing-library/react';
import {GuideSidebar} from './GuideSidebar';
afterEach(()=>{cleanup();(window as unknown as Window).happyDOM.setURL('http://localhost/');});
// 原本に依存しない17章の目次。原本との一致は integration.test.tsx で検証する
const ids=Array.from({length:19},(_,i)=>'ch'+i);
const nav=()=>h('nav',{},ids.map((id,i)=>h('a',{href:`#${id}`,key:i},`章${i+1}`)));
const sections=()=>ids.map((id,i)=>h('section',{id,key:i},h('h2',{},`章${i+1}`)));
const harness=()=>h('div',{className:'iso24759-guide'},h(GuideSidebar,{children:nav()}),...sections());

test('the original nineteen links are focus trapped and Escape/background restore focus and scrolling',()=>{
 const view=render(harness());const btn=view.container.querySelector('#menuBtn')!;const links=view.container.querySelectorAll<HTMLAnchorElement>('nav a');expect(links).toHaveLength(19);
 fireEvent.click(btn);expect(btn).toHaveAttribute('aria-expanded','true');expect(document.body.style.overflow).toBe('hidden');expect(document.activeElement).toBe(links[0]);
 fireEvent.keyDown(document,{key:'Tab',shiftKey:true});expect(document.activeElement).toBe(links[18]);fireEvent.keyDown(document,{key:'Tab'});expect(document.activeElement).toBe(links[0]);
 fireEvent.keyDown(document,{key:'Escape'});expect(btn).toHaveAttribute('aria-expanded','false');expect(document.activeElement).toBe(btn);expect(document.body.style.overflow).toBe('');
 fireEvent.click(btn);fireEvent.click(view.container.querySelector('#backdrop')!);expect(btn).toHaveAttribute('aria-expanded','false');expect(document.activeElement).toBe(btn);
 fireEvent.click(btn);view.unmount();expect(document.body.style.overflow).toBe('');
});
test('selecting any original chapter from the open drawer closes it and focuses that chapter heading',()=>{
 const view=render(harness());const btn=view.container.querySelector('#menuBtn')!;
 for(let n=1;n<=19;n++){
  fireEvent.click(btn);const link=view.container.querySelector(`[href="#${ids[n-1]}"]`)!;fireEvent.click(link);
  expect(btn).toHaveAttribute('aria-expanded','false');expect(link).toHaveAttribute('aria-current','location');expect(document.activeElement).toBe(view.container.querySelector(`#${ids[n-1]} h2`));expect(document.body.style.overflow).toBe('');
 }
});
test.each([false,true])('Tab returns outside focus to the open drawer (Shift: %s)',shiftKey=>{
 const view=render(harness());const btn=view.container.querySelector<HTMLButtonElement>('#menuBtn')!;
 fireEvent.click(btn);btn.focus();
 const event=new KeyboardEvent('keydown',{key:'Tab',shiftKey,bubbles:true,cancelable:true});
 fireEvent(document,event);
 const links=view.container.querySelectorAll('nav a');
 expect(event.defaultPrevented).toBe(true);expect(document.activeElement).toBe(links[shiftKey?18:0]);
 // Interior focus keeps its normal Tab behavior.
 (links[5] as HTMLAnchorElement).focus();
 expect(fireEvent.keyDown(document,{key:'Tab',shiftKey})).toBe(true);
});
test('scroll tracking retains intersecting chapters across notifications and removes previous activation',()=>{
 const saved=globalThis.IntersectionObserver;let notify:IntersectionObserverCallback|undefined;let disconnected=0;const targets:Element[]=[];
 globalThis.IntersectionObserver=class{constructor(cb:IntersectionObserverCallback){notify=cb;}observe(el:Element){targets.push(el);}disconnect(){disconnected++;}} as unknown as typeof IntersectionObserver;
 try{const view=render(harness());expect(targets.map(t=>t.id)).toEqual(ids);
  targets[0].getBoundingClientRect=()=>({top:-100} as DOMRect);targets[1].getBoundingClientRect=()=>({top:100} as DOMRect);
  const change=(index:number,on:boolean)=>act(()=>notify!([{target:targets[index],isIntersecting:on} as IntersectionObserverEntry],{} as IntersectionObserver));
  change(0,true);change(1,true);expect(view.container.querySelector('[href="#ch1"]')).toHaveAttribute('aria-current','location');change(1,false);expect(view.container.querySelector('[href="#ch0"]')).toHaveAttribute('aria-current','location');expect(view.container.querySelector('[href="#ch1"]')).not.toHaveClass('active');
  view.unmount();expect(disconnected).toBe(1);
 }finally{globalThis.IntersectionObserver=saved;}
});
test('initial observer notification respects a hash chapter spanning the observer edge instead of a later chapter',()=>{
 const saved=globalThis.IntersectionObserver;let notify:IntersectionObserverCallback|undefined;
 globalThis.IntersectionObserver=class{constructor(cb:IntersectionObserverCallback){notify=cb;}observe(){}disconnect(){}} as unknown as typeof IntersectionObserver;
 try{
  (window as unknown as Window).happyDOM.setURL('http://localhost/#ch3');
  const view=render(harness());
  const earlier=view.container.querySelector('#ch3')!,later=view.container.querySelector('#ch4')!;
  earlier.getBoundingClientRect=()=>({top:150,bottom:230} as DOMRect);later.getBoundingClientRect=()=>({top:230,bottom:500} as DOMRect);
  const update=()=>act(()=>notify!([later,earlier].map(target=>({target,isIntersecting:true,rootBounds:{top:180,bottom:270}} as IntersectionObserverEntry)),{} as IntersectionObserver));
  update();expect(view.container.querySelector('[aria-current]')).toHaveAttribute('href','#ch3');
  earlier.getBoundingClientRect=()=>({top:-100,bottom:170} as DOMRect);later.getBoundingClientRect=()=>({top:170,bottom:500} as DOMRect);
  fireEvent.wheel(view.container);
  update();expect(view.container.querySelector('[aria-current]')).toHaveAttribute('href','#ch4');
 }finally{globalThis.IntersectionObserver=saved;}
});
test.each(['initial fragment','hashchange','click'])('%s stays selected through stale notifications until scrolling resumes',navigation=>{
 const saved=globalThis.IntersectionObserver;let notify:IntersectionObserverCallback|undefined;
 globalThis.IntersectionObserver=class{constructor(cb:IntersectionObserverCallback){notify=cb;}observe(){}disconnect(){}} as unknown as typeof IntersectionObserver;
 try{
  if(navigation==='initial fragment')(window as unknown as Window).happyDOM.setURL('http://localhost/#ch3');
  const view=render(harness());
  const previous=view.container.querySelector('#ch2')!,target=view.container.querySelector('#ch3')!;
  previous.getBoundingClientRect=()=>({top:-100} as DOMRect);target.getBoundingClientRect=()=>({top:240} as DOMRect);
  if(navigation==='hashchange')act(()=>{window.history.replaceState(null,'','#ch3');window.dispatchEvent(new Event('hashchange'));});
  if(navigation==='click')fireEvent.click(view.container.querySelector('a[href="#ch3"]')!);
  const update=()=>act(()=>notify!([previous,target].map(target=>({target,isIntersecting:true,rootBounds:{top:180}} as IntersectionObserverEntry)),{} as IntersectionObserver));
  update();expect(view.container.querySelector('[aria-current]')).toHaveAttribute('href','#ch3');
  fireEvent.keyDown(window,{key:'Tab'});update();expect(view.container.querySelector('[aria-current]')).toHaveAttribute('href','#ch3');
  fireEvent.keyDown(window,{key:'PageDown'});expect(view.container.querySelector('[aria-current]')).toHaveAttribute('href','#ch2');
 }finally{globalThis.IntersectionObserver=saved;}
});
test('scroll movement after a fragment jump settles restores observer selection',async()=>{
 const saved=globalThis.IntersectionObserver;let notify:IntersectionObserverCallback|undefined;
 globalThis.IntersectionObserver=class{constructor(cb:IntersectionObserverCallback){notify=cb;}observe(){}disconnect(){}} as unknown as typeof IntersectionObserver;
 try{
  (window as unknown as Window).happyDOM.setURL('http://localhost/#ch3');
  const view=render(harness()),target=view.container.querySelector('#ch3')!;
  let top=88;target.getBoundingClientRect=()=>({top} as DOMRect);
  act(()=>notify!([{target:view.container.querySelector('#ch2')!,isIntersecting:true} as IntersectionObserverEntry],{} as IntersectionObserver));
  fireEvent.scroll(window);await new Promise(resolve=>setTimeout(resolve,200));
  expect(view.container.querySelector('[aria-current]')).toHaveAttribute('href','#ch3');
  top=-400;fireEvent.scroll(window);expect(view.container.querySelector('[aria-current]')).toHaveAttribute('href','#ch2');
 }finally{globalThis.IntersectionObserver=saved;}
});
test('hash changes select the original chapter and closed-panel selection preserves link focus',()=>{
 const view=render(harness());act(()=>{(window as unknown as Window).happyDOM.setURL('http://localhost/#ch16');window.dispatchEvent(new Event('hashchange'));});const link=view.container.querySelector<HTMLAnchorElement>('[href="#ch16"]')!;expect(link).toHaveAttribute('aria-current','location');link.focus();fireEvent.click(link);expect(document.activeElement).toBe(link);expect(view.container.querySelector('#menuBtn')).toHaveAttribute('aria-expanded','false');
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

test('scroll tracking scrolls the original aside viewport instead of the inner nav',()=>{
 const saved=globalThis.IntersectionObserver;let notify:IntersectionObserverCallback|undefined;const targets:Element[]=[];
 globalThis.IntersectionObserver=class{constructor(cb:IntersectionObserverCallback){notify=cb;}observe(e:Element){targets.push(e);}disconnect(){}} as unknown as typeof IntersectionObserver;
 try{const view=render(harness());const nav=view.container.querySelector('nav')!,aside=view.container.querySelector('aside')!,link=nav.querySelector('[href="#ch10"]')!;
 Object.defineProperty(aside,'clientHeight',{configurable:true,value:120});aside.getBoundingClientRect=()=>({top:80,bottom:200} as DOMRect);link.getBoundingClientRect=()=>({top:500,bottom:520} as DOMRect);
 act(()=>notify!([{target:targets.find(t=>t.id==='ch10')!,isIntersecting:true} as IntersectionObserverEntry],{} as IntersectionObserver));
 expect(aside.scrollTop).toBeCloseTo(380);expect(nav.scrollTop).toBe(0);
 }finally{globalThis.IntersectionObserver=saved;}
});
test('the drawer toggle carries the original menu-btn class targeted by the guide stylesheet',()=>{
 const css=readFileSync(new URL('./guide.css',import.meta.url),'utf8');
 expect(css).toContain('.iso24759-guide.iso24759-guide .menu-btn');
 const view=render(harness());
 expect(view.container.querySelector('#menuBtn')).toHaveClass('menu-btn');
});
test('an undecodable fragment selects nothing and still registers the listeners and scroll tracking',()=>{
 const saved=globalThis.IntersectionObserver;const targets:Element[]=[];
 globalThis.IntersectionObserver=class{observe(e:Element){targets.push(e);}disconnect(){}} as unknown as typeof IntersectionObserver;
 try{
  (window as unknown as Window).happyDOM.setURL('http://localhost/#%E0%A4%A');
  const view=render(harness());
  expect(view.container.querySelectorAll('[aria-current]')).toHaveLength(0);expect(targets.map(t=>t.id)).toEqual(ids);
  expect(()=>act(()=>{window.dispatchEvent(new Event('hashchange'));})).not.toThrow();expect(view.container.querySelectorAll('[aria-current]')).toHaveLength(0);
  const link=view.container.querySelector<HTMLAnchorElement>('[href="#ch3"]')!;fireEvent.click(link);expect(link).toHaveAttribute('aria-current','location');
 }finally{globalThis.IntersectionObserver=saved;}
});
test('without a URL fragment the first link is selected even when its chapter ID is percent-encoded Japanese',()=>{
 const id='0-本ガイドの読み方';
 // 実ブラウザの a.hash はパーセントエンコード済みだが Happy DOM は生の値を返すため、href で同じ状態を作る
 const view=render(h('div',{className:'iso24759-guide'},h(GuideSidebar,{children:h('nav',{},h('a',{href:`#${encodeURIComponent(id)}`},'第0章'),h('a',{href:'#ch1'},'第1章'))}),h('section',{id},h('h2',{},'第0章'))));
 expect(view.container.querySelector('nav a')).toHaveAttribute('aria-current','location');
});
