'use client';
import {useEffect,useRef,type ReactNode} from 'react';

/** Attach one scoped quiz listener; remove it on unmount and effect replay. */
export function GuideRuntime({children}:{children:ReactNode}){
 const ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  const root=ref.current;if(!root)return;
  const find=<T extends HTMLElement=HTMLElement>(s:string)=>root.querySelector<T>(s)!;
  const cards=[...root.querySelectorAll<HTMLElement>('.q-card')];
  const result=find('#quizResult');
  const bands=JSON.parse(result.dataset.bands??'[]') as {min:number;max:number;label:string;next:string}[];
  const text=(s:string,value:string|number)=>{find(s).textContent=String(value);};
  const update=()=>{
   const correct=cards.filter(c=>c.dataset.state==='correct').length;
   const answered=cards.filter(c=>['correct','wrong'].includes(c.dataset.state??'')).length;
   const done=cards.filter(c=>c.dataset.state).length;
   text('#qAnswered',answered);text('#qCorrect',correct);find('#qFill').style.width=`${done/cards.length*100}%`;
   find('.quiz-progress').setAttribute('aria-valuenow',String(done));result.hidden=done!==cards.length;
   if(result.hidden)return;
   text('#qrNum',`${correct} / ${cards.length}`);text('#qrPct',`正答率 ${Math.round(correct/cards.length*100)}%`);
   const band=bands.find(b=>correct>=b.min&&correct<=b.max);text('#qrBand',band?.label??'');text('#qrNext',band?.next??'');
   const domains=new Map<string,{name:string;ok:number;n:number}>();
   for(const card of cards){const id=card.dataset.domain!;const group=domains.get(id)??{name:card.dataset.domainName!,ok:0,n:0};group.n++;if(card.dataset.state==='correct')group.ok++;domains.set(id,group);}
   const list=find('#qrDomains');list.replaceChildren();
   for(const [id,g] of domains){const item=document.createElement('li'),name=document.createElement('span'),bar=document.createElement('span'),fill=document.createElement('span'),count=document.createElement('span');name.textContent=`ドメイン${id} ${g.name}`;bar.className='qr-bar';fill.style.width=`${g.ok/g.n*100}%`;bar.append(fill);count.className='qr-count';count.textContent=`${g.ok} / ${g.n}`;item.append(name,bar,count);list.append(item);}
   result.scrollIntoView?.({block:'nearest',behavior:'smooth'});
  };
  const onClick=(event:MouseEvent)=>{
   if(!(event.target instanceof Element))return;const button=event.target.closest<HTMLButtonElement>('button');if(!button||!root.contains(button))return;
   if(['qReset','qReset2'].includes(button.id)){
    for(const card of cards){delete card.dataset.state;for(const option of card.querySelectorAll<HTMLButtonElement>('.q-opt')){option.disabled=false;option.classList.remove('is-correct','is-wrong');const mark=option.querySelector<HTMLElement>('.q-mark')!;mark.className='q-mark';mark.textContent='';}card.querySelector<HTMLElement>('.q-explain')!.hidden=true;}
    update();find('#quizBar').scrollIntoView?.({block:'start',behavior:'smooth'});return;
   }
   const card=button.closest<HTMLElement>('.q-card');if(!card||card.dataset.state||!button.matches('.q-opt,.q-reveal'))return;
   const reveal=button.matches('.q-reveal'),letter=button.dataset.letter,answer=card.dataset.answer;
   const correct=letter===answer;card.dataset.state=reveal?'revealed':correct?'correct':'wrong';
   for(const option of card.querySelectorAll<HTMLButtonElement>('.q-opt')){option.disabled=true;const mark=option.querySelector<HTMLElement>('.q-mark')!;if(option.dataset.letter===answer){option.classList.add('is-correct');mark.textContent='✓';}else if(!reveal&&option.dataset.letter===letter){option.classList.add('is-wrong');mark.textContent='×';}}
   card.querySelector<HTMLElement>('.q-explain')!.hidden=false;
   card.querySelector('.q-verdict-text')!.textContent=reveal?'解答を表示しました（採点には含まれません）':correct?'正解です':'不正解です';
   card.querySelector('.q-verdict i')!.textContent=reveal?'◉':correct?'✓':'×';update();
  };
  root.addEventListener('click',onClick);return()=>root.removeEventListener('click',onClick);
 },[]);
 return <div ref={ref}>{children}</div>;
}
