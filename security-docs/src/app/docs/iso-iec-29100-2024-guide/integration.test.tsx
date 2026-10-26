import {expect,test} from 'bun:test';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {docsConfig} from '../../../config/docs';
import {getSearchIndex} from '../../../lib/search';
import inventory from '../../../../../docs/migration-inventory/iso-iec-29100-2024-guide.json';
import {diagrams} from './diagrams';
import {renderedPage,canonical} from './fidelity-helpers';

test('all original counts, IDs and fragment links survive without introducing unsafe HTML',async()=>{
 const page=await renderedPage();
 for(const [s,n] of Object.entries(inventory.counts))expect(page.querySelectorAll(s==='pre.mermaid'?'.mermaid-target':s).length,s).toBe(n);
 const ids=[...page.querySelectorAll('[id]')].map(e=>e.id);expect(new Set(ids).size).toBe(ids.length);expect(new Set(ids)).toEqual(new Set(inventory.ids));
 for(const a of page.querySelectorAll('a[href]')){const href=a.getAttribute('href')!;if(href.startsWith('#'))expect(page.getElementById(href.slice(1)),href).not.toBeNull();if(a.getAttribute('target')==='_blank')expect(a.getAttribute('rel')).toContain('noopener');}
 expect(page.querySelector('script,style,link,iframe,form')).toBeNull();for(const e of page.querySelectorAll('*'))for(const a of e.attributes){expect(a.name).not.toMatch(/^on/i);if(['href','src'].includes(a.name))expect(a.value).not.toMatch(/^(javascript:|data:text\/html)/i);}
});
test('all twelve rendered diagram definitions remain byte exact and all 20 original structure hashes resist deletion',async()=>{
 const page=await renderedPage();for(const [id,definition] of Object.entries(diagrams))expect(page.getElementById(id)?.getAttribute('data-definition')).toBe(definition);
 for(const [selector,hash] of Object.entries(inventory.structures)){const node=page.querySelector(selector)!;expect(node).not.toBeNull();expect(createHash('sha256').update(JSON.stringify(canonical(node))).digest('hex')).toBe(hash);const clone=node.cloneNode(true) as Element;clone.appendChild(page.createTextNode('MISSING-CONTENT-PROBE'));expect(createHash('sha256').update(JSON.stringify(canonical(clone))).digest('hex')).not.toBe(hash);}
});
test('all Python, JSON and YAML samples retain exact whitespace hashes and local server-side syntax highlighting',async()=>{
 const page=await renderedPage(),codes=[...page.querySelectorAll('pre code')];expect(codes).toHaveLength(4);
 for(let i=0;i<codes.length;i++){expect(createHash('sha256').update(codes[i].textContent!).digest('hex')).toBe(inventory.codeHashes[i]);expect(codes[i].classList.contains('hljs')).toBe(true);expect(codes[i].querySelector('[class^="hljs-"]')).not.toBeNull();}
});
test('shared Security Guides navigation registers the complete guide exactly once',()=>{
 expect(docsConfig.sidebarNav.find(g=>g.id==='iso')!.items.filter(i=>i.href===inventory.route)).toEqual([{title:'ISO/IEC 29100:2024 プライバシーフレームワーク',href:inventory.route}]);
 expect(docsConfig.sidebarNav.flatMap(g=>g.items).filter(i=>i.href===inventory.route)).toHaveLength(1);
});
test('dynamic and static search retain all 96 complete source headings',async()=>{
 const entry=(await getSearchIndex()).find(p=>p.href===inventory.route);expect(entry).toBeDefined();
 // Search normalizes the source <br> to a word boundary; source DOM textContent does not.
 expect(entry!.headings).toEqual(inventory.headings);
 const index=JSON.parse(readFileSync(new URL('../../../../public/search-index.json',import.meta.url),'utf8'));expect(index.find((p:{href:string})=>p.href===inventory.route)).toEqual(entry);
});
test('every original icon class maps to a local SVG, preserving inline source styling',async()=>{
 const page=await renderedPage();for(const icon of page.querySelectorAll('i.ti'))expect(icon.querySelector('svg'),icon.className).not.toBeNull();

});
