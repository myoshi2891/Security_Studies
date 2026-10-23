import {expect,test} from 'bun:test';
import {Window,type HTMLInputElement as HappyInput} from 'happy-dom';
import {readFileSync} from 'node:fs';
import postcss from 'postcss';
import {sourceTest,sourceCss,sourceDocument,renderedPage,scope} from './fidelity-helpers';
const normalized=(value:string,prop:string)=>!value&&prop==='background-color'?'transparent':!value&&/^(margin|padding|border)/.test(prop)?'0px':value.replace(/(-?[\d.]+)rem/g,(_,n)=>`${Number(n)*16}px`);
const css=()=>['../../globals.css','../docs-layout.css','./secrets-lies-guide.css'].map(f=>readFileSync(new URL(f,import.meta.url),'utf8')).join('\n');
for(const width of [375,1024,1440])for(const theme of ['light','dark'])sourceTest(`source typography, badges and all 627 table cells survive the shared cascade at ${width}px in ${theme}`,async()=>{
 const original=new Window(),actual=new Window();for(const w of [original,actual]){w.happyDOM.setWindowSize({width,height:900});w.document.documentElement.className=theme;}
 try{
 original.document.head.innerHTML='<style>'+sourceCss.toString()+'</style>';original.document.body.innerHTML=sourceDocument.body.innerHTML;
 actual.document.head.innerHTML='<style>'+css()+'</style>';actual.document.body.innerHTML='<main class="docs-main"><article class="prose docs-article">'+(await renderedPage()).body.innerHTML+'</article></main>';
 const selectors=['h1,h2,h3','.src-card,.src-badge,.cite','.callout,.callout-label,.callout-body p','th,td','code','section p,section ul,section ol,section li','.checklist label,.chk-box,.chk-num,.chk-txt'];
 const properties=['font-size','font-weight','line-height','color','background-color','margin-top','margin-bottom','padding-top','padding-right','padding-bottom','padding-left','border-top-width','border-bottom-width'];
 for(const selector of selectors){const a=[...actual.document.querySelectorAll(selector)].filter(el=>!el.closest('.mermaid'));const o=[...original.document.querySelectorAll(selector)];expect(a.length,selector).toBe(o.length);
 for(let i=0;i<o.length;i++){const as=actual.getComputedStyle(a[i]),os=original.getComputedStyle(o[i]);for(const prop of properties)expect(normalized(as.getPropertyValue(prop),prop),`${selector}[${i}] ${prop}`).toBe(normalized(os.getPropertyValue(prop),prop));}}
 }finally{await original.happyDOM.close();await actual.happyDOM.close();}
},30000);
test('native numbers, custom exercise counters, bullets and intrinsic diagrams survive at five widths',async()=>{
 for(const width of [375,768,1024,1025,1440]){const w=new Window();w.happyDOM.setWindowSize({width,height:900});try{
 w.document.head.innerHTML='<style>'+css()+'</style>';w.document.body.innerHTML='<main class="docs-main"><article class="prose docs-article"><div class="secrets-lies-guide"><aside class="sidebar"><nav><ul><li>目次</li></ul></nav></aside><div class="main"><section class="section"><h2>題</h2><ul><li>点</li></ul><ol class="ordinary"><li>番号</li></ol><h3 class="ex">演習</h3><ol class="exercise"><li>丸番号</li></ol><div class="diagram"><div class="mermaid-target"><div class="diagram-viewport"><svg style="width:2400px"></svg></div></div></div></section></div></div></article></main>';
 const style=(q:string)=>w.getComputedStyle(w.document.querySelector(q)!);expect(style('.ordinary').listStyleType).toBe('decimal');expect(style('.ordinary').paddingLeft).toBe('27.2px');expect(style('section ul').listStyleType).toBe('none');expect(style('.exercise').listStyleType).toBe('none');expect(style('.exercise').counterReset).toBe('ex');expect(style('.exercise li').counterIncrement).toBe('ex');
 expect(style('.main').marginLeft).toBe(width>1024?'296px':'0px');expect(style('.sidebar').top).toBe('64px');expect(style('.sidebar').visibility).toBe(width>1024?'visible':'hidden');expect(style('h2').scrollMarginTop).toBe('88px');expect(style('.mermaid-target').display).toBe('block');expect(style('.diagram-viewport').overflowX).toBe('auto');expect(style('svg').width).toBe('2400px');expect(style('svg').maxWidth).toBe('none');expect(style('svg').marginLeft).toBe('auto');expect(style('svg').marginRight).toBe('auto');
 }finally{await w.happyDOM.close();}}
});
test('checkbox selection preserves source success background, strike-through and counter while retaining keyboard focus styling',async()=>{
 const w=new Window();try{w.document.head.innerHTML='<style>'+css()+'</style>';w.document.body.innerHTML=(await renderedPage()).body.innerHTML;const input=w.document.querySelector<HappyInput>('.checklist input')!;input.checked=true;
 const style=(q:string)=>w.getComputedStyle(w.document.querySelector(q)!);expect(style('.checklist label').backgroundColor).toBe('#10301f');expect(style('.chk-txt').textDecoration).toBe('line-through');expect(style('.checklist').counterReset).toBe('chk');expect(style('.checklist li').counterIncrement).toBe('chk');
 }finally{await w.happyDOM.close();}
});
test('styles remain scoped and viewport anchor scrolling respects reduced motion',()=>{
 const tree=postcss.parse(readFileSync(new URL('./secrets-lies-guide.css',import.meta.url),'utf8'));tree.walkRules(r=>{if(r.selector.includes(':where(')||r.selector.includes(':is('))return;for(const s of r.selector.split(','))expect(s.trim().startsWith(scope)||s.includes(':has(.secrets-lies-guide)')).toBe(true);});expect(tree.toString()).toContain('@media (prefers-reduced-motion:reduce)');
});
