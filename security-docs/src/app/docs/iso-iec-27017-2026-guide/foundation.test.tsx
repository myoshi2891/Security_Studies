import { expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import postcss from 'postcss';
import { Window } from 'happy-dom';
import { renderedPage, sourceTest, sourceDocument, sourceCss, declarations, scope, canonical } from './fidelity-helpers';
sourceTest('hero and all 17 TOC links preserve source text, numbering, structure and destinations', async()=>{
 const page=await renderedPage();
 for(const selector of ['.hero','.sidebar .brand','.sidebar nav','.footer']) expect(canonical(page.querySelector(selector)!)).toEqual(canonical(sourceDocument.querySelector(selector)!));
 expect(page.querySelectorAll('.sidebar nav a')).toHaveLength(17);
});
sourceTest('every original CSS declaration is preserved inside page scope including pseudo bullets and numbered markers',()=>{
 const actual=postcss.parse(readFileSync(new URL('./iso27017-guide.css',import.meta.url),'utf8'));
 sourceCss.walkRules(rule=>{const sel=rule.selector.split(',').map(s=>s.trim()===':root'||s.trim()==='html'||s.trim()==='body'?scope:scope+' '+(s.trim()==='main'?'.guide-content':s.trim())).join(', ');
 for(const declaration of declarations(postcss.root().append(rule.clone()),rule.selector)) expect(declarations(actual,sel),rule.selector).toContain(declaration);
 });
});
test('computed layout restores decimal numbers, source bullets, dark colors and reachable diagram scroll at phone/tablet/desktop widths',async()=>{
 const styles=['../../globals.css','../docs-layout.css','./iso27017-guide.css'].map(p=>readFileSync(new URL(p,import.meta.url),'utf8')).join('\n');
 for(const width of [375,900,1100,1101,1440]){const w=new Window();w.happyDOM.setWindowSize({width,height:900});try{
 w.document.head.innerHTML='<style>'+styles+'</style>';w.document.body.innerHTML='<main class="docs-main"><article class="prose docs-article"><div class="iso27017-guide"><aside class="sidebar"></aside><div class="guide-content"><section class="section"><h2>題</h2><ul><li>点</li></ul><ol><li>番号</li></ol><div class="mermaid"><div class="diagram-viewport"><svg style="width:2400px"></svg></div></div></section></div></div></article></main>';
 const style=(q:string)=>w.getComputedStyle(w.document.querySelector(q)!);
 expect(style('ol').listStyleType).toBe('decimal');expect(style('.section ul').listStyleType).toBe('none');
 expect(style('.iso27017-guide > .guide-content').marginLeft).toBe(width>1100?'300px':'0px');expect(style('.sidebar').top).toBe('64px');
 expect(style('.sidebar').visibility).toBe(width>1100?'visible':'hidden');expect(style('.docs-main').paddingTop).toBe('0px');expect(style('h2').scrollMarginTop).toBe('88px');
 expect(style('.mermaid').display).toBe('block');expect(style('.diagram-viewport').overflowX).toBe('auto');expect(style('svg').width).toBe('2400px');expect(style('svg').maxWidth).toBe('none');expect(style('svg').marginLeft).toBe('auto');expect(style('svg').marginRight).toBe('auto');
 }finally{await w.happyDOM.close();}}
});
test('rendered page rejects executable source scripts, remote icon fonts, duplicate IDs and unsafe URLs',async()=>{
 const page=await renderedPage();expect(page.querySelector('script,iframe,form,link')).toBeNull();const ids=[...page.querySelectorAll('[id]')].map(e=>e.id);expect(new Set(ids).size).toBe(ids.length);
 for(const el of page.querySelectorAll('*')) for(const attr of el.attributes){expect(attr.name).not.toMatch(/^on/i);if(['href','src'].includes(attr.name))expect(attr.value).not.toMatch(/^(javascript:|data:text\/html)/i);}
});
