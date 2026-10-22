import { expect } from 'bun:test';
import { readFileSync } from 'node:fs';
import { Window } from 'happy-dom';
import { sourceTest, sourceHtml, renderedPage } from './fidelity-helpers';
sourceTest('every heading, paragraph, list item, table cell, code and reference retains source styling across viewports and color schemes',async()=>{
 const css=['../../globals.css','../docs-layout.css','./iso18045-guide.css'].map(p=>readFileSync(new URL(p,import.meta.url),'utf8')).join('\n');
 const markup=(await renderedPage()).body.innerHTML;
 const normalized=(value:string,prop:string)=>{if(value==='transparent')return 'rgba(0, 0, 0, 0)';if(prop==='letter-spacing'&&value==='normal')return '0px';if(!value)return ({'letter-spacing':'0px','border-bottom-width':'0px','border-radius':'0px','padding-left':'0px','background-color':'rgba(0, 0, 0, 0)'} as Record<string,string>)[prop]??value;return value.replace(/^([0-9.]+)rem$/,(_,v)=>String(Number(v)*16)+'px');};
 for(const width of [375,1100,1440]) for(const scheme of ['light','dark'] as const){const before=new Window({settings:{device:{prefersColorScheme:scheme}}});const after=new Window({settings:{device:{prefersColorScheme:scheme}}});try{
 before.happyDOM.setWindowSize({width,height:900});after.happyDOM.setWindowSize({width,height:900});
 before.document.write(sourceHtml.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,''));after.document.head.innerHTML='<style>'+css+'</style>';after.document.body.innerHTML='<article class="prose">'+markup+'</article>';
 const selector='.brand,.brand small,dt,dd,h1,h2,h3,p,li,th,td,.ref-n,.ref-cat,.ref-desc,.tag';
 const original=[...before.document.querySelectorAll(selector)].filter(e=>!e.closest('.mermaid'));
 const migrated=[...after.document.querySelectorAll(selector)].filter(e=>!e.closest('.mermaid'));
 expect(migrated).toHaveLength(original.length);
 for(const [i,el] of original.entries()){const a=before.getComputedStyle(el),b=after.getComputedStyle(migrated[i]);for(const prop of ['font-family','font-size','font-weight','letter-spacing','color','line-height','border-bottom-width','border-radius','padding-left','background-color'])expect(normalized(b.getPropertyValue(prop),prop),`${width}/${scheme}/${el.tagName}.${el.className}/${i}/${prop}`).toBe(normalized(a.getPropertyValue(prop),prop));}
 }finally{await before.happyDOM.close();await after.happyDOM.close();}}
},30000);
