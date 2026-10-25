import {expect,test} from 'bun:test';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {getSearchIndex} from '../../../lib/search';
import inventory from '../../../../../docs/migration-inventory/ghost-in-the-wires-guide.json';
import {renderedPage,canonical,sourceTest,sourceDocument} from './fidelity-helpers';
test('all inventoried counts and original unique IDs survive',async()=>{
 const page=await renderedPage();
 for(const [s,n] of Object.entries(inventory.counts))expect(page.querySelectorAll(s).length,s).toBe(n);
 const ids=[...page.querySelectorAll('[id]')].map(e=>e.id);expect(new Set(ids).size).toBe(ids.length);
 expect(new Set(ids)).toEqual(new Set(inventory.ids));
});
test('every fragment resolves and external links keep safe targets',async()=>{
 const page=await renderedPage();
 for(const a of page.querySelectorAll('a[href]')){
  const href=a.getAttribute('href')!;
  if(href.startsWith('#'))expect(page.getElementById(href.slice(1)),href).not.toBeNull();
  if(a.getAttribute('target')==='_blank')expect(a.getAttribute('rel')).toContain('noopener');
 }
 expect(page.querySelector('script,style,link,iframe,form')).toBeNull();
 for(const e of page.querySelectorAll('*'))for(const a of e.attributes){expect(a.name).not.toMatch(/^on/i);if(['href','src'].includes(a.name))expect(a.value).not.toMatch(/^(javascript:|data:text\/html)/i);}
});
test('six rendered figure definitions match the immutable source definitions',async()=>{
 const page=await renderedPage();for(const [id,source] of Object.entries(inventory.diagrams)){
 expect(page.querySelector('.diagram[data-dg="'+id+'"] [data-definition]')?.getAttribute('data-definition')).toBe(source);
 }
});
test('shared dynamic and static search preserve all 58 complete source headings',async()=>{
 const entry=(await getSearchIndex()).find(p=>p.href===inventory.route);expect(entry).toBeDefined();expect(entry!.headings).toEqual(inventory.headings);
 const index=JSON.parse(readFileSync(new URL('../../../../public/search-index.json',import.meta.url),'utf8'));
 expect(index.find((p:{href:string})=>p.href===inventory.route)).toEqual(entry);
});
sourceTest('mutation probes reject removal of cells, list entries, timeline dates, answer text, references and emphasis',async()=>{
 const page=await renderedPage();
 for(const s of ['td','ol>li','.section ul>li','.timeline-year','details.qa','.src-card','strong','blockquote']){
 const node=page.querySelector(s)!;expect(node).not.toBeNull();const before=canonical(node);const clone=node.cloneNode(true) as Element;clone.replaceChildren();expect(canonical(clone)).not.toEqual(before);
 }
 expect(canonical(page.querySelector('#step-14')!)).toEqual(canonical(sourceDocument.querySelector('#step-14')!));
});
test('all 8 question answer panels toggle independently and preserve their contents',async()=>{
 const page=await renderedPage();const panels=[...page.querySelectorAll<HTMLDetailsElement>('details.qa')];expect(panels).toHaveLength(8);
 for(const panel of panels){const before=panel.textContent;expect(panel.open).toBe(false);(panel.querySelector('summary') as HTMLElement).click();expect(panel.open).toBe(true);expect(panel.textContent).toBe(before);(panel.querySelector('summary') as HTMLElement).click();expect(panel.open).toBe(false);}
});
test('structure hashes reject mutations even with no local archive',async()=>{
 const page=await renderedPage();for(const [selector,hash] of Object.entries(inventory.structures)){
 const node=page.querySelector(selector)!;expect(createHash('sha256').update(JSON.stringify(canonical(node))).digest('hex')).toBe(hash);
 const clone=node.cloneNode(true) as Element;clone.appendChild(page.createTextNode('MISSING-CONTENT-PROBE'));expect(createHash('sha256').update(JSON.stringify(canonical(clone))).digest('hex')).not.toBe(hash);
 }
});
