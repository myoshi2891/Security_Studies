import {expect,test} from 'bun:test';
import {readFileSync} from 'node:fs';
import {Window} from 'happy-dom';
import postcss from 'postcss';
import {renderedPage} from './fidelity-helpers';

const globalCss=readFileSync(new URL('../../globals.css',import.meta.url),'utf8');
const guideCss=readFileSync(new URL('./cc-guide.css',import.meta.url),'utf8');
/** Happy DOM does not implement pointer hover or expand background shorthands like Chrome.
 * Resolve winning code color:inherit via a custom property because Happy DOM otherwise drops it.
 * A class has exactly the same specificity as :hover; expand solid backgrounds on both sides.
 */
function testCss(css:string){const tree=postcss.parse(css);tree.walkAtRules('import',r=>{r.remove();});tree.walkRules(r=>{r.selector=r.selector.replace(/:hover\b/g,'.readability-hover');});tree.walkDecls('color',d=>{if(d.value==='inherit'&&d.parent?.type==='rule'&&/code(?:\:not\(pre code\))?$/.test(d.parent.selector))d.value='var(--readability-parent-ink)';});tree.walkDecls('background',d=>{if(/^(?:#|var\(|rgba?\(|transparent|white|black)/.test(d.value))d.cloneAfter({prop:'background-color'});});return tree.toString();}
function fixture(w:Window,css:string,body:string){w.document.head.innerHTML='<style>table{color:inherit}'+testCss(globalCss+'\n'+css)+'</style>';w.document.body.innerHTML='<main class="docs-main"><article class="prose docs-article">'+body+'</article></main>';for(const code of w.document.querySelectorAll('code'))code.style.setProperty('--readability-parent-ink',w.getComputedStyle(code.parentElement!).color);}
const background=(value:string)=>!value||value==='rgba(0, 0, 0, 0)'?'transparent':value;
function rgb(color:string){if(color.startsWith('#')){const h=color.slice(1);const hex=h.length===3?[...h].map(c=>c+c).join(''):h;return [0,2,4].map(i=>parseInt(hex.slice(i,i+2),16)/255);}return (color.match(/[\d.]+/g)??[]).slice(0,3).map(Number).map(v=>v/255);}
function luminance(color:string){const c=rgb(color).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return c[0]*.2126+c[1]*.7152+c[2]*.0722;}
function contrast(fg:string,bg:string){const a=luminance(fg),b=luminance(bg);return (Math.max(a,b)+.05)/(Math.min(a,b)+.05);}
for(const scheme of ['light','dark'])for(const width of [375,1440]){
 test(`all six inline tokens including [S番号], private IPs, CIDR and masking inherit readable text at ${width}px in ${scheme}`,async()=>{
  const w=new Window({width,height:900,settings:{device:{prefersColorScheme:scheme}}});try{fixture(w,guideCss,(await renderedPage()).body.innerHTML);expect(w.matchMedia('(prefers-color-scheme: dark)').matches).toBe(scheme==='dark');const codes=[...w.document.querySelectorAll('.cc-guide code')];expect(codes.map(c=>c.textContent)).toEqual(['[S番号]','10.0.0.0/8','172.16.0.0/12','192.168.0.0/16','/24','*']);
  for(const code of codes){const style=w.getComputedStyle(code);expect(style.color,code.textContent!).toBe(w.getComputedStyle(code.parentElement!).color);expect(contrast(style.color,style.backgroundColor),code.textContent!).toBeGreaterThanOrEqual(4.5);}
  }finally{await w.happyDOM.close();}
 },30000);
 test(`hovering every row in all 85 tables preserves each cell background and text at ${width}px in ${scheme}`,async()=>{
  const w=new Window({width,height:900,settings:{device:{prefersColorScheme:scheme}}});try{fixture(w,guideCss,(await renderedPage()).body.innerHTML);expect(w.document.querySelectorAll('table')).toHaveLength(85);const cells=[...w.document.querySelectorAll('th,td')];expect(cells).toHaveLength(1520);const values=()=>cells.map(c=>{const s=w.getComputedStyle(c);return [s.color,background(s.backgroundColor)];});const before=values();for(const row of w.document.querySelectorAll('tr'))row.classList.add('readability-hover');expect(values()).toEqual(before);
  }finally{await w.happyDOM.close();}
 },30000);
}
const related=[
 ['bulletproof-tls-pki-guide','bulletproof-tls-guide.css','bulletproof-tls-guide'],
 ['iso-iec-15408-1-2026-guide','iso15408-guide.css','iso15408-guide'],
 ['iso-iec-27017-2026-guide','iso27017-guide.css','iso27017-guide'],
 ['mitre-atlas','mitre-atlas.css','atlas-guide'],
 ['secrets-and-lies-guide','secrets-lies-guide.css','secrets-lies-guide'],
 ['secure-by-design','secure-by-design.css','secure-by-design-guide'],
] as const;
for(const [folder,file,scope] of related)for(const scheme of ['light','dark'])test(`${folder}: shared prose hover cannot overwrite source odd/even table surfaces in ${scheme}`,async()=>{
 const css=readFileSync(new URL(`../${folder}/${file}`,import.meta.url),'utf8');const w=new Window({settings:{device:{prefersColorScheme:scheme}}});try{fixture(w,css,`<div class="${scope}"><div class="main guide-content"><section class="section"><div class="table-wrap"><table><tbody><tr><td>odd</td></tr><tr><td>even</td></tr></tbody></table></div></section></div></div>`);const cells=[...w.document.querySelectorAll('td')];const values=()=>cells.map(c=>{const s=w.getComputedStyle(c);return [s.color,background(s.backgroundColor)];});const before=values();for(const row of w.document.querySelectorAll('tr'))row.classList.add('readability-hover');expect(values()).toEqual(before);
 }finally{await w.happyDOM.close();}
});

for(const scheme of ['light','dark'])test(`Applied Cryptography inline [S1] keeps its source foreground and transparent background in ${scheme}`,async()=>{
 const {renderedPage:renderApplied}=await import('../applied-cryptography-guide/fidelity-helpers');
 const css=readFileSync(new URL('../applied-cryptography-guide/applied-cryptography-guide.css',import.meta.url),'utf8');const w=new Window({settings:{device:{prefersColorScheme:scheme}}});try{fixture(w,css,(await renderApplied()).body.innerHTML);const codes=[...w.document.querySelectorAll('code')].filter(e=>e.textContent==='[S1]'&&!e.closest('pre'));expect(codes.map(e=>e.textContent)).toEqual(['[S1]']);for(const code of codes){const style=w.getComputedStyle(code);expect(style.color).toBe(w.getComputedStyle(code.parentElement!).color);expect(['','transparent','rgba(0, 0, 0, 0)']).toContain(style.backgroundColor);}
 const controlCss=postcss.parse(css);controlCss.walkRules(r=>{if(r.selector==='.applied-guide.applied-guide code'&&r.nodes.some(d=>d.type==='decl'&&d.prop==='color'&&d.value==='inherit'))r.remove();});const control=new Window({settings:{device:{prefersColorScheme:scheme}}});try{fixture(control,controlCss.toString(),(await renderApplied()).body.innerHTML);const rest=(win:Window)=>[...win.document.querySelectorAll('code')].filter(e=>e.textContent!=='[S1]').map(e=>{const s=win.getComputedStyle(e);return [e.textContent,s.color,background(s.backgroundColor)];});expect(rest(w).length).toBeGreaterThan(0);expect(rest(w)).toEqual(rest(control));}finally{await control.happyDOM.close();}
 }finally{await w.happyDOM.close();}
},30000);

test('regression harness detects both original dark-mode bugs when the guide isolation rules are removed',async()=>{
 const tree=postcss.parse(guideCss);tree.walkRules(r=>{if(r.selector==='.cc-guide.cc-guide tr:hover td'||r.selector==='.cc-guide.cc-guide code'&&r.nodes.some(d=>d.type==='decl'&&d.prop==='color'&&d.value==='inherit'))r.remove();});
 const w=new Window({settings:{device:{prefersColorScheme:'dark'}}});try{fixture(w,tree.toString(),(await renderedPage()).body.innerHTML);const code=w.document.querySelector('.cc-guide code')!,style=w.getComputedStyle(code);expect(style.color).not.toBe(w.getComputedStyle(code.parentElement!).color);expect(contrast(style.color,style.backgroundColor)).toBeLessThan(4.5);const td=code.closest('td')!,before=background(w.getComputedStyle(td).backgroundColor);td.closest('tr')!.classList.add('readability-hover');expect(background(w.getComputedStyle(td).backgroundColor)).not.toBe(before);
 }finally{await w.happyDOM.close();}
},30000);
