import {expect,test} from 'bun:test';
import {Window} from 'happy-dom';
import {readFileSync} from 'node:fs';
import postcss from 'postcss';
import {renderedPage,sourceDocument,sourceCss,scope,declarations,canonical} from './fidelity-helpers';
const css=()=>['../../../../node_modules/tailwindcss/preflight.css','../../globals.css','../docs-layout.css','./threat-modeling-guide.css'].map(f=>readFileSync(new URL(f,import.meta.url),'utf8')).join('\n').replace(/letter-spacing:\s*normal/g,'letter-spacing:0px');
const properties=['fontSize','fontWeight','fontFamily','lineHeight','letterSpacing','marginTop','marginBottom','paddingTop','paddingRight','paddingBottom','paddingLeft','borderBottomWidth','color','backgroundColor'] as const;
async function compareSource(width:number,scheme:'light'|'dark',selectors:string[]){
 const a=new Window({settings:{device:{prefersColorScheme:scheme}}}),b=new Window();
 // Happy DOM sometimes returns inherited rem units instead of resolved px; both roots use 16px.
 const norm=(v:string)=>['','normal','none','0','0px'].includes(v)?'default':v==='transparent'?'rgba(0, 0, 0, 0)':/^-?[\d.]+rem$/.test(v)?`${parseFloat(v)*16}px`:v;
 try{for(const w of [a,b])w.happyDOM.setWindowSize({width,height:900});
  a.document.head.innerHTML=`<style>${css()}</style>`;a.document.body.innerHTML=`<div class="docs-shell"><main class="docs-main"><article class="prose docs-article">${(await renderedPage()).body.innerHTML}</article></main></div>`;
  b.document.head.innerHTML=`<style>html{font-size:16px}${sourceCss}</style>`;b.document.body.innerHTML=sourceDocument.body.innerHTML;
  for(const selector of selectors){
   const actual=[...a.document.querySelectorAll('.threat-guide '+selector)].filter(el=>!el.closest('.mermaid'));
   const original=[...b.document.querySelectorAll(selector)].filter(el=>!el.closest('.mermaid'));
   expect(actual.length,selector).toBe(original.length);
   actual.forEach((el,i)=>{const x=a.getComputedStyle(el),y=b.getComputedStyle(original[i]);for(const key of properties)expect(norm(x[key]),`${width}/${scheme}/${selector}/${i}/${key}`).toBe(norm(y[key]));});
  }
 }finally{await a.happyDOM.close();await b.happyDOM.close();}
}
test('every heading paragraph and nested list item retains source typography and spacing at phone and desktop widths',async()=>{
 for(const width of [375,900,1440])await compareSource(width,'light',['h1','h2','h3','h4','p','.main ul>li','.main ol>li']);
});
test('all 839 header and body cells preserve source backgrounds padding borders and font weights in both app schemes',async()=>{
 for(const scheme of ['light','dark'] as const)await compareSource(900,scheme,['table','th','td']);
});
test('code cards inline code brand and figure captions retain original styles',async()=>{
 await compareSource(1440,'light',['pre','pre code','td code','p code','.brand','figcaption']);
});
test('all bullet and numbered marker declarations, nested spacing and checkbox keyboard styles survive exactly',()=>{
 const actual=postcss.parse(readFileSync(new URL('./threat-modeling-guide.css',import.meta.url),'utf8'));
 for(const selector of ['ul>li::before','ol','ol>li','ol>li::before','li>ul,li>ol','.ck-num','.check-item input:checked + .box','.check-item input:checked + .box i','.check-item input:focus-visible + .box','.check-item:has(input:checked) .ck-text','details.answer[open] .chev','details.answer[open] summary']){
  const scoped=selector.split(',').map(s=>`${scope} ${s.trim()}`).join(',');expect(declarations(sourceCss,selector).length,selector).toBeGreaterThan(0);expect(declarations(actual,scoped),selector).toEqual(declarations(sourceCss,selector));
 }
 const values:string[]=[];actual.walkRules(r=>{if(r.selector.split(',').map(s=>s.trim()).includes(`${scope} .hljs-keyword`))r.walkDecls(d=>{values.push(`${d.prop}:${d.value}`);});});expect(values).toContain('color:#c678dd');
});
test('phone tablet and desktop respect header clearance, reachable diagrams and the original layout margins',async()=>{
 for(const width of [375,900,1440]){
  const w=new Window();w.happyDOM.setWindowSize({width,height:900});
  try{w.document.head.innerHTML=`<style>${css()}</style>`;w.document.body.innerHTML=`<article class="prose"><div class="threat-guide"><aside class="sidebar"></aside><div class="layout"><section><h3>見出し</h3><figure class="diagram"><div class="mermaid"><div class="diagram-viewport"><svg style="width:2400px"></svg></div></div></figure></section></div></div></article>`;
   const s=(q:string)=>w.getComputedStyle(w.document.querySelector(q)!);expect(s('.layout').marginLeft).toBe(width>1024?'300px':'0px');expect(s('.sidebar').top).toBe('64px');expect(s('.sidebar').visibility).toBe(width>1024?'visible':'hidden');expect(s('h3').scrollMarginTop).toBe('88px');
   expect(s('.mermaid').display).toBe('block');expect(s('.mermaid').overflowX).toBe('auto');expect(s('svg').width).toBe('2400px');expect(s('svg').maxWidth).toBe('none');expect(s('svg').marginLeft).toBe('auto');expect(s('svg').marginRight).toBe('auto');
  }finally{await w.happyDOM.close();}
 }
});
test('hover styling does not introduce white table cells in either app scheme',async()=>{
 for(const scheme of ['light','dark'] as const){const w=new Window({settings:{device:{prefersColorScheme:scheme}}});
  try{w.document.head.innerHTML=`<style>${css().replaceAll(':hover','.test-hover')}</style>`;w.document.body.innerHTML=`<article class="prose">${(await renderedPage()).body.innerHTML}</article>`;
   for(const tr of w.document.querySelectorAll('.threat-guide tr'))tr.classList.add('test-hover');
   for(const td of w.document.querySelectorAll('.threat-guide td'))expect(['transparent','rgba(0, 0, 0, 0)']).toContain(w.getComputedStyle(td).backgroundColor);
  }finally{await w.happyDOM.close();}
 }
});
test('comparisons detect missing text cells emphasis commands, round dots and list counters',async()=>{
 const page=await renderedPage();
 for(const selector of ['#ch6 ol>li','#ch5 td','#ch10 pre code','#ch18 .ref-card','#ch2 strong']){
  const el=page.querySelector(selector)!;const original=sourceDocument.querySelector(selector)!;expect(canonical(el)).toEqual(canonical(original));const broken=el.cloneNode(true) as Element;broken.textContent='欠落';expect(canonical(broken)).not.toEqual(canonical(original));
 }
 const actual=postcss.parse(readFileSync(new URL('./threat-modeling-guide.css',import.meta.url),'utf8'));
 for(const selector of ['ul>li::before','ol>li::before']){const broken=actual.clone();broken.walkRules(`${scope} ${selector}`,r=>{r.remove();});expect(declarations(broken,`${scope} ${selector}`)).not.toEqual(declarations(sourceCss,selector));}
});
