import {expect,test} from 'bun:test';
import {Window} from 'happy-dom';
import {readFileSync} from 'node:fs';
import postcss from 'postcss';
import {sourceTest,sourceCss,sourceDocument,renderedPage,scope} from './fidelity-helpers';
const css=()=>['../../globals.css','../docs-layout.css','./ccsp-guide.css'].map(f=>readFileSync(new URL(f,import.meta.url),'utf8')).join('\n');
const norm=(v:string,p:string)=>p==='font-weight'?({normal:'400',bold:'700'}[v]??v):p==='letter-spacing'&&(!v||v==='normal')?'0px':!v&&p==='background-color'?'transparent':!v&&/^(margin|padding|border)/.test(p)?'0px':v.replace(/(-?[\d.]+)rem/g,(_,n)=>Number(n)*16+'px').replace(/["']/g,'').replace(/Source Serif 4 Variable,\s*/,'');
const sourceStyle=()=>{const tree=sourceCss.clone();tree.walkDecls('list-style',d=>{if(['none','disc','decimal'].includes(d.value))d.cloneAfter({prop:'list-style-type'});});return tree.toString();};
export async function compareCascade(width:number,theme:string,selectors:string[]){
 const actual=new Window({settings:{device:{prefersColorScheme:theme}}}),original=new Window({settings:{device:{prefersColorScheme:theme}}});
 try{for(const w of [actual,original]){w.happyDOM.setWindowSize({width,height:900});w.document.documentElement.className=theme;expect(w.matchMedia('(prefers-color-scheme: dark)').matches).toBe(theme==='dark');}
 original.document.head.innerHTML='<style>h1,h2,h3,h4{font-weight:bold;letter-spacing:0px}ol{list-style-type:decimal}'+sourceStyle()+'</style>';original.document.body.innerHTML=sourceDocument.body.innerHTML;
 actual.document.head.innerHTML='<style>'+css()+'</style>';actual.document.body.innerHTML='<main class="docs-main"><article class="prose docs-article">'+(await renderedPage()).body.innerHTML+'</article></main>';
 const errors=new Set<string>();
 for(const selector of selectors){const a=[...actual.document.querySelectorAll(selector)].filter(e=>!e.closest('.mermaid')),o=[...original.document.querySelectorAll(selector.replaceAll('.guide-content','main'))];expect(a.length,selector).toBe(o.length);
 for(let i=0;i<a.length;i++){const as=actual.getComputedStyle(a[i]),os=original.getComputedStyle(o[i]);for(const p of ['font-family','font-size','font-weight','letter-spacing','line-height','color','background-color','margin-top','margin-bottom','padding-top','padding-left','padding-right','padding-bottom','border-top-width','border-bottom-width','list-style-type']){const av=norm(as.getPropertyValue(p),p),ov=norm(os.getPropertyValue(p),p);if(av!==ov)errors.add(`${selector} ${p} expected ${ov} received ${av}`);}}}
 expect([...errors]).toEqual([]);
 }finally{await actual.happyDOM.close();await original.happyDOM.close();}
}
for(const width of [375,1024,1440])for(const theme of ['light','dark'])sourceTest(`source hero, metadata, brand, TOC numbers and footer retain computed styles at ${width}px in ${theme}`,()=>compareCascade(width,theme,['.hero,.eyebrow','.hero h1,.hero h1 .nb','.meta dt,.meta dd','.brand,.brand-title,.brand-sub','.sidebar nav a,.nav-num','.footer,.footer p']),30000);
test('native numbers, custom round dots, checklist counters and wide SVG scrolling survive reset at five widths',async()=>{
 for(const width of [375,768,1024,1025,1440]){const w=new Window();w.happyDOM.setWindowSize({width,height:900});try{w.document.head.innerHTML='<style>ul,ol{list-style:none}'+css()+'</style>';w.document.body.innerHTML='<main class="docs-main"><article class="prose docs-article"><div class="ccsp-guide"><aside class="sidebar"><nav><ul><li>目次</li></ul></nav></aside><div class="guide-content"><header class="hero"><h1>題</h1></header><section class="section"><h2>節</h2><h3>小節</h3><h4>項目</h4><ul class="bullet"><li>丸点</li></ul><ol class="ordinary"><li>番号</li></ol><ul class="checklist"><li><label><input type="checkbox"><span class="box"></span><span class="num"></span><span class="txt">確認</span></label></li></ul><div class="mermaid"><div class="diagram-viewport"><svg style="width:2400px"></svg></div></div></section></div></div></article></main>';
 const s=(q:string)=>w.getComputedStyle(w.document.querySelector(q)!);
 expect(s('.ordinary').listStyleType).toBe('decimal');expect(s('.ordinary').paddingLeft).toBe('27.2px');expect(s('.bullet').listStyleType).toBe('none');expect(s('.bullet li').paddingLeft).toBe('24px');expect(s('.checklist').counterReset).toBe('chk');expect(s('.checklist li').counterIncrement).toBe('chk');
 expect(s('.guide-content').marginLeft).toBe(width>1024?'288px':'0px');expect(s('.sidebar').top).toBe('64px');expect(s('.sidebar').visibility).toBe(width>1024?'visible':'hidden');expect(s('h2').scrollMarginTop).toBe('88px');expect(s('.mermaid').display).toBe('block');expect(s('.mermaid').justifyContent).toBe('normal');expect(s('.diagram-viewport').overflowX).toBe('auto');expect(s('svg').maxWidth).toBe('none');expect(s('svg').width).toBe('2400px');expect(s('svg').marginLeft).toBe('auto');expect(s('svg').marginRight).toBe('auto');
 for(const q of ['h1','h2','h3','h4'])expect(s(q).fontFamily).toMatch(/^["']Source Serif 4 Variable["']/);
 const checkbox=w.document.querySelector('input')!;checkbox.checked=true;expect(s('.checklist label').backgroundColor).toBe('#eaf4ec');expect(s('.checklist .txt').textDecoration).toBe('line-through');expect(s('.checklist .box').backgroundColor).toBe('#1b6e6a');
 }finally{await w.happyDOM.close();}}
});
test('page rules stay scoped and retain reduced motion and print support',()=>{const tree=postcss.parse(readFileSync(new URL('./ccsp-guide.css',import.meta.url),'utf8'));tree.walkRules(r=>{if(r.selector.includes(':is('))return;for(const s of r.selector.split(','))expect(s.trim().startsWith(scope)||s.includes(':has(.ccsp-guide)')).toBe(true);});expect(tree.toString()).toContain('prefers-reduced-motion');expect(tree.toString()).toContain('@media print');});
