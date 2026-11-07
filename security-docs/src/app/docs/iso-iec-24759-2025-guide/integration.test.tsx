import { expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { createElement as h } from 'react';
import { render, fireEvent, cleanup } from '@testing-library/react';
import { docsConfig } from '@/config/docs';
import { getSearchIndex } from '@/lib/search';
import { inventory, renderedPage, evaluatedPage, hash, canonical } from './fidelity-helpers';

test('all source counts, 51 IDs and internal and external targets survive without unsafe scripts',async()=>{
 const page=await renderedPage();
 for(const [s,count] of Object.entries(inventory.counts))expect(page.querySelectorAll(s).length,s).toBe(count);
 expect([...page.querySelectorAll('[id]')].map(e=>e.id).sort()).toEqual([...inventory.ids].sort());
 for(const a of page.querySelectorAll('a[href^="#"]'))expect(page.getElementById(decodeURIComponent(a.getAttribute('href')!.slice(1)))).not.toBeNull();
 expect(page.querySelectorAll('[onclick],script,iframe,form,a[href^="javascript:"]')).toHaveLength(0);
});
test('Python self-test retains exact bytes, syntax colors and source references',async()=>{
 const code=(await renderedPage()).querySelector('pre code')!;
 expect(hash(code.textContent!)).toBe(inventory.codes[0]);expect(code).toHaveClass('language-python','hljs');expect(code.querySelector('.hljs-keyword')).not.toBeNull();
});
test('standards navigation and dynamic/static search expose this route and all 48 headings exactly once',async()=>{
 const items=docsConfig.sidebarNav.flatMap(g=>g.items).filter(i=>i.href===inventory.route);expect(items).toHaveLength(1);
 const dynamic=(await getSearchIndex()).filter(i=>i.href===inventory.route);
 const index=JSON.parse(readFileSync(new URL('../../../../public/search-index.json',import.meta.url),'utf8'));
 expect(dynamic).toHaveLength(1);expect(index.filter((i:{href:string})=>i.href===inventory.route)).toEqual(dynamic);
 const page=await renderedPage();expect(dynamic[0].headings).toEqual([...page.querySelectorAll('h1,h2,h3,h4,h5,h6')].map(e=>e.textContent!.replace(/\s+/g,' ').trim()));
});
test('real Japanese fragment links activate and focus all nineteen source chapters',async()=>{
 const saved=globalThis.IntersectionObserver;
 globalThis.IntersectionObserver=class{observe(){}disconnect(){}} as unknown as typeof IntersectionObserver;
 try{
 const {default:Page}=await evaluatedPage();const view=render(h(Page,{}));
 for(const a of view.container.querySelectorAll<HTMLAnchorElement>('.sidebar nav a')){
  fireEvent.click(view.container.querySelector('#menuBtn')!);fireEvent.click(a);
  expect(a).toHaveAttribute('aria-current','location');expect(document.activeElement).toBe(view.container.querySelector('section[id="'+decodeURIComponent(a.hash.slice(1))+'"] h2'));
 }
 }finally{cleanup();globalThis.IntersectionObserver=saved;}
});
test('content comparisons detect removed cells, list items, URLs, emphasis and diagram IDs',async()=>{
 const page=await renderedPage();const section=page.querySelector('section')!;const initial=canonical(section);
 for(const selector of ['td','li','a','strong']){
  const sectionWithNode=[...page.querySelectorAll('section')].find(e=>e.querySelector(selector))!;
  const copy=sectionWithNode.cloneNode(true) as Element;copy.querySelector(selector)!.remove();expect(canonical(copy)).not.toEqual(canonical(sectionWithNode));
 }
 expect(initial).not.toBeNull();const copy=page.querySelector('section:has(.diagram-body)')!.cloneNode(true) as Element;copy.querySelector('.diagram-body')!.setAttribute('data-id','missing');expect(canonical(copy)).not.toEqual(canonical(page.querySelector('section:has(.diagram-body)')!));
});
