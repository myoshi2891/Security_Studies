'use client';
import {useEffect,useRef} from 'react';

/** Bind the original quiz controls, keeping checks independent from answer disclosure. */
export function GuideRuntime(){
 const marker=useRef<HTMLSpanElement>(null);
 useEffect(()=>{
  const guide=marker.current?.closest('.iso29100-guide');
  if(!guide)return;
  const inputs=[...guide.querySelectorAll<HTMLInputElement>('.quiz-check-input')];
  const answers=[...guide.querySelectorAll<HTMLDetailsElement>('.quiz-details')];
  const update=()=>{
   const checked=inputs.filter(input=>input.checked).length;
   const percent=Math.round(100*checked/(inputs.length||10));
   const text=guide.querySelector('#quizProgressText');
   const fill=guide.querySelector<HTMLElement>('#quizProgressFill');
   if(text)text.textContent=`${checked} / ${inputs.length} 問（${percent}%）`;
   if(fill)fill.style.width=`${percent}%`;
  };
  const label=(answer:HTMLDetailsElement)=>{
   const text=answer.querySelector('.quiz-summary-text');
   const icon=answer.querySelector('.quiz-summary > i:first-child');
   if(text)text.textContent=answer.open?'解答を隠す':'解答を確認する';
   if(icon){
    icon.className=answer.open?'ti ti-eye-off':'ti ti-eye';
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
    for(const [key,value] of Object.entries({viewBox:'0 0 24 24',width:'24',height:'24',fill:'none',stroke:'currentColor','stroke-width':'2','stroke-linecap':'round','stroke-linejoin':'round','aria-hidden':'true'}))svg.setAttribute(key,value);
    const paths=answer.open?['m3 3 18 18','M10.58 10.59a2 2 0 0 0 2.83 2.82','M9.88 5.09A10.94 10.94 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-3.21 4.36','M6.61 6.61A13.53 13.53 0 0 0 2 12s3 7 10 7a10.94 10.94 0 0 0 5.39-1.61']:['M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12','M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0'];
    for(const d of paths){const path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d',d);svg.appendChild(path);}
    icon.replaceChildren(svg);
   }
  };
  const toggles=answers.map(answer=>{const listener=()=>label(answer);answer.addEventListener('toggle',listener);return ()=>answer.removeEventListener('toggle',listener);});
  const click=(event:Event)=>{
   const target=event.target instanceof Element?event.target.closest('button'):null;
   if(target?.id==='quizExpandAll'||target?.id==='quizCollapseAll')for(const answer of answers){answer.open=target.id==='quizExpandAll';label(answer);}
   if(target?.id==='quizResetChecks'){for(const input of inputs)input.checked=false;update();}
  };
  guide.addEventListener('click',click);
  for(const input of inputs)input.addEventListener('change',update);
  update();
  return ()=>{guide.removeEventListener('click',click);for(const input of inputs)input.removeEventListener('change',update);for(const remove of toggles)remove();};
 },[]);
 return <span hidden ref={marker} data-quiz-runtime="" />;
}
