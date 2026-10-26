import {expect,test} from 'bun:test';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {docsConfig} from '../../../config/docs';
import {getSearchIndex} from '../../../lib/search';
import inventory from '../../../../../docs/migration-inventory/issap-guide.json';
import {renderedPage,canonical} from './fidelity-helpers';

test('all original counts, IDs and fragment links survive without introducing unsafe HTML',async()=>{
 const page=await renderedPage();
 for(const [s,n] of Object.entries(inventory.counts))expect(page.querySelectorAll(s==='pre.mermaid'?'.mermaid-target':s).length,s).toBe(n);
 const ids=[...page.querySelectorAll('[id]')].map(e=>e.id);expect(new Set(ids).size).toBe(ids.length);expect(new Set(ids)).toEqual(new Set(inventory.ids));
 for(const a of page.querySelectorAll('a[href]')){const href=a.getAttribute('href')!;if(href.startsWith('#'))expect(page.getElementById(href.slice(1)),href).not.toBeNull();if(a.getAttribute('target')==='_blank')expect(a.getAttribute('rel')).toContain('noopener');}
 expect(page.querySelector('script,style,link,iframe,form')).toBeNull();for(const e of page.querySelectorAll('*'))for(const a of e.attributes){expect(a.name).not.toMatch(/^on/i);if(['href','src'].includes(a.name))expect(a.value).not.toMatch(/^(javascript:|data:text\/html)/i);}
});
test('all twenty-two rendered diagram definitions remain byte exact and all 17 original structure hashes resist deletion',async()=>{
 const page=await renderedPage();for(const [id,definition] of Object.entries(inventory.diagrams))expect(page.getElementById(id)?.getAttribute('data-definition')).toBe(definition);
 for(const [selector,hash] of Object.entries(inventory.structures)){const node=page.querySelector(selector)!;expect(node).not.toBeNull();expect(createHash('sha256').update(JSON.stringify(canonical(node))).digest('hex')).toBe(hash);const clone=node.cloneNode(true) as Element;clone.appendChild(page.createTextNode('MISSING-CONTENT-PROBE'));expect(createHash('sha256').update(JSON.stringify(canonical(clone))).digest('hex')).not.toBe(hash);}
});
test('certification navigation registers the complete guide exactly once',()=>{
 expect(docsConfig.sidebarNav.find(g=>g.id==='learning')!.items.filter(i=>i.href===inventory.route)).toEqual([{title:'ISSAP (Information Systems Security Architecture Professional)',href:inventory.route}]);
 expect(docsConfig.sidebarNav.flatMap(g=>g.items).filter(i=>i.href===inventory.route)).toHaveLength(1);
});
test('dynamic and static search retain all 107 complete source headings',async()=>{
 const entry=(await getSearchIndex()).find(p=>p.href===inventory.route);expect(entry).toBeDefined();
 // Search normalizes the source <br> to a word boundary; source DOM textContent does not.
 expect(entry!.headings).toEqual(inventory.headings);
 const index=JSON.parse(readFileSync(new URL('../../../../public/search-index.json',import.meta.url),'utf8'));expect(index.find((p:{href:string})=>p.href===inventory.route)).toEqual(entry);
});
test('every original icon class maps to a local SVG, preserving inline source styling',async()=>{
 const page=await renderedPage();for(const icon of page.querySelectorAll('i.ti'))expect(icon.querySelector('svg'),icon.className).not.toBeNull();

});

test('all twelve questions, answers and thirty references retain their original order and source citations',async()=>{const page=await renderedPage();expect([...page.querySelectorAll('.qa .q>.badge')].map(el=>el.textContent)).toEqual(Array.from({length:12},(_,i)=>'Q'+(i+1)));expect(page.querySelectorAll('.qa .a')).toHaveLength(12);expect([...page.querySelectorAll('.ref>.badge')].map(el=>el.textContent)).toEqual(Array.from({length:30},(_,i)=>'S'+(i+1)));expect(page.querySelectorAll('.qa .a a.cite').length).toBeGreaterThanOrEqual(12);});
