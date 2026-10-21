import {expect,test} from 'bun:test';
import {readFileSync} from 'node:fs';
import {Window} from 'happy-dom';
import postcss from 'postcss';
import {declarations,scope,sourceCss,renderedPage,sourceDocument, sourceTest } from './fidelity-helpers';
const pageCss=()=>readFileSync(new URL('./applied-cryptography-guide.css',import.meta.url),'utf8');
const css=()=>['../../../../node_modules/tailwindcss/preflight.css','../../globals.css','../docs-layout.css'].map(f=>readFileSync(new URL(f,import.meta.url),'utf8')).join('\n')+'\n'+pageCss();
sourceTest('round bullet pseudo-elements and circled step counters retain every declaration',()=>{
 const actual=postcss.parse(pageCss());
 for(const selector of ['ul.bullets li::before','ol.steps','ol.steps li','ol.steps li::before']) {
  expect(declarations(actual,`${scope} ${selector}`)).toEqual(declarations(sourceCss,selector));
  expect(declarations(sourceCss,selector).length).toBeGreaterThan(0);
 }
 const keywords: string[]=[];actual.walkRules(r=>{if(r.selector.split(',').map(s=>s.trim()).includes(`${scope} .hljs-keyword`)) r.walkDecls(d=>{keywords.push(`${d.prop}:${d.value}`);});});
 expect(keywords).toContain('color:#c678dd');
});
test('native list spacing, counter resets and table backgrounds survive shared CSS at all widths and themes',async()=>{
 const page=await renderedPage();
 for(const width of [375,900,1440]) for(const theme of ['','dark']){
  const w=new Window();w.happyDOM.setWindowSize({width,height:900});
  try{
   w.document.documentElement.className=theme;w.document.head.innerHTML=`<style>${css()}</style>`;
   w.document.body.innerHTML=`<div class="docs-shell"><main class="docs-main"><article class="prose docs-article">${page.body.innerHTML}</article></main></div>`;
   const style=(selector:string)=>w.getComputedStyle(w.document.querySelector(selector)!);
   expect(style('.applied-guide').width).toBe('100%');
   expect(style('.applied-guide .main').marginLeft).toBe(width>1024?'300px':'0px');
   expect(style('.applied-guide .sidebar').top).toBe('64px');
   expect(style('.applied-guide .sidebar').visibility).toBe(width>1024?'visible':'hidden');
   expect(style('.applied-guide ul.bullets li').paddingLeft).toBe('24px');
   expect(style('.applied-guide ol.steps li').paddingLeft).toBe('62px');
   expect(style('.applied-guide ol.steps').counterReset).toBe('step');
   expect(style('.applied-guide ol.steps li').counterIncrement).toBe('step');
   for(const cell of w.document.querySelectorAll('.applied-guide td')){
    expect(w.getComputedStyle(cell).backgroundColor).not.toBe('rgb(255, 255, 255)');
   }
   for(const table of w.document.querySelectorAll('.applied-guide table')){
    expect(w.getComputedStyle(table).marginTop).toBe('0px');expect(w.getComputedStyle(table).marginBottom).toBe('0px');
   }
   expect(style('.applied-guide .brand').boxShadow).toBe('none');
  }finally{await w.happyDOM.close();}
 }
});
test('narrow and oversized diagrams preserve intrinsic width and reachable left edge at every viewport',async()=>{
 for(const width of [375,900,1440])for(const size of [180,2400]){
  const w=new Window();w.happyDOM.setWindowSize({width,height:900});
  try{w.document.head.innerHTML=`<style>${css()}</style>`;w.document.body.innerHTML=`<div class="applied-guide"><div class="diagram"><div class="diagram-viewport"><svg style="width:${size}px"></svg></div></div></div>`;
   const svg=w.document.querySelector('svg')!;const style=w.getComputedStyle(svg);expect(style.width).toBe(`${size}px`);expect(style.maxWidth).toBe('none');expect(style.marginLeft).toBe('auto');expect(style.marginRight).toBe('auto');
   expect(w.getComputedStyle(w.document.querySelector('.diagram')!).display).toBe('block');
   expect(w.getComputedStyle(w.document.querySelector('.diagram-viewport')!).overflowX).toBe('auto');
  }finally{await w.happyDOM.close();}
 }
});
sourceTest('the comparison detects deleted text, list markers, a table cell and code corruption',async()=>{
 const {canonical}=await import('./fidelity-helpers');const page=await renderedPage();
 for(const selector of ['#sec-1 ol.steps li','#sec-4 td','#sec-4 pre code','#sec-16 .ref']){
  const source=sourceDocument.querySelector(selector)!;const actual=page.querySelector(selector)!.cloneNode(true) as Element;actual.textContent='欠落';expect(canonical(actual)).not.toEqual(canonical(source));
 }
 const broken=postcss.parse(pageCss());broken.walkRules(`${scope} ul.bullets li::before`,r=>{r.remove();});
 expect(declarations(broken,`${scope} ul.bullets li::before`)).not.toEqual(declarations(sourceCss,'ul.bullets li::before'));
});
