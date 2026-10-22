import {expect,test} from 'bun:test';
import {readFileSync} from 'node:fs';
import {docsConfig} from '../../../config/docs';
import {getSearchIndex} from '../../../lib/search';
import {renderedPage,evaluatedPage,sourceTest,sourceDocument} from './fidelity-helpers';
const href='/docs/zero-trust-networks-2nd-edition-guide';
test('route is registered exactly once under Security Guides',()=>{
 expect(docsConfig.sidebarNav.flatMap(g=>g.items).filter(i=>i.href===href)).toHaveLength(1);expect(docsConfig.sidebarNav.find(g=>g.id==='engineering')!.items.some(i=>i.href===href)).toBe(true);
});
test('static and dynamic search indexes contain matching metadata, bounded snippets and all 124 headings',async()=>{
 const dynamic=(await getSearchIndex()).find(p=>p.href===href);expect(dynamic).toBeDefined();const index=JSON.parse(readFileSync('public/search-index.json','utf8'));expect(index.find((p:{href:string})=>p.href===href)).toEqual(dynamic);expect(dynamic!.headings).toHaveLength(124);expect(dynamic!.content).toContain('Zero Trust Networks');expect(dynamic!.content.length).toBeLessThanOrEqual(500);
});
sourceTest('all source IDs, source references and anchors resolve with source order intact',async()=>{
 const page=await renderedPage();const ids=(d:Document)=>[...d.querySelectorAll('main [id],.guide-content [id]')].map(e=>e.id);expect(ids(page)).toEqual(ids(sourceDocument));
 for(const link of page.querySelectorAll<HTMLAnchorElement>('a[href^="#"]'))expect(page.getElementById(link.hash.slice(1))).not.toBeNull();
 expect(page.querySelectorAll('.src')).toHaveLength(20);expect(page.querySelectorAll('.step-no')).toHaveLength(90);expect(page.querySelectorAll('th,td')).toHaveLength(1344);
 expect((await evaluatedPage()).metadata).toMatchObject({title:sourceDocument.querySelector('h1')!.textContent});
});
test('compiled page excludes unsafe assets and duplicate IDs',async()=>{
 const page=await renderedPage();expect(page.querySelector('script,iframe,form,link')).toBeNull();const ids=[...page.querySelectorAll('[id]')].map(e=>e.id);expect(new Set(ids).size).toBe(ids.length);
 for(const el of page.querySelectorAll('*'))for(const a of el.attributes){expect(a.name).not.toMatch(/^on/i);if(['href','src'].includes(a.name))expect(a.value).not.toMatch(/^(javascript:|data:text\/html)/i);}
});
