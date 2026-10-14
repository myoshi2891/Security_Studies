import { expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import postcss from 'postcss';
import { Window, type Element as HappyElement, type HTMLInputElement as HappyInput } from 'happy-dom';
import { renderedPage } from './fidelity-helpers';
const styles=['../../../../node_modules/tailwindcss/preflight.css','../../globals.css','../docs-layout.css','./hacking-kubernetes.css'].map(file=>readFileSync(new URL(file,import.meta.url),'utf8')).join('\n');
function luminance(color:string){
 const channels=color.startsWith('#')?color.slice(1).match(/../g)!.map(n=>parseInt(n,16)):color.match(/[\d.]+/g)!.slice(0,3).map(Number);
 const rgb=channels.map(n=>n/255).map(n=>n<=0.04045?n/12.92:((n+0.055)/1.055)**2.4);
 return rgb[0]*0.2126+rgb[1]*0.7152+rgb[2]*0.0722;
}
function contrast(a:string,b:string){const [x,y]=[luminance(a),luminance(b)].sort((a,b)=>b-a);return (x+0.05)/(y+0.05);}
async function withGuide(scheme:string,width:number,verify:(w:Window)=>void){
 const w=new Window({settings:{device:{prefersColorScheme:scheme}}});w.happyDOM.setWindowSize({width,height:900});
 try{
  w.document.head.innerHTML=`<style>${styles}</style>`;
  w.document.body.innerHTML=`<div class="docs-shell"><main class="docs-main"><article class="prose docs-article">${(await renderedPage()).querySelector('.kubernetes-guide')!.outerHTML}</article></main></div>`;
  verify(w);
 }finally{await w.happyDOM.close();}
}
function background(w:Window,element:HappyElement):string{
 for(let el:HappyElement|null=element;el;el=el.parentElement){const color=w.getComputedStyle(el).backgroundColor;if(color&&color!=='transparent'&&color!=='rgba(0, 0, 0, 0)')return color;}
 throw new Error('No opaque guide background');
}
// Resolve direct declarations before inherited ones. Happy DOM can incorrectly let a
// high-specificity ancestor color override a declaration on the actual blockquote.
const css=postcss.parse(styles);
// Memoize per element/property: ancestors are shared by hundreds of checked elements.
const resolvedCache=new WeakMap<HappyElement,Map<string,string>>();
function resolvedProperty(w:Window,element:HappyElement,property:string):string {
 const cached=resolvedCache.get(element)?.get(property);if(cached!==undefined)return cached;
 const value=resolveUncached(w,element,property);
 const entry=resolvedCache.get(element)??new Map<string,string>();entry.set(property,value);resolvedCache.set(element,entry);
 return value;
}
function resolveUncached(w:Window,element:HappyElement,property:string):string {
 for(let el:HappyElement|null=element;el;el=el.parentElement){
  if(el!==element)return resolvedProperty(w,el,property);
  const matches:{weight:number;value:string}[]=[];
  css.walkRules(rule=>{
   let parent=rule.parent;while(parent&&parent.type!=='root'){if(parent.type==='atrule'&&parent.name==='media'&&!w.matchMedia(parent.params).matches)return;parent=parent.parent;}
   for(const selector of rule.selector.split(',')){
    try{if(!el!.matches(selector.trim()))continue;}catch{continue;}
    const weight=(selector.match(/#[\w-]+/g)?.length??0)*10000+(selector.match(/\.[\w-]+|\[[^\]]+\]|:(?!:)[\w-]+/g)?.length??0)*100+(selector.match(/(?:^|[ >+~])(?:[a-z][\w-]*)/g)?.length??0);
    rule.walkDecls(property,d=>{matches.push({weight:weight+(d.important?1000000:0),value:d.value});});
   }
  });
  const winner=matches.sort((a,b)=>a.weight-b.weight).at(-1);
  if(!winner||['inherit','unset'].includes(winner.value))continue;
  return winner.value.replace(/var\((--[\w-]+)\)/g,(_m,name:string)=>resolvedProperty(w,el!,name));
 }
 throw new Error(`Unresolved ${property}`);
}
const foreground=(w:Window,element:HappyElement)=>resolvedProperty(w,element,'color');
test('all real supplement and warning paragraphs have at least 7:1 contrast in light and dark app themes at desktop and phone widths',async()=>{
 for(const scheme of ['light','dark'])for(const width of [1440,375])await withGuide(scheme,width,w=>{
  const paragraphs=w.document.querySelectorAll('.kubernetes-guide .bq p');expect(paragraphs.length).toBeGreaterThan(20);
  for(const paragraph of paragraphs){const ratio=contrast(foreground(w,paragraph),background(w,paragraph));expect(ratio,`${scheme}/${width} ${paragraph.closest('section')?.id}: ${paragraph.textContent?.slice(0,60)} (${foreground(w,paragraph)})`).toBeGreaterThanOrEqual(7);}
 });
});
test('supporting labels, citations, source badges, inline code and checked checklist text meet 4.5:1 contrast',async()=>{
 for(const scheme of ['light','dark'])await withGuide(scheme,900,w=>{
  const input=w.document.querySelector<HappyInput>('.check-card input')!;input.checked=true;
  const elements=w.document.querySelectorAll('.meta dt,.brand-sub,.check-how,.check-how .lbl,.check-item,.cite,.chip,.ref-title,.ref-badge,.footer,.bq,.bq strong,.bq code');expect(elements.length).toBeGreaterThan(200);
  for(const el of elements){const color=foreground(w,el);expect(contrast(color,background(w,el)),`${scheme} ${el.className||el.tagName}: ${color}`).toBeGreaterThanOrEqual(4.5);}
 });
});
test('supplement and caution typography retains source normal text without the global italic blockquote rule',async()=>{
 await withGuide('light',375,w=>{for(const quote of w.document.querySelectorAll('.bq'))expect(w.getComputedStyle(quote).fontStyle).toBe('normal');});
});
