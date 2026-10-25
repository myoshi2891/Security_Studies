import {expect,test} from 'bun:test';
import {readFileSync} from 'node:fs';
import {Window} from 'happy-dom';
import {renderedPage,sourceTest,sourceHtml,sourceDocument} from './fidelity-helpers';
// Bare Tailwind imports are compiled by Next.js; Happy DOM cannot resolve them.
// Remove only imports so the shared rules that expose this regression are actually evaluated.
const sharedCss=()=>['../../globals.css','../docs-layout.css'].map(f=>readFileSync(new URL(f,import.meta.url),'utf8')).join('\n').replace(/@import[^;]+;/g,'');
for(const width of [375,1440])for(const theme of ['light','dark'])test(`all 2051 cells retain source surfaces and text during hover at ${width}px in ${theme}`,async()=>{
 const w=new Window({width,height:1000,settings:{device:{prefersColorScheme:theme}}});try{
 const css=(sharedCss()+'\n'+readFileSync(new URL('./cyberops-professional-guide.css',import.meta.url),'utf8')).replaceAll(':hover','.fidelity-hover');
 w.document.head.innerHTML='<style>'+css+'</style>';w.document.body.innerHTML='<article class="prose">'+(await renderedPage()).body.innerHTML+'</article>';
 expect(w.document.querySelectorAll('.cyberops-professional-guide table')).toHaveLength(122);
 const cells=[...w.document.querySelectorAll('.cyberops-professional-guide th,.cyberops-professional-guide td')];expect(cells).toHaveLength(2051);
 const values=()=>cells.map(e=>{const s=w.getComputedStyle(e);return [s.color,s.backgroundColor||'transparent',s.borderBottomWidth];});
 const before=values();for(const row of w.document.querySelectorAll('tr'))row.classList.add('fidelity-hover');const after=values();
 const differences=after.flatMap((v,i)=>JSON.stringify(v)===JSON.stringify(before[i])?[]:[{cell:i,before:before[i],after:v}]);
 expect(differences.slice(0,5)).toEqual([]);
 }finally{await w.happyDOM.close();}
},30000);
test('the test harness loads the common hover palette in both OS themes',async()=>{for(const theme of ['light','dark']){const w=new Window({settings:{device:{prefersColorScheme:theme}}});try{w.document.head.innerHTML='<style>'+sharedCss().replaceAll(':hover','.fidelity-hover')+'</style>';w.document.body.innerHTML='<article class="prose"><table><tbody><tr class="fidelity-hover"><td>probe</td></tr></tbody></table></article>';expect(w.matchMedia('(prefers-color-scheme:dark)').matches).toBe(theme==='dark');expect(w.getComputedStyle(w.document.querySelector('td')!).backgroundColor).toBe(theme==='dark'?'#18181b':'#fafafa');}finally{await w.happyDOM.close();}}});
sourceTest('Mermaid settings retain the original theme and layout',async()=>{const {diagramConfig}=await import(new URL('./MermaidFigure.tsx',import.meta.url).href);const engine={config:{} as Record<string,unknown>,initialize(c:Record<string,unknown>){this.config=c;}};const theme=sourceHtml.slice(sourceHtml.indexOf('  var TV='),sourceHtml.indexOf('  function fix('));const call=sourceHtml.match(/    mermaid\.initialize\([\s\S]*?\);/)![0];Function('mermaid',theme+call)(engine);delete engine.config.startOnLoad;delete engine.config.securityLevel;expect(diagramConfig).toEqual(engine.config);});
sourceTest('all source diagram containers and local icons are retained',async()=>{const page=await renderedPage();expect([...page.querySelectorAll('.diagram[data-d]')].map(e=>e.getAttribute('data-d'))).toEqual([...sourceDocument.querySelectorAll('.diagram[data-d]')].map(e=>e.getAttribute('data-d')));for(const icon of page.querySelectorAll('i.ti'))expect(icon.querySelector('svg'),icon.className).not.toBeNull();});
