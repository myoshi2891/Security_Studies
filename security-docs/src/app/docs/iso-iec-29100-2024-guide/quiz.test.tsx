import {afterEach,expect,test} from 'bun:test';
import {act,cleanup,render,fireEvent} from '@testing-library/react';
import {createElement} from 'react';
import {evaluatedPage} from './fidelity-helpers';
afterEach(cleanup);
async function setup(){const saved=globalThis.IntersectionObserver;globalThis.IntersectionObserver=class{observe(){}disconnect(){}} as unknown as typeof IntersectionObserver;try{const {default:Page}=await evaluatedPage();return render(createElement(Page,{}));}finally{globalThis.IntersectionObserver=saved;}}
test('all ten understanding checks update progress at 0/10, 1/10, 10/10 and reset without closing answers',async()=>{
 const v=await setup(),inputs=[...v.container.querySelectorAll<HTMLInputElement>('.quiz-check-input')];expect(inputs).toHaveLength(10);
 const text=()=>v.container.querySelector('#quizProgressText')!.textContent;
 expect(text()).toBe('0 / 10 問（0%）');
 for(let i=0;i<10;i++){await act(async()=>{fireEvent.click(inputs[i]);});expect(text()).toBe((i+1)+' / 10 問（'+(i+1)*10+'%）');expect((v.container.querySelector('#quizProgressFill') as HTMLElement).style.width).toBe((i+1)*10+'%');}
 await act(async()=>{fireEvent.click(v.container.querySelector('#quizExpandAll')!);fireEvent.click(v.container.querySelector('#quizResetChecks')!);});
 expect(inputs.every(i=>!i.checked)).toBe(true);expect(text()).toBe('0 / 10 問（0%）');expect(v.container.querySelectorAll('.quiz-details[open]')).toHaveLength(10);
});
test('individual answer toggles and expand/collapse all synchronize every label and eye icon',async()=>{
 const v=await setup(),answers=[...v.container.querySelectorAll<HTMLDetailsElement>('.quiz-details')];expect(answers).toHaveLength(10);
 for(const a of answers){await act(async()=>{a.open=true;fireEvent(a,new Event('toggle'));});expect(a.querySelector('.quiz-summary-text')).toHaveTextContent('解答を隠す');expect(a.querySelector('.quiz-summary>i')).toHaveClass('ti-eye-off');}
 await act(async()=>{fireEvent.click(v.container.querySelector('#quizCollapseAll')!);});
 for(const a of answers){expect(a.open).toBe(false);expect(a.querySelector('.quiz-summary-text')).toHaveTextContent('解答を確認する');expect(a.querySelector('.quiz-summary>i')).toHaveClass('ti-eye');}
 await act(async()=>{fireEvent.click(v.container.querySelector('#quizExpandAll')!);});expect(answers.every(a=>a.open)).toBe(true);
});
