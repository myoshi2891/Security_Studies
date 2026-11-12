'use client';
import {useEffect,useId,useRef,useState} from 'react';
import {diagramConfig} from './diagrams';
export type DiagramRenderer=(id:string,source:string)=>Promise<{svg:string}>;
let engine:Promise<typeof import('mermaid')['default']>|undefined;
export const renderDiagram:DiagramRenderer=async(id,source)=>{
 await document.fonts?.ready;
 engine??=import('mermaid').then(({default:m})=>{m.startOnLoad=false;return m;}).catch(error=>{engine=undefined;throw error;});
 return (await engine).render(id,`---\nconfig: ${JSON.stringify(diagramConfig)}\n---\n${source}`);
};
/** Keep natural diagram width so oversized drawings remain reachable from their left edge. */
export function sizeSvg(markup:string){
 const holder=document.createElement('div');holder.innerHTML=markup;
 const svg=holder.querySelector('svg');if(!svg)throw new Error('Mermaid returned no SVG');
 const box=(svg.getAttribute('viewBox')??'').trim().split(/[\s,]+/).map(Number);
 if(box.length===4&&box.every(Number.isFinite)){
  box[3]+=/sequenceDiagram|stateDiagram/.test(svg.getAttribute('aria-roledescription')??'')?110:15;
  svg.setAttribute('viewBox',box.join(' '));svg.style.width=`${box[2]}px`;
 }
 svg.removeAttribute('width');svg.removeAttribute('height');svg.style.maxWidth='none';svg.style.height='auto';svg.style.overflow='visible';
 return holder.innerHTML;
}
export function MermaidFigure({id,source,label,renderer=renderDiagram}:{id:string;source:string;label:string;renderer?:DiagramRenderer}){
 const unique=useId().replace(/[^a-z0-9_-]/gi,''),ref=useRef<HTMLDivElement>(null);
 const [near,setNear]=useState(false),[attempt,setAttempt]=useState(0);
 const [result,setResult]=useState<{source:string;svg?:string;failed?:boolean}>();
 useEffect(()=>{
  if(near)return;
  if(typeof IntersectionObserver==='undefined'){let active=true;queueMicrotask(()=>{if(active)setNear(true);});return()=>{active=false;};}
  const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){setNear(true);observer.disconnect();}},{rootMargin:'600px 0px'});
  if(ref.current)observer.observe(ref.current);return()=>observer.disconnect();
 },[near]);
 useEffect(()=>{if(!near)return;let active=true;
  renderer(`architecture-${id}-${unique}`,source).then(({svg})=>{const sized=sizeSvg(svg);if(active)setResult({source,svg:sized});}).catch(()=>{if(active)setResult({source,failed:true});});
  return()=>{active=false;};
 },[near,id,source,renderer,unique,attempt]);
 const current=result?.source===source?result:undefined;
 return <div ref={ref} className="mermaid-target" id={id} role="img" aria-label={label} data-definition={source}>
  {current?.svg?<div dangerouslySetInnerHTML={{__html:current.svg}}/>:current?.failed?<div><p className="mermaid-error" role="alert">この図を描画できませんでした。ソースを表示します。</p><pre>{source}</pre><button type="button" onClick={()=>{setResult(undefined);setAttempt(n=>n+1);}}>図の描画を再試行</button></div>:<span role="status">{label} を描画中…</span>}
 </div>;
}
