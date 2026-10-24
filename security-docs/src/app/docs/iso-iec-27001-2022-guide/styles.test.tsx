import {expect,test} from 'bun:test';
import {Window} from 'happy-dom';
import {readFileSync} from 'node:fs';
import postcss from 'postcss';
import {sourceTest,sourceCss,sourceDocument,renderedPage,scope} from './fidelity-helpers';
const guideCss=()=>readFileSync(new URL('./iso27001-guide.css',import.meta.url),'utf8');
const sharedCss=()=>['../../globals.css','../docs-layout.css'].map(f=>readFileSync(new URL(f,import.meta.url),'utf8')).join('\n');
function comparable(css:string,width:number){
 const tree=postcss.parse(css);tree.walkAtRules('import',r=>{r.remove();});
 tree.walkRules(r=>{r.selector=r.selector.replace(/:hover\b/g,'.fidelity-hover');});
 tree.walkDecls(d=>{
  if(d.prop==='list-style'&&['none','disc','decimal'].includes(d.value))d.cloneAfter({prop:'list-style-type'});
  if(d.prop==='background'&&/^(?:#|var\(|rgba?\(|transparent|white|black)/.test(d.value))d.cloneAfter({prop:'background-color'});
 });
 // Happy DOM does not resolve clamp(); both documents use the same viewport arithmetic.
 return tree.toString().replace(/clamp\(\s*([\d.]+)(rem|px)\s*,\s*([\d.]+)vw\s*,\s*([\d.]+)(rem|px)\s*\)/g,(_,lo,lu,mid,hi,hu)=>Math.min(Number(hi)*(hu==='rem'?16:1),Math.max(Number(lo)*(lu==='rem'?16:1),Number(mid)*width/100))+'px');
}
function norm(value:string,prop:string){return prop==='font-weight'?({normal:'400',bold:'700'}[value]??value):prop==='letter-spacing'&&(!value||value==='normal')?'0px':!value&&prop==='background-color'?'transparent':!value&&/^(margin|padding|border)/.test(prop)?'0px':value.replace(/(-?[\d.]+)rem/g,(_,n)=>Number(n)*16+'px').replace(/["']/g,'');}
async function compareCascade(width:number,theme:string,hover=false){
 const actual=new Window({settings:{device:{prefersColorScheme:theme}}}),original=new Window({settings:{device:{prefersColorScheme:theme}}});
 try{
  for(const w of [actual,original]){w.happyDOM.setWindowSize({width,height:900});expect(w.matchMedia('(prefers-color-scheme: dark)').matches).toBe(theme==='dark');}
  original.document.head.innerHTML='<style>h1,h2,h3,h4{font-weight:bold;letter-spacing:0px}'+comparable(sourceCss.toString(),width)+'</style>';
  original.document.body.innerHTML=sourceDocument.body.innerHTML;
  actual.document.head.innerHTML='<style>ul,ol{list-style:none;margin:0;padding:0}'+comparable(sharedCss()+'\n'+guideCss(),width)+'</style>';
  actual.document.body.innerHTML='<main class="docs-main"><article class="prose docs-article">'+(await renderedPage()).body.innerHTML+'</article></main>';
  if(hover)for(const w of [actual,original])for(const row of w.document.querySelectorAll('tr'))row.classList.add('fidelity-hover');
  const selectors=hover?['th,td']:['.hero h1,.h1-sub','.hero-lead,.hero-meta dt,.hero-meta dd','.chapter h2,.chapter h3,.chapter h4','.chapter p,.chapter ul,.chapter ol,.chapter li','th,td','.callout,.callout-body p','.chk,.chk-no,.chk-text,.chk-box','.src-card,.src-badge,.chip,.src-title,.src-url','.sidebar nav a,.nav-no,.nav-group-title,.brand-name,.brand-sub,.side-foot','.diagram figcaption','.footer'];
  const errors=new Set<string>();
  for(const selector of selectors){const a=[...actual.document.querySelectorAll('.iso27001-guide '+selector.split(',').join(', .iso27001-guide '))].filter(e=>!e.closest('.mmd')),o=[...original.document.querySelectorAll(selector)];expect(a.length,selector).toBe(o.length);
   for(let i=0;i<a.length;i++){const av=actual.getComputedStyle(a[i]),ov=original.getComputedStyle(o[i]);for(const p of ['font-family','font-size','font-weight','letter-spacing','line-height','color','background-color','margin-top','margin-bottom','padding-top','padding-left','padding-right','padding-bottom','border-top-width','border-bottom-width','list-style-type','counter-reset','counter-increment']){const act=norm(av.getPropertyValue(p),p),src=norm(ov.getPropertyValue(p),p);if(act!==src)errors.add(`${selector} ${p}: expected ${src}; received ${act}`);}}
  }expect([...errors]).toEqual([]);
 }finally{await actual.happyDOM.close();await original.happyDOM.close();}
}
for(const width of [375,768,1024,1025,1440])for(const theme of ['light','dark'])sourceTest(`all original text, 845 cells, lists, numbered checks, citations and metadata retain their styles at ${width}px in ${theme}`,()=>compareCascade(width,theme),30000);
for(const width of [375,1440])for(const theme of ['light','dark'])sourceTest(`hover cannot replace any of the 845 cell surfaces or ink at ${width}px in ${theme}`,()=>compareCascade(width,theme,true),30000);

function markerContract(css:string){const tree=postcss.parse(css);const props=(s:string)=>{const values:Record<string,string>={};tree.walkRules(scope+' '+s,r=>{r.walkDecls(d=>{values[d.prop]=d.value;});});return values;};return {dot:props('.chapter ul > li::before'),ordered:props('.chapter ol'),item:props('.chapter ol > li'),number:props('.chapter ol > li::before')};}
test('custom round dots and circled list numbers keep exact source declarations without archive originals',()=>{
 const result=markerContract(guideCss());expect(result.dot).toEqual({content:"''",position:'absolute',left:'0.2em',top:'0.8em',width:'7px',height:'7px','border-radius':'50%',background:'var(--accent)'});expect(result.ordered['counter-reset']).toBe('ol');expect(result.item['counter-increment']).toBe('ol');expect(result.item['padding-left']).toBe('2.5em');expect(result.number).toEqual({content:'counter(ol)',position:'absolute',left:'0',top:'0.15em',display:'grid','place-items':'center',width:'1.7em',height:'1.7em','border-radius':'50%',background:'var(--accent-bg)',border:'1px solid var(--accent)',color:'var(--accent)','font-family':'var(--font-mono)','font-weight':'500'});
 const tree=postcss.parse(guideCss());tree.walkRules(r=>{if(r.selector===scope+' .chapter ul > li::before'||r.selector===scope+' .chapter ol > li::before')r.remove();});const mutated=markerContract(tree.toString());expect(mutated.dot).not.toEqual(result.dot);expect(mutated.number).not.toEqual(result.number);
});
test('shared reset preserves 300px layout, hidden mobile drawer, check states and intrinsic SVG scrolling at five widths',async()=>{
 for(const width of [375,768,1024,1025,1440]){
  const w=new Window();w.happyDOM.setWindowSize({width,height:900});try{
   w.document.head.innerHTML='<style>'+sharedCss()+'\n'+guideCss()+'</style>';w.document.body.innerHTML='<main class="docs-main"><article class="prose docs-article"><div class="iso27001-guide"><aside class="sidebar"></aside><div class="main"><section class="chapter"><h2>章</h2><ol><li>番号</li></ol><ul><li>点</li></ul><label class="chk"><input type="checkbox"><span class="chk-box"></span><span class="chk-no">1</span><span class="chk-text">確認</span></label><figure class="diagram"><div class="mmd"><div class="diagram-viewport"><svg style="width:2400px"></svg></div></div></figure></section></div></div></article></main>';
   const s=(q:string)=>w.getComputedStyle(w.document.querySelector(q)!);expect(s('.main').marginLeft).toBe(width>1024?'300px':'0px');expect(s('.sidebar').top).toBe('64px');expect(s('.sidebar').visibility).toBe(width>1024?'visible':'hidden');expect(s('h2').scrollMarginTop).toBe('88px');expect(s('ol').counterReset).toBe('ol');expect(s('ol li').counterIncrement).toBe('ol');expect(s('.mmd').display).toBe('block');expect(s('.diagram-viewport').overflowX).toBe('auto');expect(s('svg').width).toBe('2400px');expect(s('svg').maxWidth).toBe('none');expect(s('svg').marginLeft).toBe('auto');expect(s('svg').marginRight).toBe('auto');
   const box=w.document.querySelector('input')!;box.checked=true;expect(s('.chk').backgroundColor).toBe('#0f2f2c');expect(s('.chk-text').textDecoration).toBe('line-through');expect(s('.chk-text').color).toBe('#93a1bd');expect(s('.chk-box').backgroundColor).toBe('#5fd3b4');
  }finally{await w.happyDOM.close();}
 }
});
test('all guide CSS stays scoped and preserves reduced motion and table hover isolation',()=>{const tree=postcss.parse(guideCss());tree.walkRules(r=>{if(r.selector.includes(':is('))return;for(const s of r.selector.split(','))expect(s.trim().startsWith(scope)||s.includes(':has(.iso27001-guide)')).toBe(true);});expect(guideCss()).toContain('prefers-reduced-motion');expect(guideCss()).toContain(scope+' tr:hover td');});
