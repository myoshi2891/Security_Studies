import { afterEach, expect, test } from 'bun:test';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { createElement as h } from 'react';
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
  expect(cards.filter(c=>c.querySelector('[role="status"]'))).toHaveLength(1);
 }
});
test('answering two questions maintains independent choices and announces each result through its own description', async () => {
 const v=await mounted();const cards=[...v.container.querySelectorAll('.quiz')];
 for(let i=0;i<2;i++)fireEvent.click(cards[i].querySelectorAll('button')[i]);
 const status=cards.slice(0,2).map(c=>c.querySelector('[role="status"]')!);expect(new Set(status.map(e=>e.id)).size).toBe(2);
 for(let i=0;i<2;i++)expect(cards[i].querySelector('button[aria-pressed="true"]')).toHaveAttribute('aria-describedby',status[i].id);
 expect(cards[2].querySelector('[role="status"]')).toBeNull();
});
test('the original answer disclosure can still be toggled after choosing and reopens for a new choice', async () => {
 const v=await mounted();const c=v.container.querySelector('.quiz')!;const b=c.querySelectorAll('button');expect(b).toHaveLength(4);
 fireEvent.click(b[0]);const details=c.querySelector('details')!;expect(details.open).toBe(true);
 details.open=false;fireEvent(details,new Event('toggle'));expect(details.open).toBe(false);
 fireEvent.click(b[1]);expect(details.open).toBe(true);
 assertCopy(c,0);
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
