import { afterEach, expect, test } from 'bun:test';
import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { createElement as h } from 'react';
import { hydrateRoot, type Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { QuizCard } from './QuizCard';
import { evaluatedPage, renderedPage, sourceDocument, sourceTest } from './fidelity-helpers';
import copy from './quiz-copy.json';

afterEach(cleanup);
const key = (i: number) => copy[i].answer.trim()[0];
async function mounted() { const { default: Page } = await evaluatedPage(); return render(h(Page, {})); }
function assertCopy(card: Element, i: number) {
 expect(card.querySelector('.q-badge')!.textContent).toBe(copy[i].badge);
 expect(card.querySelector('.q-text')!.textContent).toBe(copy[i].question);
 expect([...card.querySelectorAll('.q-text strong')].map(e=>e.textContent)).toEqual(copy[i].emphasis);
 expect([...card.querySelectorAll('.q-opts li')].map(e=>e.textContent)).toEqual(copy[i].options);
 expect(card.querySelector('summary')!.textContent).toBe(copy[i].summary);
 expect(card.querySelector('.answer')!.textContent).toBe(copy[i].answer);
}
sourceTest('all frozen question, option, emphasis, summary and explanation strings match the unmodified original', () => {
 [...sourceDocument.querySelectorAll('.quiz')].forEach(assertCopy);
});
test('server-rendered questions preserve every original character and offer forty native keyboard buttons', async () => {
 const d=await renderedPage();const cards=[...d.querySelectorAll('.quiz')];expect(cards).toHaveLength(10);
 cards.forEach(assertCopy);expect(d.querySelectorAll('.q-opts button[type="button"]')).toHaveLength(40);
 expect(d.querySelectorAll('.quiz-feedback')).toHaveLength(0);
 const regions=[...d.querySelectorAll('.quiz [role="status"]')];expect(regions).toHaveLength(10);
 for(const region of regions)expect(region.textContent).toBe('');
});
for(let i=0;i<10;i++)test(`question ${i+1}: every choice reports its correct result while all original wording remains unchanged`, async () => {
 const v=await mounted();const cards=[...v.container.querySelectorAll('.quiz')];const card=cards[i];
 const buttons=[...card.querySelectorAll<HTMLButtonElement>('.q-opts button')];expect(buttons).toHaveLength(4);
 for(let j=0;j<4;j++){
  fireEvent.click(buttons[j]);const correct=String.fromCharCode(65+j)===key(i);
  expect(buttons[j]).toHaveAttribute('aria-pressed','true');expect(buttons[j]).toHaveAttribute('data-choice-state',correct?'correct':'incorrect');
  expect(card.querySelector('[role="status"]')).toHaveTextContent(correct?'正解':'不正解');
  expect(card.querySelector('[role="status"]')!.textContent).toBe(correct?'正解':'不正解');
  expect(card.querySelector('details')).toHaveAttribute('open');
  expect(buttons.filter(b=>b.getAttribute('aria-pressed')==='true')).toHaveLength(1);
  expect(buttons[key(i).charCodeAt(0)-65]).toHaveAttribute('data-choice-state','correct');
  assertCopy(card,i);
  expect(cards.filter(c=>c.querySelector('.quiz-feedback'))).toHaveLength(1);
 }
});
test('answering two questions maintains independent choices and announces each result through its own description', async () => {
 const v=await mounted();const cards=[...v.container.querySelectorAll('.quiz')];
 for(let i=0;i<2;i++)fireEvent.click(cards[i].querySelectorAll('button')[i]);
 const status=cards.slice(0,2).map(c=>c.querySelector('[role="status"]')!);expect(new Set(status.map(e=>e.id)).size).toBe(2);
 for(let i=0;i<2;i++)expect(cards[i].querySelector('button[aria-pressed="true"]')).toHaveAttribute('aria-describedby',status[i].id);
 for(const button of v.container.querySelectorAll('button[aria-pressed="false"]'))expect(button).not.toHaveAttribute('aria-describedby');
 expect(cards[2].querySelector('[role="status"]')).toBeEmptyDOMElement();
});
test('the original answer disclosure can still be toggled after choosing and reopens for a new choice', async () => {
 const v=await mounted();const c=v.container.querySelector('.quiz')!;const b=c.querySelectorAll('button');expect(b).toHaveLength(4);
 fireEvent.click(b[0]);const details=c.querySelector('details')!;expect(details.open).toBe(true);
 details.open=false;fireEvent(details,new Event('toggle'));expect(details.open).toBe(false);
 fireEvent.click(b[1]);expect(details.open).toBe(true);
 assertCopy(c,0);
});

/** Render one card from fixed copy so these specs run without the archived source. */
function fixtureTree() {
 return h(QuizCard,{number:3,correctAnswer:'B',children:[
  h('ul',{className:'q-opts',key:'options'},h('li',{},'A. 誤'),h('li',{},'B. 正')),
  h('details',{key:'answer'},h('summary',{},'解答を見る'),h('div',{className:'answer'},'B')),
 ]});
}
function fixture() {
 const view=render(fixtureTree());
 return {view,card:view.container.querySelector('.quiz')!,buttons:[...view.container.querySelectorAll('button')]};
}
test('choice readiness markers appear after hydration and the marked choices handle clicks',async()=>{
 const container=document.createElement('div'),tree=fixtureTree();container.innerHTML=renderToString(tree);document.body.appendChild(container);
 let root:Root|undefined;
 try{
  expect(container.querySelectorAll('.quiz-choice[data-hydrated]')).toHaveLength(0);
  await act(async()=>{root=hydrateRoot(container,tree);});
  expect(container.querySelectorAll('.quiz-choice[data-hydrated="true"]')).toHaveLength(2);
  fireEvent.click(container.querySelector('.quiz-choice[data-hydrated="true"]')!);
  expect(container.querySelector('[role="status"]')?.textContent).toBe('不正解');
 }finally{await act(async()=>{root?.unmount();});container.remove();}
});
test.each([0,1])('choice %i reopens the answer before a pending disclosure toggle event',choice=>{
 const {card,buttons}=fixture();
 fireEvent.click(buttons[0]);const details=card.querySelector('details')!;expect(details.open).toBe(true);
 const deferClosedToggle=(event:Event)=>{if(!details.open)event.stopImmediatePropagation();};
 details.addEventListener('toggle',deferClosedToggle,true);
 act(()=>{details.open=false;});
 fireEvent.click(buttons[choice]);expect(details.open).toBe(true);
 details.removeEventListener('toggle',deferClosedToggle,true);
});
test('the quiz wrapper is a group named by its existing label and keeps its answer state', () => {
 const {view,card,buttons}=fixture();
 expect(view.getByRole('group',{name:'問 3'})).toBe(card as HTMLElement);
 expect(card).not.toHaveAttribute('data-answer-state');
 fireEvent.click(buttons[1]);expect(card).toHaveAttribute('data-answer-state','correct');
 fireEvent.click(buttons[0]);expect(card).toHaveAttribute('data-answer-state','incorrect');
});
test('the status region exists empty before any answer and the same node receives each result', () => {
 const {card,buttons}=fixture();const region=card.querySelector('[role="status"]')!;
 expect(region).toBeEmptyDOMElement();expect(region.id).not.toBe('');expect(card.querySelector('.quiz-feedback')).toBeNull();
 for(const b of buttons)expect(b).not.toHaveAttribute('aria-describedby');
 fireEvent.click(buttons[0]);
 expect(card.querySelector('[role="status"]')).toBe(region);expect(region.textContent).toBe('不正解');
 expect(region.querySelector('.quiz-feedback')).toHaveAttribute('data-result','incorrect');
 expect(buttons[0]).toHaveAttribute('aria-describedby',region.id);
 fireEvent.click(buttons[1]);
 expect(card.querySelector('[role="status"]')).toBe(region);expect(region.textContent).toBe('正解');
 expect(region.querySelectorAll('.quiz-feedback')).toHaveLength(1);
 expect(buttons[0]).not.toHaveAttribute('aria-describedby');expect(buttons[1]).toHaveAttribute('aria-describedby',region.id);
});
test('source fidelity ignores only the group role on a quiz and an empty status region', async () => {
 const { canonical }=await import('./fidelity-helpers');
 const original=document.createElement('div'),enhanced=document.createElement('div');
 original.innerHTML='<div class="quiz"><p>問</p></div>';
 enhanced.innerHTML='<div class="quiz" role="group" aria-label="問 1"><p>問</p><div class="quiz-status" role="status" id="x"></div></div>';
 expect(canonical(enhanced.firstChild!)).toEqual(canonical(original.firstChild!));
 enhanced.querySelector('.quiz-status')!.textContent='追加';expect(canonical(enhanced.firstChild!)).not.toEqual(canonical(original.firstChild!));
 enhanced.querySelector('.quiz-status')!.remove();enhanced.querySelector('.quiz')!.setAttribute('role','alert');expect(canonical(enhanced.firstChild!)).not.toEqual(canonical(original.firstChild!));
 enhanced.querySelector('.quiz')!.setAttribute('role','group');enhanced.querySelector('.quiz')!.className='other';original.querySelector('.quiz')!.className='other';expect(canonical(enhanced.firstChild!)).not.toEqual(canonical(original.firstChild!));
});
test('source fidelity adapts only a single choice button and still detects added or changed wording', async () => {
 const { canonical }=await import('./fidelity-helpers');
 const original=document.createElement('div'),enhanced=document.createElement('div');
 original.innerHTML='<ul class="q-opts"><li>B. 検証</li></ul>';
 enhanced.innerHTML='<ul class="q-opts"><li><button class="quiz-choice" type="button">B. 検証</button></li></ul>';
 expect(canonical(enhanced.firstChild!)).toEqual(canonical(original.firstChild!));
 enhanced.querySelector('button')!.append('変更');expect(canonical(enhanced.firstChild!)).not.toEqual(canonical(original.firstChild!));
 enhanced.querySelector('button')!.textContent='B. 検証';enhanced.querySelector('li')!.append('追加');expect(canonical(enhanced.firstChild!)).not.toEqual(canonical(original.firstChild!));
});
