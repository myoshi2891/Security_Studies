import {expect,test} from 'bun:test';
import {readFileSync} from 'node:fs';
import {Window} from 'happy-dom';
import {renderedPage,sourceCss,sourceDocument, sourceTest } from './fidelity-helpers';
const styles=['../../../../node_modules/tailwindcss/preflight.css','../../globals.css','../docs-layout.css','./web-application-hackers-handbook.css'].map(file=>readFileSync(new URL(file,import.meta.url),'utf8')).join('\n');
async function compare(width:number,scheme:string,run:(actual:Window,original:Window)=>void){
 const actual=new Window({settings:{device:{prefersColorScheme:scheme}}}),original=new Window();
 try{for(const w of [actual,original])w.happyDOM.setWindowSize({width,height:900});
 // Happy DOM does not evaluate clamp(); substitute its value at this viewport in both CSS inputs.
 const clamp=(css:string)=>css.replace(/clamp\(28px,\s*3\.6vw,\s*40px\)/g,`${Math.min(40,Math.max(28,width*0.036))}px`).replace(/letter-spacing:\s*normal/g,'letter-spacing:0px').replace(/:hover\b/g,'[data-css-hover]');
 actual.document.head.innerHTML=`<style>${clamp(styles)}</style>`;actual.document.body.innerHTML=`<article class="prose docs-article">${(await renderedPage()).querySelector('.wahh-guide')!.outerHTML}</article>`;
 original.document.head.innerHTML=`<style>${clamp(sourceCss.toString())}</style>`;original.document.body.innerHTML=sourceDocument.body.innerHTML;
 run(actual,original);
 }finally{await actual.happyDOM.close();await original.happyDOM.close();}
}
sourceTest('all 127 headings retain source typography, spacing, borders and padding through shared CSS at phone and desktop widths',async()=>{
 for(const width of [1440,375])await compare(width,'light',(actual,original)=>{
 const headings=actual.document.querySelectorAll('.main h1,.main h2,.main h3,.main h4'),sources=original.document.querySelectorAll('main h1,main h2,main h3,main h4');expect(headings).toHaveLength(127);
 headings.forEach((el,i)=>{const a=actual.getComputedStyle(el),b=original.getComputedStyle(sources[i]);for(const key of ['fontSize','fontWeight','lineHeight','letterSpacing','marginTop','marginBottom','paddingBottom','borderBottomWidth','borderBottomStyle'] as const){
 const normalized=(value:string)=>['','normal','none','0','0px'].includes(value)?'default':value;
 if(key==='borderBottomStyle'&&normalized(a.borderBottomWidth)==='default'&&normalized(b.borderBottomWidth)==='default')continue;
 expect(normalized(a[key]),`${width}/${i}/${key}/${el.textContent}`).toBe(normalized(b[key]));
 }});
 });
});
sourceTest('all 53 tables retain source header/cell spacing, backgrounds and hover behavior in both app themes',async()=>{
 for(const scheme of ['light','dark'])await compare(900,scheme,(actual,original)=>{
 const tables=actual.document.querySelectorAll('.main table'),sources=original.document.querySelectorAll('main table');expect(tables).toHaveLength(53);
 tables.forEach((el,i)=>{expect(actual.getComputedStyle(el).marginTop).toBe('0px');expect(actual.getComputedStyle(el).marginBottom).toBe('0px');
 const cells=el.querySelectorAll('th,td'),refs=sources[i].querySelectorAll('th,td');expect(cells).toHaveLength(refs.length);
 cells.forEach((cell,j)=>{const a=actual.getComputedStyle(cell),b=original.getComputedStyle(refs[j]);for(const key of ['paddingTop','paddingRight','paddingBottom','paddingLeft','backgroundColor','borderTopWidth','borderBottomWidth','fontSize','fontWeight','verticalAlign'] as const)expect(a[key]||'0px',`${scheme}/${i}/${j}/${key}`).toBe(b[key]||'0px');});
 });
 });
});
sourceTest('the source brand remains free of landing-page shadow and letter spacing',async()=>{
 await compare(1440,'light',(actual,original)=>{for(const selector of ['.brand','.brand-mark']){const a=actual.getComputedStyle(actual.document.querySelector(selector)!),b=original.getComputedStyle(original.document.querySelector(selector)!);for(const key of ['boxShadow','letterSpacing','fontWeight'] as const)expect(['','normal','0px'].includes(a[key])?'none':a[key]).toBe(['','normal','0px'].includes(b[key])?'none':b[key]);}});
});
test('anchor offsets account for the fixed header once and retain original 24px gap',async()=>{
 const w=new Window();try{w.document.head.innerHTML=`<style>${styles}</style>`;w.document.body.innerHTML='<div class="wahh-guide"><section class="section" id="sec-0"><h3 id="h3-1">見出し</h3></section></div>';
 // Happy DOM retains this calc() expression instead of resolving rem to px.
 expect(['88px','calc(4rem + 24px)']).toContain(w.getComputedStyle(w.document.documentElement).scrollPaddingTop);for(const el of w.document.querySelectorAll('[id]'))expect(w.getComputedStyle(el).scrollMarginTop||'0px').toBe('0px');
 }finally{await w.happyDOM.close();}
});

