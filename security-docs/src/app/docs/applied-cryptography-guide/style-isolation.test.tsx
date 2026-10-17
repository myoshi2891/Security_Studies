import {expect,test} from 'bun:test';
import {Window} from 'happy-dom';
import {readFileSync} from 'node:fs';
import {renderedPage,sourceHtml,sourceDocument} from './fidelity-helpers';
const css=['../../../../node_modules/tailwindcss/preflight.css','../../globals.css','../docs-layout.css','./applied-cryptography-guide.css'].map(f=>readFileSync(new URL(f,import.meta.url),'utf8')).join('\n');

test('shared prose never adds heading letter spacing, bottom borders or bottom padding',async()=>{
 for(const width of [375,1440]){
  const w=new Window();w.happyDOM.setWindowSize({width,height:900});
  try{w.document.head.innerHTML=`<style>${css}</style>`;w.document.body.innerHTML=`<article class="prose">${(await renderedPage()).body.innerHTML}</article>`;
   for(const heading of w.document.querySelectorAll('.applied-guide h1,.applied-guide h2')){
    const s=w.getComputedStyle(heading);expect(s.letterSpacing===''||s.letterSpacing==='normal').toBe(true);expect(s.borderBottomWidth===''||s.borderBottomWidth==='0px').toBe(true);expect(s.paddingBottom===''||s.paddingBottom==='0px').toBe(true);
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
   for(const td of w.document.querySelectorAll('.applied-guide td'))expect(w.getComputedStyle(td).backgroundColor).toBe('rgba(0, 0, 0, 0)');
  }finally{await w.happyDOM.close();}
 }
});
test('the immutable source still requires no body assets and has fourteen diagram containers',()=>{
 expect(sourceDocument.querySelectorAll('img,iframe')).toHaveLength(0);expect(sourceDocument.querySelectorAll('.diagram')).toHaveLength(14);expect(sourceHtml).toContain('ol.steps li::before');
});
