import { afterEach, expect, test } from 'bun:test';
import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { createElement as h } from 'react';
import { GuideSidebar } from './GuideSidebar';
import { evaluatedPage, renderedPage } from './fidelity-helpers';
afterEach(()=>{cleanup();window.history.replaceState(null,'','/');});
async function mounted(){const {default:Page}=await evaluatedPage();return render(h(Page,{}));}

test('all 50 original TOC links target their matching sections', async()=>{
 const d=await renderedPage();const links=[...d.querySelectorAll('.sidebar nav a')];expect(links).toHaveLength(50);
 for(const link of links)expect(d.getElementById(link.getAttribute('href')!.slice(1))).not.toBeNull();
});
test('mobile menu closes with Escape, backdrop, toggle and resize; restores body scroll, focus and inert',async()=>{
 const view=await mounted(),btn=view.container.querySelector<HTMLButtonElement>('#menuBtn')!,content=view.container.querySelector<HTMLElement>('.guide-content')!;
 for(const method of ['escape','backdrop','toggle','resize']){
  fireEvent.click(btn);expect(btn).toHaveAttribute('aria-expanded','true');expect(document.body.style.overflow).toBe('hidden');expect(content.inert).toBe(true);expect(view.container.querySelector('aside')!.contains(document.activeElement)).toBe(true);
  if(method==='escape')fireEvent.keyDown(document,{key:'Escape'});
  if(method==='backdrop')fireEvent.click(view.container.querySelector('#backdrop')!);
  if(method==='toggle')fireEvent.click(btn);
  if(method==='resize')fireEvent(window,new Event('resize'));
  expect(btn).toHaveAttribute('aria-expanded','false');expect(content.inert).toBe(false);expect(document.body.style.overflow).not.toBe('hidden');
  if(method!=='toggle')expect(document.activeElement).toBe(btn);
 }
 fireEvent.click(btn);view.unmount();expect(document.body.style.overflow).not.toBe('hidden');expect(content.inert).toBe(false);
});
test('keyboard focus wraps through the links and close button and malformed fragments remain safe',async()=>{
 const view=await mounted(),button=view.container.querySelector<HTMLButtonElement>('#menuBtn')!;fireEvent.click(button);
 const links=[...view.container.querySelectorAll<HTMLAnchorElement>('nav a')];
 // The browser handles the adjacent link/button steps; only the boundaries wrap.
 links.at(-1)!.focus();expect(fireEvent.keyDown(document,{key:'Tab'})).toBe(true);
 button.focus();fireEvent.keyDown(document,{key:'Tab'});expect(document.activeElement).toBe(links[0]);
 fireEvent.keyDown(document,{key:'Tab',shiftKey:true});expect(document.activeElement).toBe(button);
 expect(fireEvent.keyDown(document,{key:'Tab',shiftKey:true})).toBe(true);
 window.history.replaceState(null,'','#%');expect(()=>fireEvent(window,new Event('hashchange'))).not.toThrow();
});
test('every TOC jump closes the drawer, preserves the selected link and focuses the correct heading',async()=>{
 const view=await mounted(),button=view.container.querySelector('#menuBtn')!;
 for(const link of view.container.querySelectorAll<HTMLAnchorElement>('nav a')){
  fireEvent.click(button);fireEvent.click(link);expect(button).toHaveAttribute('aria-expanded','false');expect(link).toHaveAttribute('aria-current','location');
  expect(document.activeElement?.closest('section')?.id||document.activeElement?.id).toBe(link.hash.slice(1));
  expect(view.container.querySelectorAll('nav a[aria-current]')).toHaveLength(1);
 }
});
/** Drive source-section observer notifications without relying on a simulated layout. */
function observed(){
 const saved=globalThis.IntersectionObserver,observers:{callback:IntersectionObserverCallback;nodes:Element[];disconnected:boolean}[]=[];
 globalThis.IntersectionObserver=class{entry:{callback:IntersectionObserverCallback;nodes:Element[];disconnected:boolean};constructor(callback:IntersectionObserverCallback){this.entry={callback,nodes:[],disconnected:false};observers.push(this.entry);}observe(e:Element){this.entry.nodes.push(e);}disconnect(){this.entry.disconnected=true;}} as unknown as typeof IntersectionObserver;
 const link=(id:string,className?:string)=>h('a',{href:'#'+id,className},id);
 const view=render(h('div',{className:'issmp-guide'},h(GuideSidebar,{children:h('nav',{},h('div',{className:'nav-group'},link('s1','nav-h1'),h('ul',{},h('li',{},link('s2')))),h('div',{className:'nav-group'},link('s3','nav-h1')))}),h('div',{className:'guide-content'},...['s1','s2','s3'].map(id=>h('section',{id,key:id},h('h2',{},id))))));
 const notify=(id:string)=>{const target=view.container.querySelector('#'+id)!;for(const observer of observers.filter(o=>!o.disconnected&&o.nodes.includes(target)))act(()=>observer.callback([{target,isIntersecting:true} as IntersectionObserverEntry],{} as IntersectionObserver));};
 const current=()=>view.container.querySelector('nav [aria-current]')?.getAttribute('href');
 return {view,notify,current,restore:()=>{view.unmount();globalThis.IntersectionObserver=saved;},observers};
}
test.each(['click','initial','hashchange'])('a %s fragment keeps its selected subsection through competing observations',method=>{
 if(method==='initial')window.history.replaceState(null,'','#s2');const s=observed();try{
 if(method==='click')fireEvent.click(s.view.container.querySelector('a[href="#s2"]')!);
 if(method==='hashchange'){window.history.replaceState(null,'','#s2');fireEvent(window,new Event('hashchange'));}
 s.notify('s3');expect(s.current()).toBe('#s2');fireEvent.wheel(window);expect(s.current()).toBe('#s3');
 }finally{s.restore();}
});
test('observers follow reading order, refresh on resize and disconnect on unmount',()=>{
 const s=observed();try{s.notify('s2');expect(s.current()).toBe('#s2');s.notify('s3');expect(s.current()).toBe('#s3');const old=s.observers.slice();fireEvent(window,new Event('resize'));expect(old.every(o=>o.disconnected)).toBe(true);}finally{s.restore();}expect(s.observers.every(o=>o.disconnected)).toBe(true);
});
test('a pinned entry survives its own jump and sub-pixel drift, then releases once the reader scrolls it away',async()=>{
 const s=observed();try{
  // Arrange: 固定前のスクロールは何もしない。クリックで s2 を固定し、着地後の位置を記録させる
  let top=0;s.view.container.querySelector<HTMLElement>('#s2')!.getBoundingClientRect=()=>({top,bottom:top+40} as DOMRect);
  const before=s.current();fireEvent.scroll(window);expect(s.current()).toBe(before);
  fireEvent.click(s.view.container.querySelector('a[href="#s2"]')!);
  fireEvent.scroll(window);await new Promise(resolve=>setTimeout(resolve,200));
  s.notify('s3');expect(s.current()).toBe('#s2');
  // Act/Assert: 2px 以内の揺れでは固定を維持し、見出しが離れたら監視の選択へ戻す
  top=1;fireEvent.scroll(window);expect(s.current()).toBe('#s2');
  top=-400;fireEvent.scroll(window);expect(s.current()).toBe('#s3');
 }finally{s.restore();}
});
test.each([['s2','#s1'],[null,'#s3']] as const)('widening to desktop returns focus from the menu button to the chapter of the selection (%s)',(observedId,chapter)=>{
 const previousWidth=Object.getOwnPropertyDescriptor(window,'innerWidth');
 const s=observed();try{
  // Arrange: s2 を観測すれば章 s1 配下、観測しなければ初期追跡の s3（章リンク自身）が選択される
  if(observedId)s.notify(observedId);
  s.view.container.querySelector<HTMLButtonElement>('#menuBtn')!.focus();
  // Act
  Object.defineProperty(window,'innerWidth',{configurable:true,value:1440});fireEvent(window,new Event('resize'));
  // Assert: 選択中リンクが属する章見出しリンクへフォーカスする
  expect(document.activeElement?.getAttribute('href')).toBe(chapter);
 }finally{
  s.restore();
  if(previousWidth)Object.defineProperty(window,'innerWidth',previousWidth);else Reflect.deleteProperty(window,'innerWidth');
 }
});
