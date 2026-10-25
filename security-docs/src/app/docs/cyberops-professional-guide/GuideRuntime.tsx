'use client';
import {useRef,type MouseEvent,type ReactNode} from 'react';
/** Keep each native answer disclosure independent while supporting the original bulk controls. */
export function GuideRuntime({children}:{children:ReactNode}){
 const root=useRef<HTMLDivElement>(null);
 const click=(event:MouseEvent<HTMLDivElement>)=>{
  if(!(event.target instanceof Element))return;
  const button=event.target.closest<HTMLButtonElement>('.quiz-ctl button[data-q]');
  if(!button||!root.current?.contains(button))return;
  for(const answer of root.current.querySelectorAll<HTMLDetailsElement>('details.ans'))answer.open=button.dataset.q==='open';
 };
 return <div ref={root} onClick={click}>{children}</div>;
}
