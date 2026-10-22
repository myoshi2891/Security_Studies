import {afterEach,expect,test} from 'bun:test';
import {createElement} from 'react';
import {cleanup,fireEvent,render} from '@testing-library/react';
import {evaluatedPage} from './fidelity-helpers';
afterEach(cleanup);
test('all 36 source answers open and close independently through their native summary controls',async()=>{
 const {default:Page}=await evaluatedPage();const saved=globalThis.IntersectionObserver;globalThis.IntersectionObserver=class{observe(){}disconnect(){}} as unknown as typeof IntersectionObserver;
 try{const view=render(createElement(Page));const answers=[...view.container.querySelectorAll<HTMLDetailsElement>('section details')];expect(answers).toHaveLength(36);
 for(const [i,answer] of answers.entries()){expect(answer.open).toBe(false);expect(answer.querySelector('summary')).toHaveAccessibleName(/Q/);fireEvent.click(answer.querySelector('summary')!);expect(answer.open).toBe(true);expect(answers.filter(a=>a.open)).toHaveLength(i+1);expect(answer.querySelector('p')!.textContent!.trim().length).toBeGreaterThan(0);}
 fireEvent.click(answers[0].querySelector('summary')!);expect(answers[0].open).toBe(false);expect(answers.slice(1).every(a=>a.open)).toBe(true);
 }finally{globalThis.IntersectionObserver=saved;}
});
