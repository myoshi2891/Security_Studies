import {expect,test} from 'bun:test';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {docsConfig} from '../../../config/docs';
import {getSearchIndex} from '../../../lib/search';
import {renderedPage,evaluatedPage,sourceTest,sourceDocument,canonical} from './fidelity-helpers';
const href='/docs/secrets-and-lies-guide';
test('route is registered exactly once under Security Guides',()=>{
 expect(docsConfig.sidebarNav.flatMap(g=>g.items).filter(i=>i.href===href)).toHaveLength(1);expect(docsConfig.sidebarNav.find(g=>g.id==='engineering')!.items.some(i=>i.href===href)).toBe(true);
});
test('static and dynamic search indexes agree and retain all 59 headings',async()=>{
 const dynamic=(await getSearchIndex()).find(p=>p.href===href);expect(dynamic).toBeDefined();const index=JSON.parse(readFileSync(join(import.meta.dir,'../../../../public/search-index.json'),'utf8'));expect(index.find((p:{href:string})=>p.href===href)).toEqual(dynamic);expect(dynamic!.headings).toHaveLength(59);expect(dynamic!.content).toContain('Secrets and Lies');
});
sourceTest('all source IDs and local anchors resolve and metadata retains the original heading',async()=>{
 const page=await renderedPage();const ids=(d:Document)=>[...d.querySelectorAll('[id]')].map(e=>e.id);expect(ids(page)).toEqual(ids(sourceDocument));
 for(const link of page.querySelectorAll<HTMLAnchorElement>('a[href^="#"]'))expect(page.getElementById(link.hash.slice(1))).not.toBeNull();
 expect((await evaluatedPage()).metadata).toMatchObject({title:sourceDocument.querySelector('h1')!.textContent!.replace(/\s+/g,' ').trim()});
});
test('complete inventory remains enforced when archived originals are absent in CI',async()=>{
 const page=await renderedPage();for(const [selector,count] of Object.entries({'section[id]':11,'h1,h2,h3':59,'table':24,'th,td':627,'.main li':51,'[data-id]':12,'input[type="checkbox"]':8,'h3.ex + ol > li':31,'.src-card':21}))expect(page.querySelectorAll(selector).length,selector).toBe(count);
});
sourceTest('mutation probes detect missing table cells, exercise items, emphasis and reference links',async()=>{
 const page=await renderedPage();for(const selector of ['td','h3.ex + ol > li','strong','a.cite']){const original=page.getElementById('step-4')!;expect(canonical(original)).toEqual(canonical(sourceDocument.getElementById('step-4')!));const candidate=original.cloneNode(true) as Element;const item=candidate.querySelector(selector)??candidate.querySelector('a');expect(item).not.toBeNull();item!.remove();expect(canonical(candidate)).not.toEqual(canonical(sourceDocument.getElementById('step-4')!));}
});
test('compiled page excludes unsafe assets and duplicate IDs',async()=>{
 const page=await renderedPage();expect(page.querySelector('script,iframe,form,link')).toBeNull();const ids=[...page.querySelectorAll('[id]')].map(e=>e.id);expect(new Set(ids).size).toBe(ids.length);
 for(const el of page.querySelectorAll('*'))for(const a of el.attributes){expect(a.name).not.toMatch(/^on/i);if(['href','src'].includes(a.name))expect(a.value).not.toMatch(/^(javascript:|data:text\/html)/i);}
});
