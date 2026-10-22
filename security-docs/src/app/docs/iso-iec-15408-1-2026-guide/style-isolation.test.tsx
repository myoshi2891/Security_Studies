import { expect } from 'bun:test';
import { readFileSync } from 'node:fs';
import { Window } from 'happy-dom';
import { sourceTest, sourceHtml, renderedPage } from './fidelity-helpers';
sourceTest('computed source typography survives landing brand, prose headings and inline code rules',async()=>{
 const before=new Window();const after=new Window();
 try{
 before.document.write(sourceHtml.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,''));
 const css=['../../globals.css','../docs-layout.css','./iso15408-guide.css'].map(p=>readFileSync(new URL(p,import.meta.url),'utf8')).join('\n');
 after.document.head.innerHTML='<style>'+css+'</style>';after.document.body.innerHTML='<article class="prose">'+(await renderedPage()).body.innerHTML+'</article>';
 for(const selector of ['.brand','.brand-title','.brand-sub','h1','h2','h3','.section p','.section ul > li','.section ol > li','th','td','code','.ref-num']){
 const original=before.document.querySelector(selector);if(!original)continue;const migrated=after.document.querySelector(selector)!;
 const a=before.getComputedStyle(original),b=after.getComputedStyle(migrated);
 for(const prop of ['font-family','font-size','font-weight','letter-spacing','color','line-height','border-bottom-width','border-radius','padding-left','background-color'])expect(b.getPropertyValue(prop),selector+' '+prop).toBe(a.getPropertyValue(prop));
 }
 }finally{await before.happyDOM.close();await after.happyDOM.close();}
});
