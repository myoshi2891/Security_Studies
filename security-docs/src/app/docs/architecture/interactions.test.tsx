import {afterEach,expect,test,spyOn} from 'bun:test';
import {cleanup,fireEvent,render,waitFor} from '@testing-library/react';
import {createElement} from 'react';
import {evaluatedPage} from './fidelity-helpers';
afterEach(()=>{cleanup();history.replaceState(null,'',location.pathname);});
async function mount(){const {default:Page}=await evaluatedPage();return render(createElement(Page,{}));}
test('mobile drawer opens, labels update, Escape and backdrop close and restore focus',async()=>{
 const {container}=await mount();const toggle=container.querySelector<HTMLButtonElement>('#navToggle')!,panel=container.querySelector('#sidebar')!;
 fireEvent.click(toggle);expect(toggle.getAttribute('aria-expanded')).toBe('true');expect(toggle.getAttribute('aria-label')).toBe('目次を閉じる');expect(panel.classList.contains('open')).toBe(true);expect(container.querySelector('#backdrop')?.classList.contains('show')).toBe(true);
 fireEvent.keyDown(document,{key:'Escape'});expect(toggle.getAttribute('aria-expanded')).toBe('false');expect(document.activeElement).toBe(toggle);
 fireEvent.click(toggle);fireEvent.click(container.querySelector('#backdrop')!);expect(toggle.getAttribute('aria-expanded')).toBe('false');
});
test('every checklist item updates its own done style, total and progress; unchecking restores zero',async()=>{
 const {container}=await mount(),inputs=[...container.querySelectorAll<HTMLInputElement>('.ck-item input')];expect(inputs).toHaveLength(18);
 inputs.forEach((input,i)=>{fireEvent.click(input);expect(input.closest('.ck-item')?.classList.contains('done')).toBe(true);expect(container.querySelector('#ckDone')?.textContent).toBe(String(i+1));});
 expect(container.querySelector<HTMLElement>('#ckBar')?.style.width).toBe('100%');
 inputs.forEach(input=>fireEvent.click(input));expect(container.querySelector('#ckDone')?.textContent).toBe('0');expect(container.querySelector<HTMLElement>('#ckBar')?.style.width).toBe('0%');
});
test('all ten copy buttons copy byte-exact corresponding code including indentation and newlines',async()=>{
 const {container}=await mount(),buttons=[...container.querySelectorAll('.copy-btn')];
 const copied:string[]=[];const write=spyOn(navigator.clipboard,'writeText').mockImplementation(async text=>{copied.push(text);});
 try{expect(buttons).toHaveLength(10);for(const button of buttons){fireEvent.click(button);await waitFor(()=>expect(button.querySelector('span')?.textContent).toBe('コピーしました'));}expect(copied).toEqual(buttons.map(b=>b.closest('.code-block')!.querySelector('code')!.textContent));}finally{write.mockRestore();}
});
test('clipboard failure is reported without claiming success',async()=>{
 const {container}=await mount();const write=spyOn(navigator.clipboard,'writeText').mockRejectedValue(new Error('denied'));
 try{const button=container.querySelector('.copy-btn')!;fireEvent.click(button);await waitFor(()=>expect(button.querySelector('span')?.textContent).toBe('コピーできませんでした'));}finally{write.mockRestore();}
});
test('initial fragment, hash navigation and clicked subsection select the exact link and parent',async()=>{
 history.replaceState(null,'','#step-8');const {container}=await mount();
 const selected=()=>container.querySelector('#nav a[aria-current="location"]')?.getAttribute('href');
 expect(selected()).toBe('#step-8');history.replaceState(null,'','#step-10');fireEvent(window,new Event('hashchange'));expect(selected()).toBe('#step-10');
 const link=container.querySelector<HTMLAnchorElement>('#nav a[href="#step-4"]')!;fireEvent.click(link);expect(selected()).toBe('#step-4');expect(link.closest('.nav-ch')?.classList.contains('parent-active')).toBe(true);
});

test('drawer Tab boundaries follow DOM order from the toggle through the last link',async()=>{
 const {container}=await mount();const toggle=container.querySelector<HTMLButtonElement>('#navToggle')!;
 const links=[...container.querySelectorAll<HTMLAnchorElement>('#nav a[href^="#"]')];
 fireEvent.click(toggle);
 toggle.focus();expect(fireEvent.keyDown(document,{key:'Tab',shiftKey:true})).toBe(false);expect(document.activeElement===links.at(-1)).toBe(true);
 links.at(-1)!.focus();expect(fireEvent.keyDown(document,{key:'Tab'})).toBe(false);expect(document.activeElement===toggle).toBe(true);
 links[0].focus();expect(fireEvent.keyDown(document,{key:'Tab',shiftKey:true})).toBe(true);expect(document.activeElement===links[0]).toBe(true);
});
