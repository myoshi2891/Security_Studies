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
test('keyboard focus wraps through every visible link and malformed fragments remain safe',async()=>{
 const view=await mounted();fireEvent.click(view.container.querySelector('#menuBtn')!);
 const links=[...view.container.querySelectorAll<HTMLAnchorElement>('nav a')];
 links.at(-1)!.focus();fireEvent.keyDown(document,{key:'Tab'});expect(document.activeElement).toBe(links[0]);
 fireEvent.keyDown(document,{key:'Tab',shiftKey:true});expect(document.activeElement).toBe(links.at(-1)!);
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
 const link=(id:string)=>h('a',{href:'#'+id},id);
 const view=render(h('div',{className:'issmp-guide'},h(GuideSidebar,{children:h('nav',{},h('div',{className:'nav-group'},link('s1'),h('ul',{},h('li',{},link('s2')))),h('div',{className:'nav-group'},link('s3')))}),h('div',{className:'guide-content'},...['s1','s2','s3'].map(id=>h('section',{id,key:id},h('h2',{},id))))));
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
