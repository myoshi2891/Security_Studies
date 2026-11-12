import {afterEach,expect,test} from 'bun:test';
import {cleanup,fireEvent,render} from '@testing-library/react';
import {createElement} from 'react';
import {evaluatedPage} from './fidelity-helpers';
afterEach(()=>{cleanup();history.replaceState(null,'',location.pathname);});
async function mount(){const {default:Page}=await evaluatedPage();return render(createElement(Page,{}));}
test('drawer toggle, Escape and backdrop synchronize labels and restore focus',async()=>{
 const {container}=await mount(),toggle=container.querySelector<HTMLButtonElement>('#menuBtn')!;
 fireEvent.click(toggle);expect(toggle.getAttribute('aria-expanded')).toBe('true');expect(toggle.getAttribute('aria-label')).toBe('目次を閉じる');expect(container.querySelector('#sidebar')?.classList.contains('open')).toBe(true);expect(container.querySelector('#backdrop')?.classList.contains('show')).toBe(true);
 fireEvent.keyDown(document,{key:'Escape'});expect(toggle.getAttribute('aria-expanded')).toBe('false');expect(document.activeElement).toBe(toggle);
 fireEvent.click(toggle);fireEvent.click(container.querySelector('#backdrop')!);expect(toggle.getAttribute('aria-expanded')).toBe('false');
});
test('direct fragment, hash changes and clicked subsections select the exact original TOC link',async()=>{
 history.replaceState(null,'','#s53');const {container}=await mount(),selected=()=>container.querySelector('#nav a[aria-current="location"]')?.getAttribute('href');expect(selected()).toBe('#s53');
 history.replaceState(null,'','#s74');fireEvent(window,new Event('hashchange'));expect(selected()).toBe('#s74');fireEvent.click(container.querySelector('#nav a[href="#s28"]')!);expect(selected()).toBe('#s28');
});
test('mobile navigation traps Tab and Shift+Tab and restores background scrolling on unmount',async()=>{
 const previous=document.body.style.overflow;const {container,unmount}=await mount(),toggle=container.querySelector<HTMLButtonElement>('#menuBtn')!,first=container.querySelector<HTMLAnchorElement>('#nav a')!;
 fireEvent.click(toggle);expect(document.body.style.overflow).toBe('hidden');expect(container.querySelector<HTMLElement>('.guide-content')?.inert).toBe(true);expect(document.activeElement).toBe(first);
 fireEvent.keyDown(document,{key:'Tab',shiftKey:true});expect(document.activeElement).toBe(toggle);fireEvent.keyDown(document,{key:'Tab'});expect(document.activeElement).toBe(first);unmount();expect(document.body.style.overflow).toBe(previous);
});
test('all seventeen original checkbox labels toggle independently and retain checklist numbering hooks',async()=>{
 const {container}=await mount(),labels=[...container.querySelectorAll('.checklist label')];expect(labels).toHaveLength(17);
 for(const label of labels){const input=label.querySelector<HTMLInputElement>('input')!;expect(input.checked).toBe(false);fireEvent.click(label);expect(input.checked).toBe(true);expect(label.querySelector('.ck-n')).not.toBeNull();fireEvent.click(label);expect(input.checked).toBe(false);}
});
test('both original answer disclosures toggle independently and keep the full answers',async()=>{
 const {container}=await mount(),answers=[...container.querySelectorAll<HTMLDetailsElement>('details.qa')];expect(answers).toHaveLength(2);
 for(const answer of answers){const original=answer.textContent;expect(answer.open).toBe(false);fireEvent.click(answer.querySelector('summary')!);expect(answer.open).toBe(true);expect(answer.textContent).toBe(original);fireEvent.click(answer.querySelector('summary')!);expect(answer.open).toBe(false);}
});
