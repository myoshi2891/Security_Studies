'use client';
import {useEffect} from 'react';
import {answers} from './answers';

/** Bind controls within this guide; leave native form and disclosure markup intact. */
export function GuideRuntime(){
 useEffect(()=>{
  const guide=document.querySelector('.cgrc-guide');
  if(!guide)return;
  const lists=[...guide.querySelectorAll('.checklist')];
  const cards=[...guide.querySelectorAll<HTMLElement>('.q-card')];
  const selections=new Map<HTMLElement,string>();
  const updateProgress=()=>{
   for(const list of lists){const boxes=[...list.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')],out=list.querySelector('.cl-progress');if(out)out.textContent=`${boxes.filter(b=>b.checked).length} / ${boxes.length}`;}
  };
  const updateScore=()=>{
   const score=guide.querySelector('.q-score');
   const correct=cards.filter(card=>selections.get(card)===answers[card.dataset.q!]?.a).length;
   if(score)score.textContent=`${selections.size} 問回答 / 正解 ${correct} / ${cards.length}`;
  };
  const click=(event:Event)=>{
   const button=event.target instanceof Element?event.target.closest<HTMLButtonElement>('button'):null;
   if(!button||!guide.contains(button))return;
   if(button.matches('.q-reset')){
    selections.clear();
    for(const card of cards){card.classList.remove('answered');for(const option of card.querySelectorAll('.q-opt'))option.classList.remove('correct','wrong');const fb=card.querySelector<HTMLElement>('.q-fb');if(fb){fb.hidden=true;fb.replaceChildren();}}
    updateScore();return;
   }
   if(!button.matches('.q-opt'))return;
   const card=button.closest<HTMLElement>('.q-card');
   if(!card||selections.has(card))return;
   const answer=answers[card.dataset.q!];
   if(!answer)return;
   selections.set(card,button.dataset.opt!);card.classList.add('answered');
   const ok=button.dataset.opt===answer.a;
   button.classList.add(ok?'correct':'wrong');
   card.querySelector(`[data-opt="${answer.a}"]`)?.classList.add('correct');
   const fb=card.querySelector<HTMLElement>('.q-fb');
   if(fb){const strong=document.createElement('strong');strong.textContent=ok?'正解です。':`不正解です。正解は ${answer.a} です。`;fb.replaceChildren(strong,document.createTextNode(' '+answer.e));fb.hidden=false;}
   updateScore();
  };
  guide.addEventListener('change',updateProgress);guide.addEventListener('click',click);
  updateProgress();updateScore();
  return ()=>{guide.removeEventListener('change',updateProgress);guide.removeEventListener('click',click);};
 },[]);
 return null;
}
