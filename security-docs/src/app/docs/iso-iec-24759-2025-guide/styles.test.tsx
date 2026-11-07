import {expect,test} from 'bun:test';
import {Window} from 'happy-dom';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import postcss from 'postcss';
import {sourceTest,sourceCss,sourceDocument,renderedPage,scope} from './fidelity-helpers';
const guideCss=()=>readFileSync(new URL('./guide.css',import.meta.url),'utf8');
const sharedCss=()=>['../../globals.css','../docs-layout.css'].map(f=>readFileSync(new URL(f,import.meta.url),'utf8')).join('\n');
function comparable(css:string,width:number){
 const resolved=css.replace(/clamp\(\s*([\d.]+)(rem|px)\s*,\s*([\d.]+)vw\s*,\s*([\d.]+)(rem|px)\s*\)/g,(_,lo,lu,mid,hi,hu)=>Math.min(Number(hi)*(hu==='rem'?16:1),Math.max(Number(lo)*(lu==='rem'?16:1),Number(mid)*width/100))+'px');
 const tree=postcss.parse(resolved);
 // Happy DOM resolves em spacing while visiting earlier matching font rules. Expand
 // relative spacing using each source rule's final explicit font size on both sides.
 tree.walkRules(rule=>{const font=rule.nodes.find(d=>d.type==='decl'&&d.prop==='font-size') as postcss.Declaration|undefined;const match=font?.value.match(/^([\d.]+)(rem|px)$/);const pixels=match?Number(match[1])*(match[2]==='rem'?16:1):16;rule.walkDecls(d=>{if(/^(margin|padding|gap|min-width|width|height|top|left)/.test(d.prop))d.value=d.value.replace(/(-?[\d.]+)em/g,(_,n)=>Number(n)*pixels+'px');});});
 tree.walkAtRules('import',r=>{r.remove();});
 tree.walkRules(r=>{r.selector=r.selector.replace(/:hover\b/g,'.fidelity-hover');});
 tree.walkDecls(d=>{
  if(d.prop==='list-style'&&['none','disc','decimal'].includes(d.value))d.cloneAfter({prop:'list-style-type'});
  if(d.prop==='background'&&/^(?:#|var\(|rgba?\(|transparent|white|black)/.test(d.value))d.cloneAfter({prop:'background-color'});
 });
 // Happy DOM does not resolve clamp(); both documents use the same viewport arithmetic.
 return tree.toString().replace(/clamp\(\s*([\d.]+)(rem|px)\s*,\s*([\d.]+)vw\s*,\s*([\d.]+)(rem|px)\s*\)/g,(_,lo,lu,mid,hi,hu)=>Math.min(Number(hi)*(hu==='rem'?16:1),Math.max(Number(lo)*(lu==='rem'?16:1),Number(mid)*width/100))+'px');
}
function norm(value:string,prop:string){return prop==='box-shadow'&&!value?'none':prop==='font-weight'?({normal:'400',bold:'700'}[value]??value):prop==='letter-spacing'&&(!value||value==='normal')?'0px':!value&&prop==='background-color'?'transparent':!value&&/^(margin|padding|border)/.test(prop)?'0px':value.replace(/(-?[\d.]+)rem/g,(_,n)=>Number(n)*16+'px').replace(/["']/g,'');}
async function compareCascade(width:number,theme:string,hover=false){
 const actual=new Window({settings:{device:{prefersColorScheme:theme}}}),original=new Window({settings:{device:{prefersColorScheme:theme}}});
 try{
  for(const w of [actual,original]){w.happyDOM.setWindowSize({width,height:900});expect(w.matchMedia('(prefers-color-scheme: dark)').matches).toBe(theme==='dark');}
  // 原本は実行時に atom-one-dark.css と hljs クラスを読み込むため、比較元にも同じ条件を与える
  original.document.head.innerHTML='<style>h1,h2,h3,h4{font-weight:bold;letter-spacing:0px}pre{font-family:monospace}'+comparable(readFileSync(createRequire(import.meta.url).resolve('highlight.js/styles/atom-one-dark.css'),'utf8')+sourceCss.toString(),width)+'</style>';
  original.document.body.innerHTML=sourceDocument.body.innerHTML;
  for(const code of original.document.querySelectorAll('pre code'))code.classList.add('hljs');
  actual.document.head.innerHTML='<style>ul,ol{list-style:none;margin:0;padding:0}'+comparable(sharedCss()+'\n'+guideCss(),width)+'</style>';
  actual.document.body.innerHTML='<main class="docs-main"><article class="prose docs-article">'+(await renderedPage()).body.innerHTML+'</article></main>';
  if(hover)for(const w of [actual,original])for(const row of w.document.querySelectorAll('tr'))row.classList.add('fidelity-hover');
  const selectors=hover?['th,td']:['.hero,.brand','.hero h1','.lead,.meta dt,.meta dd','section h2,section h3','section p,section ul,section ol,section li','th,td','.callout,.callout-body p','.ref-card,.ref-num,.ref-tag,.ref-title,.ref-url','.sidebar nav a,.nav-num,.brand-title,.brand-sub','.footer','pre,pre code'];
  const errors=new Set<string>();
  for(const selector of selectors){const a=[...actual.document.querySelectorAll('.iso24759-guide '+selector.split(',').join(', .iso24759-guide '))].filter(e=>!e.closest('.mmd')),o=[...original.document.querySelectorAll(selector)];expect(a.length,selector).toBe(o.length);
   for(let i=0;i<a.length;i++){const av=actual.getComputedStyle(a[i]),ov=original.getComputedStyle(o[i]);for(const p of ['font-family','font-size','font-weight','letter-spacing','line-height','color','background-color','margin-top','margin-bottom','padding-top','padding-left','padding-right','padding-bottom','border-top-width','border-bottom-width','list-style-type','counter-reset','counter-increment','box-shadow','display','position']){const act=norm(av.getPropertyValue(p),p),src=norm(ov.getPropertyValue(p),p);if(act!==src)errors.add(`${selector} ${p}: expected ${src}; received ${act}`);}}
  }expect([...errors]).toEqual([]);
 }finally{await actual.happyDOM.close();await original.happyDOM.close();}
}
for(const width of [375,768,1024,1025,1440])for(const theme of ['light','dark'])sourceTest(`all original text, 407 cells, lists, numbered checks, citations and metadata retain their styles at ${width}px in ${theme}`,()=>compareCascade(width,theme),30000);
for(const width of [375,1440])for(const theme of ['light','dark'])sourceTest(`hover cannot replace any of the 407 cell surfaces or ink at ${width}px in ${theme}`,()=>compareCascade(width,theme,true),30000);


test('round dots and circled decimal numbers retain source geometry and CSS counters',()=>{
 const tree=postcss.parse(guideCss());const props=(s:string)=>{const out:Record<string,string>={};tree.walkRules(scope+' '+s,r=>r.walkDecls(d=>{out[d.prop]=d.value;}));return out;};
 expect(props('.guide-content ul > li::before')).toEqual({content:"''",position:'absolute',left:'0.35rem',top:'0.8em',width:'0.45rem',height:'0.45rem','border-radius':'50%',background:'var(--accent)'});
 expect(props('.guide-content ol')['counter-reset']).toBe('n');expect(props('.guide-content ol > li')['counter-increment']).toBe('n');
 expect(props('.guide-content ol > li::before')).toEqual({content:'counter(n)',position:'absolute',left:'0',top:'0.1rem',width:'1.8rem',height:'1.8rem','border-radius':'50%',background:'var(--color-background-info)',color:'var(--accent)',display:'flex','align-items':'center','justify-content':'center','font-family':'var(--font-mono)','line-height':'1'});
 expect(props('.sidebar nav li::before').content).toBe('none');
});
test('mobile drawer visibility, 320px layout, shell padding and SVG scrolling work at all five widths',async()=>{
 for(const width of [375,640,1024,1025,1440])for(const svgWidth of [120,2400]){
  const w=new Window();try{w.happyDOM.setWindowSize({width,height:900});w.document.head.innerHTML='<style>'+sharedCss()+guideCss()+'</style>';w.document.body.innerHTML='<main class="docs-main"><article class="prose"><div class="iso24759-guide"><aside class="sidebar"></aside><div class="main"><div class="diagram-body"><div class="diagram-viewport"><svg style="width:'+svgWidth+'px"></svg></div></div></div></div></article></main>';
  const style=(s:string)=>w.getComputedStyle(w.document.querySelector(s)!);
  expect(style('.docs-main').paddingLeft).toBe('0px');expect(style('.main').marginLeft).toBe(width>1024?'320px':'0px');expect(style('.sidebar').visibility).toBe(width>1024?'visible':'hidden');expect(style('.sidebar').top).toBe('64px');
  expect(style('.diagram-body').display).toBe('block');expect(style('.diagram-viewport').overflowX).toBe('auto');expect(style('svg').width).toBe(svgWidth+'px');expect(style('svg').maxWidth).toBe('none');expect(style('svg').marginLeft).toBe('auto');expect(style('svg').marginRight).toBe('auto');
  w.document.querySelector('.sidebar')!.classList.add('open');expect(style('.sidebar').visibility).toBe('visible');
  }finally{await w.happyDOM.close();}
 }
});

// Chrome UA uses monospace for pre; Tailwind's reset supplies a different stack.
test('code frame explicitly restores the original browser monospace font', () => {
 const css = postcss.parse(guideCss());
 const values: string[] = [];
 css.walkRules(scope + ' pre', rule => rule.walkDecls('font-family', d => { values.push(d.value); }));
 expect(values.at(-1)).toBe('monospace');
});
