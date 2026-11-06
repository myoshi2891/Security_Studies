import { afterEach, expect, test } from 'bun:test';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { createElement as h } from 'react';
import { evaluatedPage, renderedPage } from './fidelity-helpers';
afterEach(cleanup);
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
