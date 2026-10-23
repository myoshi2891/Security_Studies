import {expect,test} from 'bun:test';
import {Window} from 'happy-dom';
import {readFileSync} from 'node:fs';
import postcss from 'postcss';
import {sourceTest,sourceCss,sourceDocument,renderedPage,scope} from './fidelity-helpers';
const css=()=>['../../globals.css','../docs-layout.css','./cc-guide.css'].map(f=>readFileSync(new URL(f,import.meta.url),'utf8')).join('\n');
// Happy DOM does not expand list-style shorthands; expand them before computing source styles.
const sourceStyle=()=>{const tree=sourceCss.clone();tree.walkDecls('list-style',d=>{if(['none','disc','decimal'].includes(d.value))d.cloneAfter({prop:'list-style-type'});});return tree.toString();};
const normalize=(s:string,p:string)=>p==='font-weight'?({normal:'400',bold:'700'}[s]??s):p==='letter-spacing'&&(!s||s==='normal')?'0px':!s&&p==='background-color'?'transparent':!s&&/^(margin|padding|border)/.test(p)?'0px':s.replace(/(-?[\d.]+)rem/g,(_,n)=>Number(n)*16+'px');
for(const width of [375,768,1024,1025,1440])for(const theme of ['light','dark'])sourceTest('full shared cascade retains original text, lists and all 1520 cells at '+width+'px in '+theme,async()=>{
 const a=new Window(),o=new Window();for(const w of [a,o]){w.happyDOM.setWindowSize({width,height:900});w.document.documentElement.className=theme;}
 try{o.document.head.innerHTML='<style>h1,h2,h3,h4{font-weight:bold;letter-spacing:0px}ul{list-style-type:disc}ol{list-style-type:decimal}'+sourceStyle()+'</style>';o.document.body.innerHTML=sourceDocument.body.innerHTML;
 a.document.head.innerHTML='<style>'+css()+'</style>';a.document.body.innerHTML='<main class="docs-main"><article class="prose docs-article">'+(await renderedPage()).body.innerHTML+'</article></main>';
 const mismatches=new Set<string>();
 for(const selector of ['h1,h2,h3,h4','.brand','.hero-meta,.hero-meta li','th,td','.guide-content p,.guide-content ul,.guide-content ol,.guide-content li','.callout,.callout-title','.src-card,.src-badge,.src-status','code','details,summary']){
 const srcSelector=selector.replaceAll('.guide-content','main');const actual=[...a.document.querySelectorAll(selector)].filter(e=>!e.closest('.mermaid'));const expected=[...o.document.querySelectorAll(srcSelector)];expect(actual.length,selector).toBe(expected.length);
 for(let i=0;i<actual.length;i++){const as=a.getComputedStyle(actual[i]),os=o.getComputedStyle(expected[i]);for(const p of ['font-size','font-weight','letter-spacing','line-height','color','background-color','margin-top','margin-bottom','padding-top','padding-left','padding-right','padding-bottom','border-top-width','border-bottom-width','list-style-type']){const av=normalize(as.getPropertyValue(p),p),ov=normalize(os.getPropertyValue(p),p);if(av!==ov)mismatches.add(selector+' '+p+' expected '+ov+' received '+av);}}
 }
 expect([...mismatches]).toEqual([]);
 }finally{await a.happyDOM.close();await o.happyDOM.close();}
},30000);
test('native bullet dots and decimal numbers survive Tailwind reset without adding hero or TOC markers',async()=>{
 for(const width of [375,768,1024,1025,1440]){const w=new Window();w.happyDOM.setWindowSize({width,height:900});try{w.document.head.innerHTML='<style>ol,ul,menu{list-style:none}'+css()+'</style>';w.document.body.innerHTML='<main class="docs-main"><article class="prose docs-article"><div class="cc-guide"><aside class="sidebar"><nav><ul><li>目次</li></ul></nav></aside><div class="guide-content"><ul class="hero-meta"><li>情報</li></ul><ul class="bullet"><li>点</li></ul><ol><li>番号</li></ol><div class="diagram mermaid-target"><div class="diagram-viewport"><svg style="width:2400px"></svg></div></div></div></div></article></main>';
 const s=(q:string)=>w.getComputedStyle(w.document.querySelector(q)!);expect(s('.bullet').listStyleType).toBe('disc');expect(s('ol').listStyleType).toBe('decimal');expect(s('.hero-meta').listStyleType).toBe('none');expect(s('nav ul').listStyleType).toBe('none');expect(s('ol').paddingLeft).toBe('24px');expect(s('.guide-content').marginLeft).toBe(width>1024?'288px':'0px');expect(s('.sidebar').top).toBe('64px');expect(s('.sidebar').visibility).toBe(width>1024?'visible':'hidden');expect(s('.diagram').display).toBe('block');expect(s('.diagram').justifyContent).toBe('normal');expect(s('.diagram-viewport').overflowX).toBe('auto');expect(s('svg').width).toBe('2400px');expect(s('svg').maxWidth).toBe('none');expect(s('svg').marginLeft).toBe('auto');expect(s('svg').marginRight).toBe('auto');
 }finally{await w.happyDOM.close();}}
});
test('all page rules are scoped and reduced motion is supported',()=>{const tree=postcss.parse(readFileSync(new URL('./cc-guide.css',import.meta.url),'utf8'));tree.walkRules(r=>{if(r.selector.includes(':is('))return;for(const s of r.selector.split(','))expect(s.trim().startsWith(scope)||s.includes(':has(.cc-guide)')).toBe(true);});expect(tree.toString()).toContain('prefers-reduced-motion');});

test('headings and brand use the installed serif family rather than an unloaded CDN family',async()=>{
 const w=new Window();try{w.document.head.innerHTML='<style>'+css()+'</style>';w.document.body.innerHTML=(await renderedPage()).body.innerHTML;
 for(const selector of ['h1','h2','h3','h4','.brand b'])expect(w.getComputedStyle(w.document.querySelector(selector)!).fontFamily,selector).toMatch(/^["']Source Serif 4 Variable["']/);
 const mdx=readFileSync(new URL('./page.mdx',import.meta.url),'utf8');expect(mdx).toContain("import '@fontsource-variable/source-serif-4'");
 }finally{await w.happyDOM.close();}
});
