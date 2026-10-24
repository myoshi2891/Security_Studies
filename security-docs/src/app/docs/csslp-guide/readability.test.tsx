import {expect,test} from 'bun:test';
import {readFileSync} from 'node:fs';
import {Window} from 'happy-dom';
import postcss from 'postcss';
import {renderedPage} from './fidelity-helpers';
const css=()=>['../../globals.css','../docs-layout.css','./csslp-guide.css'].map(f=>readFileSync(new URL(f,import.meta.url),'utf8')).join('\n');
for(const width of [375,1440])for(const theme of ['light','dark'])test(`hover preserves every source cell surface and foreground across 97 tables at ${width}px in ${theme}`,async()=>{
 const w=new Window({width,height:900,settings:{device:{prefersColorScheme:theme}}});
 try{const tree=postcss.parse(css());tree.walkAtRules('import',r=>{r.remove();});tree.walkRules(r=>{r.selector=r.selector.replaceAll(':hover','.fidelity-hover');});w.document.head.innerHTML='<style>'+tree.toString()+'</style>';w.document.body.innerHTML='<main class="docs-main"><article class="prose docs-article">'+(await renderedPage()).body.innerHTML+'</article></main>';
 expect(w.document.querySelectorAll('.csslp-guide table')).toHaveLength(97);const cells=[...w.document.querySelectorAll('.csslp-guide th,.csslp-guide td')];expect(cells).toHaveLength(1566);
 const values=()=>cells.map(e=>{const s=w.getComputedStyle(e);return [s.color,s.backgroundColor];});const before=values();for(const row of w.document.querySelectorAll('.csslp-guide tr'))row.classList.add('fidelity-hover');const after=values();const differences=new Set(after.map((value,i)=>JSON.stringify(value)===JSON.stringify(before[i])?'':`${JSON.stringify(before[i])} -> ${JSON.stringify(value)}`).filter(Boolean));expect([...differences]).toEqual([]);
 }finally{await w.happyDOM.close();}
},30000);
