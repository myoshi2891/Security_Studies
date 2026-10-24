import {expect,test} from 'bun:test';
import {Window} from 'happy-dom';
import {readFileSync} from 'node:fs';
import postcss from 'postcss';
import {sourceTest,sourceCss,sourceDocument,renderedPage,scope} from './fidelity-helpers';
const css=()=>['../../globals.css','../docs-layout.css','./csslp-guide.css'].map(f=>readFileSync(new URL(f,import.meta.url),'utf8')).join('\n');
const norm=(v:string,p:string)=>p==='font-weight'?({normal:'400',bold:'700'}[v]??v):p==='letter-spacing'&&(!v||v==='normal')?'0px':!v&&p==='background-color'?'transparent':!v&&/^(margin|padding|border)/.test(p)?'0px':v.replace(/(-?[\d.]+)rem/g,(_,n)=>Number(n)*16+'px').replace(/["']/g,'').replace(/Source Serif 4 Variable,\s*/,'');
// Happy DOM does not resolve CSS clamp(); resolve the same source expression on both sides.
const resolveClamps=(css:string,width:number)=>css.replace(/clamp\(\s*([\d.]+)(rem|px)\s*,\s*([\d.]+)vw\s*,\s*([\d.]+)(rem|px)\s*\)/g,(_,lo,lu,mid,hi,hu)=>Math.min(Number(hi)*(hu==='rem'?16:1),Math.max(Number(lo)*(lu==='rem'?16:1),Number(mid)*width/100))+'px');
const sourceStyle=()=>{const tree=sourceCss.clone();tree.walkDecls('list-style',d=>{if(['none','disc','decimal'].includes(d.value))d.cloneAfter({prop:'list-style-type'});});return tree.toString();};
export async function compareCascade(width:number,theme:string,selectors:string[]){
 const actual=new Window({settings:{device:{prefersColorScheme:theme}}}),original=new Window({settings:{device:{prefersColorScheme:theme}}});
 try{for(const w of [actual,original]){w.happyDOM.setWindowSize({width,height:900});w.document.documentElement.className=theme;expect(w.matchMedia('(prefers-color-scheme: dark)').matches).toBe(theme==='dark');}
 original.document.head.innerHTML='<style>h1,h2,h3,h4{font-weight:bold;letter-spacing:0px}ul{list-style-type:disc}ol{list-style-type:decimal}'+resolveClamps(sourceStyle(),width)+'</style>';original.document.body.innerHTML=sourceDocument.body.innerHTML;
 actual.document.head.innerHTML='<style>'+resolveClamps(css(),width)+'</style>';actual.document.body.innerHTML='<main class="docs-main"><article class="prose docs-article">'+(await renderedPage()).body.innerHTML+'</article></main>';
 const errors=new Set<string>();
 for(const selector of selectors){const a=[...actual.document.querySelectorAll(selector)].filter(e=>!e.closest('.mermaid')),o=[...original.document.querySelectorAll(selector.replaceAll('.guide-content','main'))];expect(a.length,selector).toBe(o.length);
 for(let i=0;i<a.length;i++){const as=actual.getComputedStyle(a[i]),os=original.getComputedStyle(o[i]);for(const p of ['font-family','font-size','font-weight','letter-spacing','line-height','color','background-color','margin-top','margin-bottom','padding-top','padding-left','padding-right','padding-bottom','border-top-width','border-bottom-width','list-style-type']){const av=norm(as.getPropertyValue(p),p),ov=norm(os.getPropertyValue(p),p);if(av!==ov)errors.add(`${selector} ${p} expected ${ov} received ${av}`);}}}
 expect([...errors]).toEqual([]);
 }finally{await actual.happyDOM.close();await original.happyDOM.close();}
}

for(const width of [375,768,1024,1025,1440])for(const theme of ['light','dark'])sourceTest(`all source typography, 1566 cells, lists, code, callouts and references at ${width}px in ${theme}`,()=>compareCascade(width,theme,['h1,h2,h3,h4','th,td','.section p,.section ul,.section li','.callout,.lb','.ref,.ref .n,.ref .u a','code,pre','details,summary','.hero,.hero p','.brand,.brand b,.brand span','.sidebar nav a']),30000);
test('bullets and numbers survive Tailwind reset, nav stays marker free and oversized figures stay reachable',async()=>{
 for(const width of [375,768,1024,1025,1440]){const w=new Window();w.happyDOM.setWindowSize({width,height:900});try{w.document.head.innerHTML='<style>ul,ol{list-style:none}'+css()+'</style>';w.document.body.innerHTML='<main class="docs-main"><article class="prose docs-article"><div class="csslp-guide"><aside class="sidebar"><ul><li>目次</li></ul></aside><div class="main guide-content"><section class="section"><ul class="bullets"><li>点</li></ul><ol><li>番号</li></ol><div class="mmd"><div class="diagram-viewport"><svg style="width:2400px"></svg></div></div></section></div></div></article></main>';
 const style=(s:string)=>w.getComputedStyle(w.document.querySelector(s)!);
 expect(style('.bullets').listStyleType).toBe('disc');expect(style('ol').listStyleType).toBe('decimal');expect(style('.sidebar ul').listStyleType).toBe('none');expect(style('.main').marginLeft).toBe(width>1024?'288px':'0px');expect(style('.sidebar').top).toBe('64px');expect(style('.sidebar').visibility).toBe(width>1024?'visible':'hidden');expect(style('.mmd').display).toBe('block');expect(style('.mmd').justifyContent).toBe('normal');expect(style('.diagram-viewport').overflowX).toBe('auto');expect(style('svg').width).toBe('2400px');expect(style('svg').maxWidth).toBe('none');expect(style('svg').marginLeft).toBe('auto');expect(style('svg').marginRight).toBe('auto');
 }finally{await w.happyDOM.close();}}
});
test('CSS remains scoped and restores gold markers, print and reduced motion',()=>{const tree=postcss.parse(readFileSync(new URL('./csslp-guide.css',import.meta.url),'utf8'));tree.walkRules(r=>{if(r.selector.includes(':is('))return;for(const s of r.selector.split(','))expect(s.trim().startsWith(scope)||s.includes(':has(.csslp-guide)')).toBe(true);});expect(tree.toString()).toContain('prefers-reduced-motion');expect(tree.toString()).toContain('@media print');const markers:string[]=[];tree.walkRules(scope+' li::marker',r=>{r.walkDecls(d=>{markers.push(d.prop+':'+d.value);});});expect(markers).toContain('color:var(--gold)');});
