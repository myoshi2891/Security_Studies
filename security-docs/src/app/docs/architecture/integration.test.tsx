import {expect,test} from 'bun:test';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {docsConfig} from '@/config/docs';
import {getSearchIndex} from '@/lib/search';
import {inventory,renderedPage,canonical} from './fidelity-helpers';
test('every original element count, unique ID, local icon and fragment destination survives',async()=>{
 const d=await renderedPage();
 for(const [s,n] of Object.entries(inventory.counts))expect(d.querySelectorAll(s).length,s).toBe(n);
 expect([...d.querySelectorAll('[id]')].map(e=>e.id).sort()).toEqual([...inventory.ids].sort());
 expect(new Set(inventory.ids).size).toBe(inventory.ids.length);
 expect(d.querySelectorAll('i.ti svg')).toHaveLength(108);
 for(const a of d.querySelectorAll('a[href^="#"]'))expect(d.getElementById(a.getAttribute('href')!.slice(1))).not.toBeNull();
 expect(d.querySelectorAll('script,iframe,form,link,main')).toHaveLength(0);
 for(const e of d.querySelectorAll('*'))for(const a of [...e.attributes]){expect(a.name).not.toMatch(/^on/i);if(['href','src'].includes(a.name))expect(a.value).not.toMatch(/^\s*(?:javascript:|data:text\/html)/i);}
});
test('all eleven diagram definitions retain fixed original hashes and corresponding targets',async()=>{
 const {diagrams}=await import('./diagrams');const d=await renderedPage();
 expect(Object.keys(diagrams)).toEqual(Object.keys(inventory.diagrams));
 for(const [id,hash] of Object.entries(inventory.diagrams)){expect(createHash('sha256').update(diagrams[id]).digest('hex')).toBe(hash);expect(d.getElementById(id)?.getAttribute('data-definition')).toBe(diagrams[id]);}
});
test('one existing route keeps original headings in live and stored search',async()=>{
 expect(docsConfig.sidebarNav.flatMap(g=>g.items).filter(i=>i.href===inventory.route)).toHaveLength(1);
 const index=(await getSearchIndex()).filter(i=>i.href===inventory.route);expect(index).toHaveLength(1);expect(index[0].headings).toEqual(inventory.headings);
 const stored=JSON.parse(readFileSync(new URL('../../../../public/search-index.json',import.meta.url),'utf8'));expect(stored.filter((i:{href:string})=>i.href===inventory.route)).toEqual(index);
 expect([...(await renderedPage()).querySelectorAll('h1,h2,h3,h4,h5,h6')].map(e=>e.textContent!.replace(/\s+/g,' ').trim())).toEqual(inventory.headings);
});
test('negative controls reject missing bullets, numbering, table cells, emphasis, URLs and checklist labels',async()=>{
 const d=await renderedPage();
 for(const selector of ['td','li','ol','ul','strong','a[href]','.ck-num','.ck-text']){const node=[...d.querySelectorAll('section')].find(e=>e.querySelector(selector))!;expect(node,selector).toBeDefined();const copy=node.cloneNode(true) as Element;copy.querySelector(selector)!.remove();expect(canonical(copy)).not.toEqual(canonical(node));}
 const ol=d.querySelector('ol')!,copy=ol.cloneNode(true) as Element;copy.setAttribute('start','2');expect(canonical(copy)).not.toEqual(canonical(ol));
});
