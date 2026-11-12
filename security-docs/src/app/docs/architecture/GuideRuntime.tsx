'use client';
import {useEffect,useRef,type ReactNode} from 'react';

/** Enhance server-rendered guide content; all handlers are scoped and disposed on navigation. */
export function GuideRuntime({children}:{children:ReactNode}){
 const ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  const guide=ref.current;if(!guide)return;
  const sidebar=guide.querySelector<HTMLElement>('#sidebar')!,toggle=guide.querySelector<HTMLButtonElement>('#navToggle')!,backdrop=guide.querySelector<HTMLElement>('#backdrop')!,content=guide.querySelector<HTMLElement>('.layout')!;
  const links=[...guide.querySelectorAll<HTMLAnchorElement>('#nav a[href^="#"]')];
  const timers=new Set<ReturnType<typeof setTimeout>>();
  let open=false,previousOverflow='',pinned=false;
  const icon=toggle.querySelector('i')!;
  // React owns the icon subtree already; switch its visible SVG through DOM cloning instead of another root.
  const originalIcon=icon.innerHTML;
  function drawer(value:boolean,restore=true){
   if(value===open)return;
   open=value;sidebar.classList.toggle('open',open);backdrop.classList.toggle('show',open);
   toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'目次を閉じる':'目次を開く');
   icon.className=open?'ti ti-x':'ti ti-menu-2';
   if(open){
    previousOverflow=document.body.style.overflow;document.body.style.overflow='hidden';content.inert=true;links[0]?.focus();
    icon.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>';
   }else{document.body.style.overflow=previousOverflow;content.inert=false;icon.innerHTML=originalIcon;if(restore)toggle.focus();}
  }
  const decode=(s:string)=>{try{return decodeURIComponent(s);}catch{return s;}};
  function select(id:string){
   const selected=links.find(a=>decode(a.hash.slice(1))===id);if(!selected)return;
   for(const a of links){a.classList.toggle('active',a===selected);a.removeAttribute('aria-current');}
   for(const li of guide!.querySelectorAll('.nav-ch'))li.classList.toggle('parent-active',li.contains(selected));
   selected.setAttribute('aria-current','location');
   const nav=guide!.querySelector<HTMLElement>('#nav')!;
   if(selected.offsetTop<nav.scrollTop+40||selected.offsetTop>nav.scrollTop+nav.clientHeight-80)nav.scrollTop=Math.max(0,selected.offsetTop-nav.clientHeight/3);
  }
  const hash=()=>{const id=decode(location.hash.slice(1));pinned=!!id;if(id)select(id);};hash();
  const click=(event:MouseEvent)=>{
   const target=event.target instanceof Element?event.target:null;if(!target)return;
   if(target.closest('#navToggle')){drawer(!open);return;}
   if(target.closest('#backdrop')){drawer(false);return;}
   const link=target.closest<HTMLAnchorElement>('#nav a[href^="#"]');
   if(link&&!event.ctrlKey&&!event.metaKey&&!event.shiftKey){const id=decode(link.hash.slice(1));pinned=true;select(id);if(open){drawer(false,false);const destination=guide!.querySelector<HTMLElement>('#'+CSS.escape(id));destination?.setAttribute('tabindex','-1');destination?.focus({preventScroll:true});}return;}
   const button=target.closest<HTMLButtonElement>('.copy-btn');if(!button)return;
   const text=button.closest('.code-block')!.querySelector('code')!.textContent??'',label=button.querySelector('span')!;
   const message=(value:string)=>{if(!guide!.isConnected)return;label.textContent=value;const timer=setTimeout(()=>{label.textContent='コピー';timers.delete(timer);},1600);timers.add(timer);};
   if(!navigator.clipboard?.writeText){message('コピーできませんでした');return;}
   navigator.clipboard.writeText(text).then(()=>message('コピーしました'),()=>message('コピーできませんでした'));
  };
  function update(){const items=[...guide!.querySelectorAll<HTMLElement>('.ck-item')];let done=0;for(const item of items){const checked=item.querySelector<HTMLInputElement>('input')!.checked;item.classList.toggle('done',checked);if(checked)done++;}guide!.querySelector('#ckDone')!.textContent=String(done);guide!.querySelector<HTMLElement>('#ckBar')!.style.width=`${items.length?done/items.length*100:0}%`;}
  const change=(e:Event)=>{if(e.target instanceof Element&&e.target.matches('.ck-item input'))update();};update();
  const key=(e:KeyboardEvent)=>{
   if(e.key==='Escape'&&open){drawer(false);return;}
   if(open&&e.key==='Tab'){const controls=[toggle,...links],first=controls[0],last=controls.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}
   if(['ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' '].includes(e.key))pinned=false;
  };
  const release=(event:Event)=>{if(event.target instanceof Node&&sidebar.contains(event.target))return;pinned=false;};
  const resize=()=>{if(window.innerWidth>1024&&open)drawer(false);};
  let observer:IntersectionObserver|undefined;
  if(typeof IntersectionObserver!=='undefined'){
   observer=new IntersectionObserver(entries=>{if(pinned)return;const last=entries.filter(e=>e.isIntersecting).at(-1);if(last)select(last.target.id);},{rootMargin:`-${window.innerHeight*.2}px 0px -${window.innerHeight*.7}px 0px`});
   guide.querySelectorAll('section[id]').forEach(s=>observer!.observe(s));
  }
  guide.addEventListener('click',click);guide.addEventListener('change',change);document.addEventListener('keydown',key);window.addEventListener('hashchange',hash);window.addEventListener('wheel',release,{passive:true});window.addEventListener('touchstart',release,{passive:true});window.addEventListener('resize',resize);
  return()=>{if(open){document.body.style.overflow=previousOverflow;content.inert=false;}guide.removeEventListener('click',click);guide.removeEventListener('change',change);document.removeEventListener('keydown',key);window.removeEventListener('hashchange',hash);window.removeEventListener('wheel',release);window.removeEventListener('touchstart',release);window.removeEventListener('resize',resize);observer?.disconnect();timers.forEach(clearTimeout);};
 },[]);
 return <div className="architecture-guide" ref={ref}>{children}</div>;
}
