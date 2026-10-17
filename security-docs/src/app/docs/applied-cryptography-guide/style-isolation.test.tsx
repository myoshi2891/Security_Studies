import {expect,test} from 'bun:test';
import {Window} from 'happy-dom';
import {readFileSync} from 'node:fs';
import {renderedPage,sourceHtml,sourceDocument} from './fidelity-helpers';
const css=['../../../../node_modules/tailwindcss/preflight.css','../../globals.css','../docs-layout.css','./applied-cryptography-guide.css'].map(f=>readFileSync(new URL(f,import.meta.url),'utf8')).join('\n').replace(/letter-spacing:\s*normal/g,'letter-spacing:0px');

test('shared prose never adds heading letter spacing, bottom borders or bottom padding',async()=>{
 for(const width of [375,1440]){
  const w=new Window();w.happyDOM.setWindowSize({width,height:900});
  try{w.document.head.innerHTML=`<style>${css}</style>`;w.document.body.innerHTML=`<article class="prose">${(await renderedPage()).body.innerHTML}</article>`;
   for(const heading of w.document.querySelectorAll('.applied-guide h1,.applied-guide h2')){
    const s=w.getComputedStyle(heading);expect(s.letterSpacing===''||s.letterSpacing==='normal'||s.letterSpacing==='0px').toBe(true);expect(s.borderBottomWidth===''||s.borderBottomWidth==='0px').toBe(true);expect(s.paddingBottom===''||s.paddingBottom==='0px').toBe(true);
   }
  }finally{await w.happyDOM.close();}
 }
});
test('all source code cards keep square borderless inner pre blocks and original inline code backgrounds',async()=>{
 const w=new Window();
 try{w.document.head.innerHTML=`<style>${css}</style>`;w.document.body.innerHTML=`<article class="prose">${(await renderedPage()).body.innerHTML}</article>`;
  for(const pre of w.document.querySelectorAll('.applied-guide pre')){const s=w.getComputedStyle(pre);expect(s.borderTopWidth===''||s.borderTopWidth==='0px').toBe(true);expect(s.borderRadius===''||s.borderRadius==='0px').toBe(true);}
  for(const li of w.document.querySelectorAll('.applied-guide ul.bullets li')){const s=w.getComputedStyle(li);expect(s.marginTop===''||s.marginTop==='0px').toBe(true);expect(s.marginBottom===''||s.marginBottom==='0px').toBe(true);}
 }finally{await w.happyDOM.close();}
});
test('shared hover styling never turns original dark table cells white in either app theme',async()=>{
 for(const colorScheme of ['light','dark'] as const){
  const w=new Window({settings:{device:{prefersColorScheme:colorScheme}}});
  try{w.document.head.innerHTML=`<style>${css.replaceAll(':hover','.test-hover')}</style>`;w.document.body.innerHTML=`<article class="prose">${(await renderedPage()).body.innerHTML}</article>`;
   for(const tr of w.document.querySelectorAll('.applied-guide tr'))tr.classList.add('test-hover');
   for(const td of w.document.querySelectorAll('.applied-guide td'))expect(['transparent','rgba(0, 0, 0, 0)']).toContain(w.getComputedStyle(td).backgroundColor);
  }finally{await w.happyDOM.close();}
 }
});
test('the immutable source still requires no body assets and has fourteen diagram containers',()=>{
 expect(sourceDocument.querySelectorAll('img,iframe')).toHaveLength(0);expect(sourceDocument.querySelectorAll('.diagram')).toHaveLength(14);expect(sourceHtml).toContain('ol.steps li::before');
});

async function compareSource(width:number,scheme:'light'|'dark',selectors:string[],properties:(keyof CSSStyleDeclaration)[]){
 const original=new Window(),actual=new Window({settings:{device:{prefersColorScheme:scheme}}});
 const normalize=(value:unknown)=>['','normal','none','0','0px'].includes(String(value))?'default':value==='transparent'?'rgba(0, 0, 0, 0)':String(value);
 try{
  for(const w of [original,actual])w.happyDOM.setWindowSize({width,height:900});
  original.document.head.innerHTML=`<style>${sourceHtml.match(/<style>([\s\S]*?)<\/style>/)![1]}</style>`;original.document.body.innerHTML=sourceDocument.body.innerHTML;
  actual.document.head.innerHTML=`<style>${css}</style>`;actual.document.body.innerHTML=`<article class="prose">${(await renderedPage()).body.innerHTML}</article>`;
  for(const selector of selectors){
   const originals=[...original.document.querySelectorAll(selector)].filter(el=>!el.closest('.diagram'));
   const elements=[...actual.document.querySelectorAll('.applied-guide '+selector)].filter(el=>!el.closest('.diagram'));
   expect(elements.length,selector).toBe(originals.length);
   elements.forEach((el,i)=>{const a=actual.getComputedStyle(el),b=original.getComputedStyle(originals[i]);for(const property of properties)expect(normalize(a[property]),`${width}/${scheme}/${selector}/${i}/${String(property)}`).toBe(normalize(b[property]));});
  }
 }finally{await actual.happyDOM.close();await original.happyDOM.close();}
}
test('all original headings paragraphs and list items retain typography and spacing at phone and desktop widths',async()=>{
 for(const width of [375,1440])await compareSource(width,'light',['h1','h2','h3','p','ul.bullets li','ol.steps li'],['fontSize','fontWeight','fontFamily','lineHeight','letterSpacing','marginTop','marginBottom','paddingTop','paddingBottom','paddingLeft','borderBottomWidth','color']);
});
test('all 475 source table cells retain padding borders weight and backgrounds in both app color schemes',async()=>{
 for(const scheme of ['light','dark'] as const)await compareSource(900,scheme,['th','td'],['fontSize','fontWeight','paddingTop','paddingRight','paddingBottom','paddingLeft','borderBottomWidth','backgroundColor','color']);
});
test('source brand and code cards retain their inherited typography rather than landing and preflight fonts',async()=>{
 await compareSource(1440,'light',['.brand','pre','pre code'],['fontSize','fontWeight','fontFamily','lineHeight','color']);
});
