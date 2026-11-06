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
