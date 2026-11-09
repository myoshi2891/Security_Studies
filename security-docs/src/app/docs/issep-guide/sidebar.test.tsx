import { afterEach, expect, test } from 'bun:test';
import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { createElement as h } from 'react';
import { evaluatedPage, renderedPage } from './fidelity-helpers';
import { GuideSidebar } from './GuideSidebar';
// 各テストは URL の断片を持ち越さない（断片は目次の選択を固定するため）
afterEach(() => { cleanup(); window.history.replaceState(null, '', '/'); });
async function mounted() {
 const { default: Page } = await evaluatedPage();
 return render(h(Page, {}));
}
test('menu closes with Escape, backdrop and resize, restoring scroll and focus', async () => {
 const v=await mounted(),btn=v.container.querySelector<HTMLButtonElement>('#menuBtn')!,content=v.container.querySelector<HTMLElement>('.guide-content')!;
 for(const method of ['escape','backdrop','resize']){
  fireEvent.click(btn);expect(btn).toHaveAttribute('aria-expanded','true');expect(document.body.style.overflow).toBe('hidden');expect(v.container.querySelector('aside')!.contains(document.activeElement)).toBe(true);expect(content.inert).toBe(true);
  if(method==='escape')fireEvent.keyDown(document,{key:'Escape'});
  if(method==='backdrop')fireEvent.click(v.container.querySelector('#backdrop')!);
  if(method==='resize')fireEvent(window,new Event('resize'));
  expect(btn).toHaveAttribute('aria-expanded','false');expect(document.body.style.overflow).not.toBe('hidden');expect(document.activeElement).toBe(btn);expect(content.inert).toBe(false);
 }
 fireEvent.click(btn);v.unmount();expect(document.body.style.overflow).not.toBe('hidden');
});
test.each([false,true])('drawer dismissal and unmount restore the previous background inert state (%s)',previousInert=>{
 const view=render(h('div',{className:'issep-guide'},h(GuideSidebar,{children:h('nav',{},h('ul',{},h('li',{},h('a',{href:'#section'},'章'))))}),h('main',{className:'guide-content'},h('section',{id:'section'},h('h2',{},'本文')))));
 const content=view.container.querySelector<HTMLElement>('.guide-content')!,button=view.container.querySelector<HTMLButtonElement>('#menuBtn')!,panel=view.container.querySelector('aside')!;
 content.inert=previousInert;
 for(const method of ['Escape','backdrop','resize','toggle']){
  fireEvent.click(button);expect(content.inert).toBe(true);expect(panel.closest('[inert]')).toBeNull();expect(button.closest('[inert]')).toBeNull();expect(panel.contains(document.activeElement)).toBe(true);
  if(method==='Escape')fireEvent.keyDown(document,{key:'Escape'});
  if(method==='backdrop')fireEvent.click(view.container.querySelector('#backdrop')!);
  if(method==='resize')fireEvent(window,new Event('resize'));
  if(method==='toggle')fireEvent.click(button);
  expect(content.inert).toBe(previousInert);expect(button).toHaveAttribute('aria-expanded','false');
 }
 fireEvent.click(button);view.unmount();expect(content.inert).toBe(previousInert);
});
test('Tab traps keyboard focus inside visible menu links and malformed fragments stay safe', async () => {
 const v=await mounted();fireEvent.click(v.container.querySelector('#menuBtn')!);
 const links=[...v.container.querySelectorAll<HTMLAnchorElement>('nav>ul>li>a,nav>ul>li.open>ul a')];
 links.at(-1)!.focus();fireEvent.keyDown(document,{key:'Tab'});expect(document.activeElement).toBe(links[0]);
 fireEvent.keyDown(document,{key:'Tab',shiftKey:true});expect(document.activeElement).toBe(links.at(-1)!);
 window.history.replaceState(null,'','#%');expect(()=>fireEvent(window,new Event('hashchange'))).not.toThrow();
 window.history.replaceState(null,'','/');
});
test('chapter and subsection selection expands only its original chapter and focuses its heading', async () => {
 const v=await mounted(),btn=v.container.querySelector<HTMLButtonElement>('#menuBtn')!;
 for(const link of v.container.querySelectorAll<HTMLAnchorElement>('nav a')){
  fireEvent.click(btn);fireEvent.click(link);
  expect(btn).toHaveAttribute('aria-expanded','false');expect(link).toHaveAttribute('aria-current','location');
  const group=link.closest('.nav-group')!;expect(group).toHaveClass('open');expect(v.container.querySelectorAll('.nav-group.open')).toHaveLength(1);
  expect(group.querySelector(':scope > a')).toHaveClass('active');
  expect(document.activeElement?.id||document.activeElement?.closest('section')?.id).toBe(link.hash.slice(1));
 }
});
test('all source TOC anchors have matching section and subsection targets', async () => {
 const d=await renderedPage();for(const a of d.querySelectorAll('nav a'))expect(d.getElementById(a.getAttribute('href')!.slice(1))).not.toBeNull();
});

