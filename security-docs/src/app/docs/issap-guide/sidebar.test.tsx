import {afterEach,expect,test} from 'bun:test';
import {act,cleanup,render,fireEvent} from '@testing-library/react';
import {createElement} from 'react';
import {evaluatedPage} from './fidelity-helpers';
afterEach(()=>{cleanup();window.history.replaceState(null,'','/');});
async function setup(observer?:typeof IntersectionObserver){const saved=globalThis.IntersectionObserver;globalThis.IntersectionObserver=observer??class{observe(){}disconnect(){}} as unknown as typeof IntersectionObserver;try{const {default:Page}=await evaluatedPage();return render(createElement(Page,{}));}finally{globalThis.IntersectionObserver=saved;}}
const click=async(e:Element|null)=>{expect(e).not.toBeNull();await act(async()=>{fireEvent.click(e!);});};
test('mobile drawer opens and closes with accessible names, original icons, Escape and restored scroll',async()=>{
 const v=await setup(),btn=v.container.querySelector('#menuBtn')!,previous=document.body.style.overflow;
 expect(btn).toHaveAttribute('aria-expanded','false');expect(btn).toHaveAttribute('aria-label','目次を開く');expect(btn.querySelector('i.ti-menu-2 svg')).not.toBeNull();
 await click(btn);expect(btn).toHaveAttribute('aria-expanded','true');expect(btn).toHaveAttribute('aria-label','目次を閉じる');expect(v.container.querySelector('#sidebar')).toHaveClass('open');expect(document.body.style.overflow).toBe('hidden');
 await act(async()=>{fireEvent.keyDown(document,{key:'Escape'});});expect(btn).toHaveAttribute('aria-expanded','false');expect(document.activeElement).toBe(btn);expect(document.body.style.overflow).toBe(previous);
});
test('Tab trapping includes visible chapter/subsection links and excludes collapsed subsection links',async()=>{
 const v=await setup();await click(v.container.querySelector('#menuBtn'));const visible=[...v.container.querySelectorAll<HTMLAnchorElement>('.nav-list>li>a,.nav-list>li.active .sub a')];expect(visible.length).toBeGreaterThan(13);expect(visible.length).toBeLessThan(47);
 visible.at(-1)!.focus();await act(async()=>{fireEvent.keyDown(document,{key:'Tab'});});expect(document.activeElement).toBe(visible[0]);
 visible[0].focus();await act(async()=>{fireEvent.keyDown(document,{key:'Tab',shiftKey:true});});expect(document.activeElement).toBe(visible.at(-1)!);
});
test('direct subsection hashes expand the parent, select the subsection and leave all other groups collapsed',async()=>{
 window.history.replaceState(null,'','#s7-3');const v=await setup();expect(v.container.querySelector('.nav-list>li[data-sec="s7"]')).toHaveClass('active');expect(v.container.querySelector('a[data-sub="s7-3"]')).toHaveClass('on');expect(v.container.querySelector('a[data-sub="s7-3"]')).toHaveAttribute('aria-current','location');expect(v.container.querySelectorAll('.nav-list>li.active')).toHaveLength(1);
 await act(async()=>{window.history.replaceState(null,'','#s8-2');fireEvent(window,new HashChangeEvent('hashchange'));});expect(v.container.querySelector('.nav-list>li[data-sec="s8"]')).toHaveClass('active');expect(v.container.querySelectorAll('.sub a.on')).toHaveLength(1);
});
test('selecting a chapter in the open mobile drawer closes it, preserves the hash and focuses its heading',async()=>{
 const v=await setup();await click(v.container.querySelector('#menuBtn'));await click(v.container.querySelector('a[href="#s3"]'));expect(v.container.querySelector('#menuBtn')).toHaveAttribute('aria-expanded','false');expect(window.location.hash).toBe('#s3');expect(document.activeElement).toBe(v.container.querySelector('#s3 h2'));
});
test('backdrop and crossing the desktop breakpoint close the drawer',async()=>{
 const v=await setup();await click(v.container.querySelector('#menuBtn'));await click(v.container.querySelector('#backdrop'));expect(v.container.querySelector('#menuBtn')).toHaveAttribute('aria-expanded','false');await click(v.container.querySelector('#menuBtn'));
 const descriptor=Object.getOwnPropertyDescriptor(window,'innerWidth');Object.defineProperty(window,'innerWidth',{configurable:true,value:1440});try{await act(async()=>{fireEvent(window,new Event('resize'));});expect(v.container.querySelector('#menuBtn')).toHaveAttribute('aria-expanded','false');}finally{if(descriptor)Object.defineProperty(window,'innerWidth',descriptor);else Reflect.deleteProperty(window,'innerWidth');}
});
test('scroll spy tracks both sections and h3, retains intersections across notifications and disconnects',async()=>{
 const observers:{cb:IntersectionObserverCallback;nodes:Element[];disconnected:boolean}[]=[];
 const Observer=class{record:{cb:IntersectionObserverCallback;nodes:Element[];disconnected:boolean};constructor(cb:IntersectionObserverCallback){this.record={cb,nodes:[],disconnected:false};observers.push(this.record);}observe(e:Element){this.record.nodes.push(e);}disconnect(){this.record.disconnected=true;}} as unknown as typeof IntersectionObserver;
 const v=await setup(Observer);const section=observers.find(o=>o.nodes.some(n=>n.id==='s7'))!;const subs=observers.find(o=>o.nodes.some(n=>n.id==='s7-3'))!;expect(section).toBeDefined();expect(subs).toBeDefined();
 const notify=(o:typeof section,id:string,yes:boolean)=>act(()=>{o.cb([{target:v.container.querySelector('#'+id)!,isIntersecting:yes}] as IntersectionObserverEntry[],{} as IntersectionObserver);});
 notify(section,'s5',true);notify(section,'s7',true);expect(v.container.querySelector('[data-sec="s7"]')).toHaveClass('active');notify(section,'s7',false);expect(v.container.querySelector('[data-sec="s5"]')).toHaveClass('active');
 notify(subs,'s7-3',true);expect(v.container.querySelector('[data-sub="s7-3"]')).toHaveClass('on');expect(v.container.querySelector('[data-sec="s7"]')).toHaveClass('active');v.unmount();expect(observers.every(o=>o.disconnected)).toBe(true);
});
test('the original aside owns scrolling and active items are brought into its viewport',async()=>{
 const v=await setup();const panel=v.container.querySelector<HTMLElement>('#sidebar')!,link=v.container.querySelector<HTMLElement>('a[href="#s13"]')!;Object.defineProperty(panel,'clientHeight',{configurable:true,value:500});link.getBoundingClientRect=()=>({top:1200,bottom:1230} as DOMRect);panel.getBoundingClientRect=()=>({top:64,bottom:564} as DOMRect);
 await act(async()=>{window.history.replaceState(null,'','#s13');fireEvent(window,new HashChangeEvent('hashchange'));});expect(panel.scrollTop).toBeGreaterThan(0);expect(v.container.querySelector('nav')!.scrollTop).toBe(0);
});
test('header pointer input closes only an open drawer; an orphan target restores toggle focus',async()=>{
 const v=await setup(),header=document.body.appendChild(document.createElement('header'));header.className='docs-header';try{await click(v.container.querySelector('#menuBtn'));await act(async()=>{fireEvent.pointerDown(document.body);});expect(v.container.querySelector('#menuBtn')).toHaveAttribute('aria-expanded','true');await act(async()=>{fireEvent.pointerDown(header);});expect(v.container.querySelector('#menuBtn')).toHaveAttribute('aria-expanded','false');
 const a=document.createElement('a');a.href='#missing';v.container.querySelector('nav')!.appendChild(a);await click(v.container.querySelector('#menuBtn'));await click(a);expect(document.activeElement).toBe(v.container.querySelector('#menuBtn'));}finally{header.remove();}
});
test('malformed URL fragments on load, hashchange and TOC links do not throw',async()=>{
 const errors:unknown[]=[],onError=(event:ErrorEvent)=>errors.push(event.error??event.message);window.addEventListener('error',onError);
 try{window.history.replaceState(null,'','#%E0%A4%A');const v=await setup();const bad=document.createElement('a');bad.href='#%E0%A4%A';v.container.querySelector('nav')!.appendChild(bad);
  await act(async()=>{window.history.replaceState(null,'','#s7-3');fireEvent(window,new HashChangeEvent('hashchange'));});expect(v.container.querySelector('a[data-sub="s7-3"]')).toHaveAttribute('aria-current','location');
  await act(async()=>{window.history.replaceState(null,'','#%E0%A4%A');fireEvent(window,new HashChangeEvent('hashchange'));});await click(bad);expect(errors).toEqual([]);}finally{window.removeEventListener('error',onError);}
});
