import {expect,test} from 'bun:test';
import {Window} from 'happy-dom';
import {readFileSync} from 'node:fs';
import postcss from 'postcss';
import {sourceTest,sourceCss,sourceDocument,renderedPage,scope} from './fidelity-helpers';
const normalized=(value:string,prop:string)=>!value&&prop==='background-color'?'transparent':!value&&/^(margin|padding|border)/.test(prop)?'0px':value;
const css=()=>['../../globals.css','../docs-layout.css','./zero-trust-guide.css'].map(f=>readFileSync(new URL(f,import.meta.url),'utf8')).join('\n');
for(const width of [375,1024,1440])for(const theme of ['light','dark'])sourceTest(`source typography, badges and all 1344 table cells survive the shared cascade at ${width}px in ${theme}`,async()=>{
 const original=new Window(),actual=new Window();for(const w of [original,actual]){w.happyDOM.setWindowSize({width,height:900});w.document.documentElement.className=theme;}
 try{
 original.document.head.innerHTML='<style>'+sourceCss.toString()+'</style>';original.document.body.innerHTML=sourceDocument.body.innerHTML;
 actual.document.head.innerHTML='<style>'+css()+'</style>';actual.document.body.innerHTML='<main class="docs-main"><article class="prose docs-article">'+(await renderedPage()).body.innerHTML+'</article></main>';
 const selectors=['h1,h2,h3','.step-no,.chap-no','.src,.src-no,.rel','th,td','pre,pre code','section p,section ul,section ol,section li','details,details summary'];
 const properties=['font-size','font-weight','line-height','color','background-color','margin-top','margin-bottom','padding-top','padding-right','padding-bottom','padding-left','border-top-width','border-bottom-width'];
 for(const selector of selectors){const a=[...actual.document.querySelectorAll(selector)].filter(el=>!el.closest('.mermaid'));const o=[...original.document.querySelectorAll(selector)];expect(a.length,selector).toBe(o.length);
 for(let i=0;i<o.length;i++){const as=actual.getComputedStyle(a[i]),os=original.getComputedStyle(o[i]);for(const prop of properties)expect(normalized(as.getPropertyValue(prop),prop),`${selector}[${i}] ${prop}`).toBe(normalized(os.getPropertyValue(prop),prop));}}
 }finally{await original.happyDOM.close();await actual.happyDOM.close();}
});
test('native bullets and numbers, grouped TOC, closed drawer and intrinsic diagram widths survive at five widths',async()=>{
 for(const width of [375,768,1024,1025,1440]){const w=new Window();w.happyDOM.setWindowSize({width,height:900});try{
 w.document.head.innerHTML='<style>'+css()+'</style>';w.document.body.innerHTML='<main class="docs-main"><article class="prose docs-article"><div class="zero-trust-guide"><aside class="sidebar"><nav><ul><li>目次</li></ul></nav></aside><div class="backdrop"></div><div class="guide-content"><section><h2>題</h2><ul><li>点</li></ul><ol><li>番号</li></ol><figure class="diagram"><div class="mermaid-target"><div class="diagram-viewport"><svg style="width:2400px"></svg></div></div></figure></section></div></div></article></main>';
 const style=(s:string)=>w.getComputedStyle(w.document.querySelector(s)!);
 expect(style('section ul').listStyleType).toBe('disc');expect(style('ol').listStyleType).toBe('decimal');expect(style('ol').paddingLeft).toBe('25.6px');expect(style('.sidebar ul').listStyleType).toBe('none');
 expect(style('.guide-content').marginLeft).toBe(width>1024?'300px':'0px');expect(style('.sidebar').top).toBe('64px');expect(style('.sidebar').visibility).toBe(width>1024?'visible':'hidden');expect(style('.backdrop').display).toBe('none');expect(style('h2').scrollMarginTop).toBe('88px');
 expect(style('.mermaid-target').display).toBe('block');expect(style('.diagram-viewport').overflowX).toBe('auto');expect(style('svg').width).toBe('2400px');expect(style('svg').maxWidth).toBe('none');expect(style('svg').marginLeft).toBe('auto');expect(style('svg').marginRight).toBe('auto');
 }finally{await w.happyDOM.close();}}
});
test('all guide styles are scoped to this route and viewport scrolling respects reduced motion',()=>{
 const tree=postcss.parse(readFileSync(new URL('./zero-trust-guide.css',import.meta.url),'utf8'));
 tree.walkRules(r=>{for(const sel of r.selector.split(','))if(!r.selector.includes(':where(')&&!r.selector.includes(':is('))expect(sel.trim().startsWith(scope)||sel.includes(':has(.zero-trust-guide)')).toBe(true);});
 expect(tree.toString()).toContain('@media (prefers-reduced-motion:reduce)');
});
