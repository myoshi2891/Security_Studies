import {expect,test} from 'bun:test';
import {readFileSync} from 'node:fs';
import {Window} from 'happy-dom';
import {renderedPage,sourceTest,sourceHtml,sourceDocument} from './fidelity-helpers';
for(const theme of ['light','dark'])test(`every table cell preserves source borders and paper background during hover in ${theme}`,async()=>{
 const w=new Window({settings:{device:{prefersColorScheme:theme}}});try{
 const css=['../../globals.css','../docs-layout.css','./cyberops-associate-guide.css'].map(f=>readFileSync(new URL(f,import.meta.url),'utf8')).join('\n').replaceAll(':hover','[data-hover]');
 w.document.head.innerHTML='<style>'+css+'</style>';w.document.body.innerHTML='<article class="prose">'+(await renderedPage()).body.innerHTML+'</article>';
 const cells=[...w.document.querySelectorAll('td')];expect(cells.length).toBeGreaterThan(2200);
 for(const row of w.document.querySelectorAll('tr'))row.setAttribute('data-hover','');
 for(const cell of cells){const style=w.getComputedStyle(cell);const row=cell.parentElement!;const even=Array.from(row.parentElement!.children).indexOf(row)%2===1;expect(style.borderBottomWidth).toBe('0px');expect(style.backgroundColor).toBe(even?'#FAFBFD':'transparent');expect(style.color).toBe('#161B26');}
 }finally{await w.happyDOM.close();}
},30000);
sourceTest('Mermaid configuration retains every original theme and layout option',async()=>{const {diagramConfig}=await import(new URL('./MermaidFigure.tsx',import.meta.url).href);const engine={config:{} as Record<string,unknown>,initialize(c:Record<string,unknown>){this.config=c;}};const start=sourceHtml.indexOf('  window.mermaid.initialize('),end=sourceHtml.indexOf('\n  });',start)+6;Function('window',`var fonts='"Hiragino Kaku Gothic ProN","Hiragino Sans","Noto Sans JP","Yu Gothic",Meiryo,system-ui,sans-serif';${sourceHtml.slice(start,end)}`)({mermaid:engine});delete engine.config.startOnLoad;delete engine.config.securityLevel;expect(diagramConfig).toEqual(engine.config);});
sourceTest('all diagram labels and local semantic icons match the original',async()=>{const page=await renderedPage();expect([...page.querySelectorAll('.diagram')].map(e=>e.getAttribute('aria-label'))).toEqual([...sourceDocument.querySelectorAll('.diagram')].map(e=>e.getAttribute('aria-label')));for(const icon of page.querySelectorAll('i.ti')){if(icon.className.split(' ').some(c=>c.startsWith('ti-')))expect(icon.querySelector('svg'),icon.className).not.toBeNull();}});
