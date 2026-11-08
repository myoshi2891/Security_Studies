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
 const v=await mounted(),btn=v.container.querySelector<HTMLButtonElement>('#menuBtn')!;
 for(const method of ['escape','backdrop','resize']){
  fireEvent.click(btn);expect(btn).toHaveAttribute('aria-expanded','true');expect(document.body.style.overflow).toBe('hidden');
  if(method==='escape')fireEvent.keyDown(document,{key:'Escape'});
  if(method==='backdrop')fireEvent.click(v.container.querySelector('#backdrop')!);
  if(method==='resize')fireEvent(window,new Event('resize'));
  expect(btn).toHaveAttribute('aria-expanded','false');expect(document.body.style.overflow).not.toBe('hidden');
 }
 fireEvent.click(btn);v.unmount();expect(document.body.style.overflow).not.toBe('hidden');
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
function observedGuide() {
 const observers: { callback: IntersectionObserverCallback; nodes: Element[] }[] = [];
 globalThis.IntersectionObserver = class {
  nodes: Element[] = [];
  constructor(callback: IntersectionObserverCallback) {
   observers.push({ callback, nodes: this.nodes });
  }
  observe(node: Element) {
   this.nodes.push(node);
  }
  disconnect() {}
 } as unknown as typeof IntersectionObserver;
 const link = (id: string) => h('a', { href: `#${id}` }, id);
 const toc = h('nav', {}, h('ul', {}, h('li', {}, link('sec-1'), h('ul', {}, h('li', {}, link('h3-1')), h('li', {}, link('h3-2'))))));
 const body = h('section', { id: 'sec-1' }, h('h3', { id: 'h3-1' }), h('h3', { id: 'h3-2' }));
 const view = render(h('div', { className: 'issep-guide' }, h(GuideSidebar, { children: toc }), body));
 const notify = (id: string, isIntersecting: boolean) => {
  const target = view.container.querySelector(`#${id}`)!;
  const owner = observers.find(entry => entry.nodes.includes(target))!;
  act(() => owner.callback([{ target, isIntersecting } as IntersectionObserverEntry], {} as IntersectionObserver));
 };
 const current = () => view.container.querySelector('[aria-current="location"]')?.getAttribute('href');
 /** Place the clicked subsection at a viewport offset, as a jump or a layout change would. */
 const moveTarget = (id: string, top: number) => { view.container.querySelector(`#${id}`)!.getBoundingClientRect = () => ({ top } as DOMRect); };
 return { view, notify, current, moveTarget };
}
const settled = () => new Promise(resolve => setTimeout(resolve, 200));
const originalObserver = globalThis.IntersectionObserver;
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
  scroll(view.container.querySelector('#h3-1')!);
  notify('h3-2', true);
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
