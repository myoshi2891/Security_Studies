import {expect,test} from 'bun:test';
import {readFileSync} from 'node:fs';
import {Window} from 'happy-dom';
import {renderedPage,sourceTest,sourceHtml,sourceDocument} from './fidelity-helpers';
// Bare Tailwind imports are compiled by Next.js; Happy DOM cannot resolve them.
// Remove only imports so the shared rules that expose this regression are actually evaluated.
const sharedCss=()=>['../../globals.css','../docs-layout.css'].map(f=>readFileSync(new URL(f,import.meta.url),'utf8')).join('\n').replace(/@import[^;]+;/g,'');
for(const width of [375,1440])for(const theme of ['light','dark'])test(`all 2706 cells retain source surfaces and text during hover at ${width}px in ${theme}`,async()=>{
 const w=new Window({width,height:1000,settings:{device:{prefersColorScheme:theme}}});try{
 const css=(sharedCss()+'\n'+readFileSync(new URL('./cyberops-associate-guide.css',import.meta.url),'utf8')).replaceAll(':hover','.fidelity-hover');
 w.document.head.innerHTML='<style>'+css+'</style>';w.document.body.innerHTML='<article class="prose">'+(await renderedPage()).body.innerHTML+'</article>';
 expect(w.document.querySelectorAll('.cyberops-associate-guide table')).toHaveLength(135);
 const cells=[...w.document.querySelectorAll('.cyberops-associate-guide th,.cyberops-associate-guide td')];expect(cells).toHaveLength(2706);
 const values=()=>cells.map(e=>{const s=w.getComputedStyle(e);return [s.color,s.backgroundColor||'transparent',s.borderBottomWidth];});
 const before=values();for(const row of w.document.querySelectorAll('tr'))row.classList.add('fidelity-hover');const after=values();
 const differences=after.flatMap((v,i)=>JSON.stringify(v)===JSON.stringify(before[i])?[]:[{cell:i,before:before[i],after:v}]);
 expect(differences.slice(0,5)).toEqual([]);
 }finally{await w.happyDOM.close();}
},30000);
test('the test harness loads the common hover palette in both OS themes',async()=>{for(const theme of ['light','dark']){const w=new Window({settings:{device:{prefersColorScheme:theme}}});try{w.document.head.innerHTML='<style>'+sharedCss().replaceAll(':hover','.fidelity-hover')+'</style>';w.document.body.innerHTML='<article class="prose"><table><tbody><tr class="fidelity-hover"><td>probe</td></tr></tbody></table></article>';expect(w.matchMedia('(prefers-color-scheme:dark)').matches).toBe(theme==='dark');expect(w.getComputedStyle(w.document.querySelector('td')!).backgroundColor).toBe(theme==='dark'?'#18181b':'#fafafa');}finally{await w.happyDOM.close();}}});
sourceTest('Mermaid configuration retains every original theme and layout option',async()=>{const {diagramConfig}=await import(new URL('./MermaidFigure.tsx',import.meta.url).href);const engine={config:{} as Record<string,unknown>,initialize(c:Record<string,unknown>){this.config=c;}};const start=sourceHtml.indexOf('  window.mermaid.initialize('),end=sourceHtml.indexOf('\n  });',start)+6;Function('window',`var fonts='"Hiragino Kaku Gothic ProN","Hiragino Sans","Noto Sans JP","Yu Gothic",Meiryo,system-ui,sans-serif';${sourceHtml.slice(start,end)}`)({mermaid:engine});delete engine.config.startOnLoad;delete engine.config.securityLevel;expect(diagramConfig).toEqual(engine.config);});
sourceTest('all diagram labels and local semantic icons match the original',async()=>{const page=await renderedPage();expect([...page.querySelectorAll('.diagram')].map(e=>e.getAttribute('aria-label'))).toEqual([...sourceDocument.querySelectorAll('.diagram')].map(e=>e.getAttribute('aria-label')));for(const icon of page.querySelectorAll('i.ti')){if(icon.className.split(' ').some(c=>c.startsWith('ti-')))expect(icon.querySelector('svg'),icon.className).not.toBeNull();}});
