import { expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { createElement as h } from 'react';
import { cleanup, render, fireEvent } from '@testing-library/react';
import { docsConfig } from '@/config/docs';
import { getSearchIndex } from '@/lib/search';
import { inventory, renderedPage, evaluatedPage, hash, canonical } from './fidelity-helpers';

test('complete source counts, all 76 unique IDs, internal links and safe attributes are preserved', async () => {
 const d=await renderedPage();for(const [s,c] of Object.entries(inventory.counts))expect(d.querySelectorAll(s).length,s).toBe(c);
 expect([...d.querySelectorAll('[id]')].map(e=>e.id).sort()).toEqual([...inventory.ids].sort());
 for(const a of d.querySelectorAll('a[href^="#"]'))expect(d.getElementById(a.getAttribute('href')!.slice(1))).not.toBeNull();
 expect(d.querySelectorAll('script,iframe,form,[onclick],a[href^="javascript:"]')).toHaveLength(0);
});
test('all four formulas preserve exact code whitespace and every source reference retains order and label', async () => {
 const d=await renderedPage();expect([...d.querySelectorAll('pre code')].map(e=>hash(e.textContent!))).toEqual(inventory.codes);
 expect([...d.querySelectorAll('.ref-card')].map(e=>e.textContent!.replace(/\s+/g,' ').trim())).toEqual(inventory.references);
});
test('ten questions keep every answer and explanation verbatim; six inputs and their labels toggle independently', async () => {
 const d=await renderedPage();expect([...d.querySelectorAll('.quiz .answer')].map(e=>e.textContent!.replace(/\s+/g,' ').trim())).toEqual(inventory.quizAnswers);
 const {default:Page}=await evaluatedPage();const v=render(h(Page,{}));try{
 const inputs=[...v.container.querySelectorAll<HTMLInputElement>('.checklist input')];expect(inputs).toHaveLength(6);
 for(let i=0;i<inputs.length;i++){
  fireEvent.click(inputs[i].closest('label')!);expect(inputs[i].checked).toBe(true);expect(inputs.filter(e=>e.checked)).toHaveLength(i+1);
  for(const other of inputs.slice(i+1))expect(other.checked).toBe(false);
 }
 for(const input of inputs){fireEvent.click(input);expect(input.checked).toBe(false);}
 for(const q of v.container.querySelectorAll('.quiz')){expect(q.querySelector('summary')).not.toBeNull();expect(q.querySelector('details .answer')).not.toBeNull();}
 }finally{cleanup();}
});
test('certification navigation and static/dynamic search register the route once with all 120 headings', async () => {
 expect(docsConfig.sidebarNav.flatMap(g=>g.items).filter(i=>i.href===inventory.route)).toHaveLength(1);
 const index=(await getSearchIndex()).filter(i=>i.href===inventory.route);expect(index).toHaveLength(1);
 const stored=JSON.parse(readFileSync(new URL('../../../../public/search-index.json',import.meta.url),'utf8'));expect(stored.filter((i:{href:string})=>i.href===inventory.route)).toEqual(index);
 expect(index[0].headings).toEqual([...(await renderedPage()).querySelectorAll('h1,h2,h3,h4,h5,h6')].map(e=>e.textContent!.replace(/\s+/g,' ').trim()));
});
test('mutation probes reject lost cells, bullets, emphasis, references, answers and checkboxes', async () => {
 const d=await renderedPage();for(const selector of ['td','li','strong','a.cite','.answer','input']){const section=[...d.querySelectorAll('section')].find(e=>e.querySelector(selector))!;expect(section).not.toBeUndefined();const copy=section.cloneNode(true) as Element;copy.querySelector(selector)!.remove();expect(canonical(copy)).not.toEqual(canonical(section));}
});

test('all twenty-two figures retain the original diagram frame rather than just its definition', async () => {
 const d=await renderedPage();expect(d.querySelectorAll('.diagram[data-diagram]')).toHaveLength(22);
});
