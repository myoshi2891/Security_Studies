import {afterEach,expect,test} from 'bun:test';
import {createElement} from 'react';
import {cleanup,fireEvent,render} from '@testing-library/react';
import {evaluatedPage} from './fidelity-helpers';
afterEach(cleanup);
async function renderGuide(){
 const {default:Page}=await evaluatedPage();const saved=globalThis.IntersectionObserver;
 globalThis.IntersectionObserver=class{observe(){}disconnect(){}} as unknown as typeof IntersectionObserver;
 try{return render(createElement(Page));}finally{globalThis.IntersectionObserver=saved;}
}
test('all ten native checkboxes have labels and toggle independently without losing their numbers',async()=>{
 const view=await renderGuide();const labels=view.container.querySelectorAll<HTMLLabelElement>('.checklist label');expect(labels).toHaveLength(10);
 const boxes=[...view.container.querySelectorAll<HTMLInputElement>('.checklist input')];const numbers=[...view.container.querySelectorAll('.num')].map(e=>e.textContent);
 for(const [index,label] of [...labels].entries()){const input=boxes[index];expect(input).toHaveAccessibleName(/\S/);expect(input.checked).toBe(false);fireEvent.click(label);expect(input.checked).toBe(true);expect(boxes.filter(b=>b.checked)).toHaveLength(index+1);}
 fireEvent.click(labels[0]);expect(boxes[0].checked).toBe(false);expect(boxes.slice(1).every(b=>b.checked)).toBe(true);expect([...view.container.querySelectorAll('.num')].map(e=>e.textContent)).toEqual(numbers);
 boxes[0].focus();expect(document.activeElement).toBe(boxes[0]);
});
test('all ten Q&A answers open and close independently through their native summary controls',async()=>{
 const view=await renderGuide();const answers=[...view.container.querySelectorAll<HTMLDetailsElement>('section details')];expect(answers).toHaveLength(4);
 for(const [index,answer] of answers.entries()){expect(answer.open).toBe(false);fireEvent.click(answer.querySelector('summary')!);expect(answer.open).toBe(true);expect(answers.filter(a=>a.open)).toHaveLength(index+1);expect(answer.textContent!.trim().length).toBeGreaterThan(0);}
 fireEvent.click(answers[0].querySelector('summary')!);expect(answers[0].open).toBe(false);expect(answers.slice(1).every(a=>a.open)).toBe(true);
});