sourceTest('all 892 body cells preserve original hover backgrounds in both themes',async()=>{
 for(const scheme of ['light','dark'])await compare(900,scheme,(actual,original)=>{
 for(const w of [actual,original])for(const tr of w.document.querySelectorAll('tbody tr'))tr.setAttribute('data-css-hover','');
 const cells=actual.document.querySelectorAll('.main td'),refs=original.document.querySelectorAll('main td');expect(cells).toHaveLength(892);
 cells.forEach((el,i)=>expect(actual.getComputedStyle(el).backgroundColor).toBe(original.getComputedStyle(refs[i]).backgroundColor));
 });
});
test('narrow and oversized SVGs keep intrinsic widths and block auto margins at phone and desktop widths',async()=>{
 for(const width of [375,1440]){const w=new Window();try{w.happyDOM.setWindowSize({width,height:900});w.document.head.innerHTML=`<style>${styles}</style>`;
 w.document.body.innerHTML=`<div class="wahh-guide"><div class="diagram"><div class="mermaid-target" style="width:${width-40}px"><div class="diagram-viewport" role="img" tabindex="0"><svg style="width:120px;height:auto" viewBox="0 0 120 80"></svg><svg style="width:2400px;height:auto" viewBox="0 0 2400 80"></svg></div></div></div></div>`;
 const scroll=w.document.querySelector('.mermaid-target')!;expect(w.getComputedStyle(scroll).display).toBe('block');expect(w.getComputedStyle(scroll).overflowX).toBe('auto');expect(scroll.querySelector('[role="img"]')!.getAttribute('tabindex')).toBe('0');
 const svgs=[...scroll.querySelectorAll('svg')];expect(svgs.map(svg=>w.getComputedStyle(svg).width)).toEqual(['120px','2400px']);for(const svg of svgs){const style=w.getComputedStyle(svg);expect(style.display).toBe('block');expect(style.marginLeft).toBe('auto');expect(style.marginRight).toBe('auto');expect(style.maxWidth).toBe('none');}
 }finally{await w.happyDOM.close();}}
});
sourceTest('all seven code blocks retain source backgrounds, spacing, borders and corner radii in both app themes',async()=>{
 for(const scheme of ['light','dark'])await compare(900,scheme,(actual,original)=>{
 const pres=actual.document.querySelectorAll('.main .codeblock pre'),refs=original.document.querySelectorAll('main .codeblock pre');expect(pres).toHaveLength(7);
 const normalize=(value:string)=>['','none','normal','0','0px'].includes(value)?'default':['transparent','rgba(0, 0, 0, 0)'].includes(value)?'transparent':value;
 pres.forEach((pre,i)=>{for(const [aEl,bEl] of [[pre,refs[i]],[pre.querySelector('code')!,refs[i].querySelector('code')!]]){const a=actual.getComputedStyle(aEl),b=original.getComputedStyle(bEl);for(const key of ['paddingTop','paddingRight','paddingBottom','paddingLeft','marginTop','marginBottom','borderTopWidth','borderBottomWidth','borderRadius','backgroundColor','fontSize','lineHeight','whiteSpace'] as const){
 const value=(s:typeof a)=>key==='backgroundColor'&&!s[key]?'transparent':normalize(s[key]);expect(value(a),`${scheme}/${i}/${aEl.tagName}/${key}`).toBe(value(b));
 }}});
 });
});
