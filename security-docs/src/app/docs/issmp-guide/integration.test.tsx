import { expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { docsConfig } from '@/config/docs';
import { getSearchIndex } from '@/lib/search';
import { inventory, renderedPage, canonical, structure } from './fidelity-helpers';

test('all source counts, 54 unique IDs, 80 local icons and every internal link survive the migration', async () => {
 const d=await renderedPage();
 for(const [selector,count] of Object.entries(inventory.counts))expect(d.querySelectorAll(selector).length,selector).toBe(count);
 expect([...d.querySelectorAll('[id]')].map(e=>e.id).sort()).toEqual([...inventory.ids].sort());
 expect(new Set([...d.querySelectorAll('[id]')].map(e=>e.id)).size).toBe(54);
 expect(d.querySelectorAll('i.ti svg')).toHaveLength(80);
 for(const a of d.querySelectorAll('a[href^="#"]'))expect(d.getElementById(a.getAttribute('href')!.slice(1))).not.toBeNull();
 expect(d.querySelectorAll('script,iframe,form,link,main')).toHaveLength(0);
 for(const e of d.querySelectorAll('*'))for(const a of [...e.attributes]){
  expect(a.name).not.toMatch(/^on/i);
  if(['href','src'].includes(a.name))expect(a.value).not.toMatch(/^\s*(?:javascript:|data:text\/html)/i);
 }
});
test('all 15 questions keep 60 options, exact answers and explanations, without truncating the source-status table', async () => {
 const d=await renderedPage();
 expect(structure(d.getElementById('s47')!)).toBe(inventory.structures['#s47']);
 expect(d.querySelectorAll('#s47 .qcard')).toHaveLength(15);
 expect(d.querySelectorAll('#s47 .opts > li')).toHaveLength(60);
 const rows=[...d.querySelectorAll('#s47 tbody tr')];
 expect(rows).toHaveLength(15);
 expect(rows.map(row=>row.children[0].textContent?.trim())).toEqual(Array.from({length:15},(_,i)=>`Q${i+1}`));
 expect(rows.map(row=>row.children[1].textContent?.trim())).toEqual(['B','A','C','C','D','B','B','B','B','B','C','B','B','B','C']);
 expect(structure(d.getElementById('s49')!)).toBe(inventory.structures['#s49']);
});
test('the certification registry, static search and dynamic search agree on one route and every source heading', async () => {
 const category=docsConfig.sidebarNav.find(g=>g.id==='learning')!;
 expect(category.items.filter(i=>i.href===inventory.route)).toHaveLength(1);
 const index=(await getSearchIndex()).filter(i=>i.href===inventory.route);
 expect(index).toHaveLength(1);
 const stored=JSON.parse(readFileSync(new URL('../../../../public/search-index.json',import.meta.url),'utf8'));
 expect(stored.filter((i:{href:string})=>i.href===inventory.route)).toEqual(index);
 expect(index[0].headings).toEqual(inventory.headings);
 const routeHeadings=[...(await renderedPage()).querySelectorAll('h1,h2,h3,h4,h5,h6')].map(e=>e.textContent!.replace(/\s+/g,' ').trim());
 expect(routeHeadings).toEqual(inventory.headings);
});
test('negative controls detect missing cells, bullet classes, numbering, nesting, emphasis, links and answers', async () => {
 const d=await renderedPage();
 for(const selector of ['td','li','ol','ul','strong','.callout.source a','.qcard','#s47 tbody td']){
  const original=[...d.querySelectorAll('section')].find(e=>e.querySelector(selector))!;
  expect(original,selector).toBeDefined();const copy=original.cloneNode(true) as Element;
  copy.querySelector(selector)!.remove();expect(canonical(copy)).not.toEqual(canonical(original));
 }
 const source=d.querySelector('.callout.source')!,copy=source.cloneNode(true) as Element;
 copy.classList.remove('source');expect(canonical(copy)).not.toEqual(canonical(source));
 const numbered=d.querySelector('ol')!,changed=numbered.cloneNode(true) as Element;
 changed.setAttribute('start','2');expect(canonical(changed)).not.toEqual(canonical(numbered));
});