/** Render a small guide whose observers can be driven by hand, independent of the archived source. */
function observedGuide(nextChapter=false) {
 const observers: { callback: IntersectionObserverCallback; nodes: Element[]; options?: IntersectionObserverInit; disconnected: boolean }[] = [];
 globalThis.IntersectionObserver = class {
  nodes: Element[] = [];
  registration: (typeof observers)[number];
  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
   this.registration={ callback, nodes: this.nodes, options, disconnected: false };
   observers.push(this.registration);
  }
  observe(node: Element) {
   this.nodes.push(node);
  }
  disconnect() { this.registration.disconnected=true; }
 } as unknown as typeof IntersectionObserver;
 const link = (id: string) => h('a', { href: `#${id}` }, id);
 const toc = h('nav', {}, h('ul', {}, h('li', {}, link('sec-1'), h('ul', {}, h('li', {}, link('h3-1')), h('li', {}, link('h3-2')))), nextChapter?h('li',{},link('sec-2')):null));
 const body = h('section', { id: 'sec-1' }, h('h3', { id: 'h3-1' }), h('h3', { id: 'h3-2' }), h('div', { id: 'ref-S1' }));
 const view = render(h('div', { className: 'issep-guide' }, h(GuideSidebar, { children: toc }), body, nextChapter?h('section',{id:'sec-2'}):null));
 const notify = (id: string, isIntersecting: boolean) => {
  const target = view.container.querySelector(`#${id}`)!;
  const owner = observers.find(entry => !entry.disconnected && entry.nodes.includes(target))!;
  act(() => owner.callback([{ target, isIntersecting } as IntersectionObserverEntry], {} as IntersectionObserver));
 };
 const current = () => view.container.querySelector('[aria-current="location"]')?.getAttribute('href');
 /** Place the clicked subsection at a viewport offset, as a jump or a layout change would. */
 const moveTarget = (id: string, top: number) => { view.container.querySelector(`#${id}`)!.getBoundingClientRect = () => ({ top } as DOMRect); };
 return { view, notify, current, moveTarget, observers };
}
const settled = () => new Promise(resolve => setTimeout(resolve, 200));
const originalObserver = globalThis.IntersectionObserver;
test.each([false,true])('desktop resize focuses visible navigation when the drawer was open: %s',wasOpen=>{
 const previousWidth=Object.getOwnPropertyDescriptor(window,'innerWidth');
 try{
  Object.defineProperty(window,'innerWidth',{configurable:true,value:375});
  const {view,notify,current}=observedGuide(true);const button=view.container.querySelector<HTMLButtonElement>('#menuBtn')!;
  notify('h3-1',true);
  if(wasOpen)fireEvent.click(button);else button.focus();
  Object.defineProperty(window,'innerWidth',{configurable:true,value:1440});fireEvent(window,new Event('resize'));
  expect(button).toHaveAttribute('aria-expanded','false');
  expect(document.activeElement).toBe(view.container.querySelector('nav>ul>li>a'));
  notify('sec-2',true);expect(current()).toBe('#sec-2');expect(document.activeElement).toBe(view.container.querySelector('nav>ul>li>a'));
 }finally{
  globalThis.IntersectionObserver=originalObserver;
  if(previousWidth)Object.defineProperty(window,'innerWidth',previousWidth);else Reflect.deleteProperty(window,'innerWidth');
 }
});
test.each([1024,375])('narrowing to %ipx moves focus from the closed desktop sidebar to the menu button',width=>{
 const previousWidth=Object.getOwnPropertyDescriptor(window,'innerWidth');
 try{
  Object.defineProperty(window,'innerWidth',{configurable:true,value:1440});
  const {view,notify}=observedGuide();notify('h3-1',true);
  view.container.querySelector<HTMLAnchorElement>('a[href="#h3-1"]')!.focus();
  Object.defineProperty(window,'innerWidth',{configurable:true,value:width});fireEvent(window,new Event('resize'));
  const button=view.container.querySelector('#menuBtn')!;expect(button).toHaveAttribute('aria-expanded','false');expect(document.activeElement?.id).toBe('menuBtn');
 }finally{
  globalThis.IntersectionObserver=originalObserver;
  if(previousWidth)Object.defineProperty(window,'innerWidth',previousWidth);else Reflect.deleteProperty(window,'innerWidth');
 }
});
test('sidebar pointer presses preserve a navigation pin while outside presses resume tracking',()=>{
 try{
  const {view,notify,current}=observedGuide();
  fireEvent.click(view.container.querySelector('a[href="#h3-1"]')!);notify('h3-2',true);
  fireEvent.pointerDown(view.container.querySelector('a[href="#h3-2"]')!);expect(current()).toBe('#h3-1');
  fireEvent.pointerDown(view.container.querySelector('#h3-2')!);expect(current()).toBe('#h3-2');
 }finally{globalThis.IntersectionObserver=originalObserver;}
});
test('removing the fragment releases the stale pin and resumes current observer selection',()=>{
 try{
  window.history.replaceState(null,'','#h3-1');
  const {notify,current}=observedGuide();notify('h3-2',true);expect(current()).toBe('#h3-1');
  act(()=>{window.history.replaceState(null,'','/');window.dispatchEvent(new Event('hashchange'));});
  expect(current()).toBe('#h3-2');
  notify('h3-2',false);notify('h3-1',true);expect(current()).toBe('#h3-1');
 }finally{globalThis.IntersectionObserver=originalObserver;}
});
test('sidebar wheel scrolling preserves the selected link while content wheel scrolling resumes tracking',()=>{
 try{
  const {view,notify,current}=observedGuide();
  fireEvent.click(view.container.querySelector('a[href="#h3-1"]')!);notify('h3-2',true);
  fireEvent.wheel(view.container.querySelector('aside')!);expect(current()).toBe('#h3-1');
  fireEvent.wheel(view.container.querySelector('#h3-1')!);expect(current()).toBe('#h3-2');
 }finally{globalThis.IntersectionObserver=originalObserver;}
});
test('desktop observer options leave an intersecting heading band, including after resize',()=>{
 const previousWidth=Object.getOwnPropertyDescriptor(window,'innerWidth'),previousHeight=Object.getOwnPropertyDescriptor(window,'innerHeight');
 try{
  Object.defineProperty(window,'innerWidth',{configurable:true,value:1440});Object.defineProperty(window,'innerHeight',{configurable:true,value:900});
  const {view,observers,current}=observedGuide();
  const notifyGeometry=()=>{
   const active=observers.filter(observer=>!observer.disconnected);expect(active).toHaveLength(2);
   for(const observer of active){
    expect(observer.options?.root??null).toBeNull();
    const margins=observer.options?.rootMargin?.split(/\s+/);expect(margins).toHaveLength(4);
    // The API resolves every percentage margin against the root width, including vertical margins.
    // https://www.w3.org/TR/intersection-observer/#intersectionobserver-root-intersection-rectangle
    const pixels=margins!.map(value=>parseFloat(value)*(value.endsWith('%')?window.innerWidth/100:1));
    const top=-pixels[0],bottom=window.innerHeight+pixels[2];
    expect(bottom-top).toBeGreaterThan(0);expect(top).toBeCloseTo(window.innerHeight*0.2);expect(bottom).toBeCloseTo(window.innerHeight*0.3);
    const rootBounds={top,bottom,left:-pixels[3],right:window.innerWidth+pixels[1]} as DOMRectReadOnly;
    const entries=observer.nodes.map(target=>{
     const bounds=target.getBoundingClientRect();
     return {target,boundingClientRect:bounds,rootBounds,isIntersecting:bounds.bottom>top&&bounds.top<bottom} as IntersectionObserverEntry;
    });
    if(observer.nodes.some(node=>node.matches('h3')))expect(entries.filter(entry=>entry.isIntersecting).map(entry=>entry.target.id)).toEqual(['h3-1']);
    act(()=>observer.callback(entries,{} as IntersectionObserver));
   }
  };
  view.container.querySelector('#sec-1')!.getBoundingClientRect=()=>({top:-800,bottom:1500} as DOMRect);
  view.container.querySelector('#h3-1')!.getBoundingClientRect=()=>({top:200,bottom:240} as DOMRect);
  view.container.querySelector('#h3-2')!.getBoundingClientRect=()=>({top:700,bottom:740} as DOMRect);
  notifyGeometry();expect(current()).toBe('#h3-1');
  Object.defineProperty(window,'innerWidth',{configurable:true,value:1920});Object.defineProperty(window,'innerHeight',{configurable:true,value:1080});
  fireEvent(window,new Event('resize'));notifyGeometry();expect(current()).toBe('#h3-1');
 }finally{
  globalThis.IntersectionObserver=originalObserver;
  if(previousWidth)Object.defineProperty(window,'innerWidth',previousWidth);else Reflect.deleteProperty(window,'innerWidth');
  if(previousHeight)Object.defineProperty(window,'innerHeight',previousHeight);else Reflect.deleteProperty(window,'innerHeight');
 }
});
test.each([true,false])('chapter notifications retain an intersecting subsection (chapter first: %s)',chapterFirst=>{
 try{
  const {notify,current,view}=observedGuide(true);
  if(chapterFirst)notify('sec-1',true);
  notify('h3-1',true);notify('sec-1',true);
  expect(current()).toBe('#h3-1');expect(view.container.querySelector('a[href="#h3-1"]')).toHaveClass('active');
  notify('sec-1',false);expect(current()).toBe('#h3-1');
  notify('sec-2',true);expect(current()).toBe('#h3-1');
  notify('h3-1',false);expect(current()).toBe('#sec-2');
 }finally{globalThis.IntersectionObserver=originalObserver;}
});
test.each(['ctrlKey','metaKey'])('%s clicks preserve selection and do not pin navigation',modifier=>{
 try{
  const {view,notify,current}=observedGuide();notify('h3-1',true);
  fireEvent.click(view.container.querySelector('a[href="#h3-2"]')!,{[modifier]:true});
  expect(current()).toBe('#h3-1');
  notify('h3-2',true);expect(current()).toBe('#h3-2');
 }finally{globalThis.IntersectionObserver=originalObserver;}
});
test('between observed headings the nearest preceding heading is selected without overriding a navigation pin',()=>{
 try{
  const {view,notify,current,moveTarget}=observedGuide();
  moveTarget('sec-1',-600);moveTarget('h3-1',-200);moveTarget('h3-2',400);
  notify('h3-2',true);expect(current()).toBe('#h3-2');
  notify('h3-2',false);expect(current()).toBe('#h3-1');
  fireEvent.click(view.container.querySelector('a[href="#h3-2"]')!);
  notify('h3-1',false);expect(current()).toBe('#h3-2');
 }finally{globalThis.IntersectionObserver=originalObserver;}
});
test('a visible chapter retains its nearest preceding subsection after the heading leaves the band',()=>{
 try{
  const {notify,current,moveTarget}=observedGuide();
  moveTarget('sec-1',-800);moveTarget('h3-1',-300);moveTarget('h3-2',600);
  notify('sec-1',true);notify('h3-1',true);notify('h3-1',false);
  expect(current()).toBe('#h3-1');
  moveTarget('h3-2',-10);notify('sec-1',true);expect(current()).toBe('#h3-2');
  moveTarget('h3-1',400);moveTarget('h3-2',600);notify('sec-1',true);expect(current()).toBe('#sec-1');
 }finally{globalThis.IntersectionObserver=originalObserver;}
});
test('citation hashes select their chapter and pin the citation element through observer notifications',async()=>{
 try{
  const {notify,current,moveTarget}=observedGuide();notify('h3-2',true);
  moveTarget('ref-S1',88);
  window.history.replaceState(null,'','#ref-S1');act(()=>{window.dispatchEvent(new Event('hashchange'));});
  expect(current()).toBe('#sec-1');notify('sec-1',true);expect(current()).toBe('#sec-1');
  await settled();moveTarget('ref-S1',900);fireEvent.scroll(window);
  expect(current()).toBe('#h3-2');
 }finally{globalThis.IntersectionObserver=originalObserver;}
});
test('observer entries caused by navigation keep the clicked subsection selected', () => {
 try {
  const { view, notify, current } = observedGuide();
  fireEvent.click(view.container.querySelector('a[href="#h3-1"]')!);
  notify('h3-2', true);
  notify('sec-1', true);
  expect(current()).toBe('#h3-1');
 } finally {
  globalThis.IntersectionObserver = originalObserver;
 }
});
test.each([
 ['wheel', (target: Element) => fireEvent.wheel(target)],
 ['pointer', (target: Element) => fireEvent.pointerDown(target)],
 ['scroll key', (target: Element) => fireEvent.keyDown(target, { key: 'PageDown' })],
])('%s input hands selection back to the observer after a click', (_name, scroll) => {
 try {
  const { view, notify, current } = observedGuide();
  fireEvent.click(view.container.querySelector('a[href="#h3-1"]')!);
  notify('h3-2', true);
  scroll(view.container.querySelector('#h3-1')!);
  expect(current()).toBe('#h3-2');
 } finally {
  globalThis.IntersectionObserver = originalObserver;
 }
});
test('a non-scrolling key does not release the clicked subsection', () => {
 try {
  const { view, notify, current } = observedGuide();
  fireEvent.click(view.container.querySelector('a[href="#h3-1"]')!);
  fireEvent.keyDown(view.container.querySelector('#h3-1')!, { key: 'Tab' });
  notify('h3-2', true);
  expect(current()).toBe('#h3-1');
 } finally {
  globalThis.IntersectionObserver = originalObserver;
 }
});
test('a find-in-page jump, which sends only a scroll event, releases the pin and restores observer tracking', async () => {
 try {
  const { view, notify, current, moveTarget } = observedGuide();
  moveTarget('h3-1', 88);
  fireEvent.click(view.container.querySelector('a[href="#h3-1"]')!);
  notify('h3-2', true);
  await settled();
  moveTarget('h3-1', -4000);
  fireEvent.scroll(window);
  expect(current()).toBe('#h3-2');
  notify('h3-2', false);
  notify('h3-1', true);
  expect(current()).toBe('#h3-1');
 } finally {
  globalThis.IntersectionObserver = originalObserver;
 }
});
test('the sidebar jump itself keeps the pin, however long its smooth scroll runs', async () => {
 try {
  const { view, notify, current, moveTarget } = observedGuide();
  moveTarget('h3-1', 2400);
  fireEvent.click(view.container.querySelector('a[href="#h3-1"]')!);
  for (const top of [1800, 1200, 600, 88]) {
   await new Promise(resolve => setTimeout(resolve, 100));
   moveTarget('h3-1', top);
   fireEvent.scroll(window);
  }
  notify('h3-2', true);
  await settled();
  fireEvent.scroll(window);
  notify('sec-1', true);
  expect(current()).toBe('#h3-1');
 } finally {
  globalThis.IntersectionObserver = originalObserver;
 }
});
test('a scroll that leaves the pinned target in place, such as scroll anchoring, keeps the pin', async () => {
 try {
  const { view, notify, current, moveTarget } = observedGuide();
  moveTarget('h3-1', 88);
  fireEvent.click(view.container.querySelector('a[href="#h3-1"]')!);
  await settled();
  moveTarget('h3-1', 88.5);
  fireEvent.scroll(window);
  notify('h3-2', true);
  expect(current()).toBe('#h3-1');
 } finally {
  globalThis.IntersectionObserver = originalObserver;
 }
});
test('a find-in-page jump after a sidebar click that caused no scroll still releases the pin', async () => {
 try {
  const { view, notify, current, moveTarget } = observedGuide();
  moveTarget('h3-1', 88);
  fireEvent.click(view.container.querySelector('a[href="#h3-1"]')!);
  await settled();
  moveTarget('h3-1', 900);
  fireEvent.scroll(window);
  notify('h3-2', true);
  expect(current()).toBe('#h3-2');
 } finally {
  globalThis.IntersectionObserver = originalObserver;
 }
});
test('unmounting while a jump settles removes the scroll tracking without errors', async () => {
 try {
  const { view, moveTarget } = observedGuide();
  moveTarget('h3-1', 88);
  fireEvent.click(view.container.querySelector('a[href="#h3-1"]')!);
  view.unmount();
  await settled();
  expect(() => fireEvent.scroll(window)).not.toThrow();
 } finally {
  globalThis.IntersectionObserver = originalObserver;
 }
});
test('without a click, the observer keeps following the reader', () => {
 try {
  const { notify, current } = observedGuide();
  notify('h3-1', true);
  expect(current()).toBe('#h3-1');
  notify('h3-1', false);
  notify('h3-2', true);
  expect(current()).toBe('#h3-2');
 } finally {
  globalThis.IntersectionObserver = originalObserver;
 }
});
test('an initial fragment keeps its subsection selected against a competing observer entry until the reader scrolls', () => {
 try {
  window.history.replaceState(null, '', '#h3-1');
  const { view, notify, current } = observedGuide();
  expect(current()).toBe('#h3-1');
  notify('h3-2', true);
  expect(current()).toBe('#h3-1');
  fireEvent.wheel(view.container.querySelector('#h3-1')!);
  notify('h3-1', false);
  expect(current()).toBe('#h3-2');
 } finally {
  globalThis.IntersectionObserver = originalObserver;
  window.history.replaceState(null, '', '/');
 }
});
test('a hashchange keeps its subsection selected against a competing observer entry until the reader scrolls', () => {
 try {
  const { view, notify, current } = observedGuide();
  window.history.replaceState(null, '', '#h3-1');
  act(() => { window.dispatchEvent(new Event('hashchange')); });
  expect(current()).toBe('#h3-1');
  notify('h3-2', true);
  expect(current()).toBe('#h3-1');
  fireEvent.keyDown(view.container.querySelector('#h3-1')!, { key: 'PageDown' });
  notify('h3-1', false);
  expect(current()).toBe('#h3-2');
 } finally {
  globalThis.IntersectionObserver = originalObserver;
  window.history.replaceState(null, '', '/');
 }
});
