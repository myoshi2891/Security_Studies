import { expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { Window } from 'happy-dom';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { docsConfig } from '../../../config/docs';
import { extractHeadings, getSearchIndex } from '../../../lib/search';
import { sourceTest, sourceDocument, sourceHtml, definitions, canonical, renderedPage } from './fidelity-helpers';
const href='/docs/iso-iec-15408-1-2026-guide';
test('navigation exposes the new guide exactly once in Security Guides',()=>{
 const entries=docsConfig.sidebarNav.flatMap(g=>g.items).filter(i=>i.href===href);expect(entries).toHaveLength(1);expect(docsConfig.sidebarNav.find(g=>g.title==='Security Guides')!.items).toContainEqual(entries[0]);
});
test('runtime and shipped static search include the registered page and all headings',async()=>{
 const entry=(await getSearchIndex()).find(e=>e.href===href);expect(entry).toBeDefined();
 const staticEntry=JSON.parse(readFileSync('public/search-index.json','utf8')).find((e:{href:string})=>e.href===href);expect(staticEntry).toEqual(entry);
 const doc=await renderedPage();const headings=[...doc.querySelectorAll('h1,h2,h3,h4')].map(e=>e.textContent!.replace(/\s+/g,' ').trim());expect(entry!.headings).toEqual(headings);expect(entry!.title).toContain('15408-1:2026');
});
sourceTest('all diagrams retain exact definitions, parse successfully and use source colors and spacing',async()=>{
 const {diagrams}=await import('./diagrams');expect([...definitions]).toEqual(Object.entries(diagrams));expect(definitions.size).toBe(17);
 const {default:mermaid}=await import('mermaid');for(const [id,def] of definitions)expect(await mermaid.parse(def),id).toBeTruthy();
 const {diagramConfig}=await import('./MermaidFigure');expect(diagramConfig.theme).toBe('base');expect(diagramConfig.securityLevel).toBe('strict');expect(diagramConfig.flowchart).toEqual({useMaxWidth:false,htmlLabels:true,nodeSpacing:45,rankSpacing:50,padding:12});
 const theme=sourceHtml.match(/themeVariables:\s*\{([\s\S]*?)\n\s*\},/)![1];for(const [,key,val] of theme.matchAll(/(\w+):\s*'([^']*)'/g))expect((diagramConfig.themeVariables as Record<string,unknown>)[key]).toBe(val);
});
sourceTest('each decorative source icon uses a local SVG with preserved size hooks',async()=>{
 const {GuideIcon}=await import('./GuideIcon');for(const el of sourceDocument.querySelectorAll('i.ti:not(.ti-menu-2)')){const name=[...el.classList].find(c=>c.startsWith('ti-'))!;const svg=renderToStaticMarkup(createElement(GuideIcon,{name:name as Parameters<typeof GuideIcon>[0]['name'],className:el.className}));expect(svg).toContain('<svg');expect(svg).toContain('aria-hidden="true"');}
});
sourceTest('whole-page inventory preserves every table cell, list, exercise, reference, link and ID',async()=>{
 const page=await renderedPage();for(const selector of ['section','table','th','td','ul','ol','li','.quiz-card','details','.ref-card','strong','em','code']){
 const content=(d:Document)=>[...d.querySelectorAll(selector)].filter(e=>!e.closest('.mermaid')).map(e=>canonical(e));expect(content(page),selector).toEqual(content(sourceDocument));}
 for(const a of page.querySelectorAll('a[href^="#"]'))expect(page.getElementById(a.getAttribute('href')!.slice(1))).not.toBeNull();
});
test('page counts remain enforceable even when the original is absent in CI',async()=>{
 const page=await renderedPage();for(const [selector,count] of [['section',21],['table',31],['.diagram',17],['.ref-card',19],['.quiz-card',10]] as const)expect(page.querySelectorAll(selector),selector).toHaveLength(count);
 expect(extractHeadings(readFileSync(new URL('./page.mdx',import.meta.url),'utf8')).length).toBeGreaterThan(70);
});
sourceTest('mutations prove omissions of cells, emphasis, links and list items are detected',async()=>{
 const page=await renderedPage();for(const selector of ['#sec-0 li','#sec-7 td','#sec-20 a','#sec-1 strong']){const actual=page.querySelector(selector)!;const original=sourceDocument.querySelector(selector)!;expect(canonical(actual)).toEqual(canonical(original));const broken=actual.cloneNode(true) as Element;broken.textContent='欠落';expect(canonical(broken)).not.toEqual(canonical(original));}
});
test('both app color schemes retain source table cells on hover and number list markers',async()=>{
 const css=['../../globals.css','../docs-layout.css','./iso15408-guide.css'].map(p=>readFileSync(new URL(p,import.meta.url),'utf8')).join('\n').replaceAll(':hover','.test-hover');
 for(const scheme of ['light','dark'] as const){const w=new Window({settings:{device:{prefersColorScheme:scheme}}});try{w.document.head.innerHTML='<style>'+css+'</style>';w.document.body.innerHTML='<article class="prose">'+(await renderedPage()).body.innerHTML+'</article>';const cells=[...w.document.querySelectorAll('td')];const before=cells.map(cell=>w.getComputedStyle(cell).backgroundColor);for(const tr of w.document.querySelectorAll('tr'))tr.classList.add('test-hover');expect(cells.map(cell=>w.getComputedStyle(cell).backgroundColor)).toEqual(before);for(const ol of w.document.querySelectorAll('.section ol'))expect(w.getComputedStyle(ol).listStyleType).toBe('decimal');}finally{await w.happyDOM.close();}}
});
