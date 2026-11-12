'use client';
import {useEffect,useRef,type ReactNode} from 'react';

/** Enhance server-rendered guide content; all handlers are scoped and disposed on navigation. */
export function GuideRuntime({children}:{children:ReactNode}){
 const ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  const guide=ref.current;if(!guide)return;
  const sidebar=guide.querySelector<HTMLElement>('#sidebar')!,toggle=guide.querySelector<HTMLButtonElement>('#menuBtn')!,backdrop=guide.querySelector<HTMLElement>('#backdrop')!,content=guide.querySelector<HTMLElement>('.guide-content')!;
  const links=[...guide.querySelectorAll<HTMLAnchorElement>('#nav a[href^="#"]')];
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
   selected.setAttribute('aria-current','location');
   const rect=selected.getBoundingClientRect(),bounds=sidebar.getBoundingClientRect();
   if(rect.top<bounds.top+70||rect.bottom>bounds.bottom-20)sidebar.scrollTop+=rect.top-bounds.top-sidebar.clientHeight/3;
  }
  const hash=()=>{const id=decode(location.hash.slice(1));pinned=!!id;if(id)select(id);};hash();
  const click=(event:MouseEvent)=>{
   const target=event.target instanceof Element?event.target:null;if(!target)return;
   if(target.closest('#menuBtn')){drawer(!open);return;}
   if(target.closest('#backdrop')){drawer(false);return;}
   const link=target.closest<HTMLAnchorElement>('#nav a[href^="#"]');
   if(link&&!event.ctrlKey&&!event.metaKey&&!event.shiftKey){const id=decode(link.hash.slice(1));pinned=true;select(id);if(open){drawer(false,false);const destination=guide!.querySelector<HTMLElement>('#'+CSS.escape(id));destination?.setAttribute('tabindex','-1');destination?.focus({preventScroll:true});}return;}
  };
  const key=(e:KeyboardEvent)=>{
   if(e.key==='Escape'&&open){drawer(false);return;}
   if(open&&e.key==='Tab'){const controls=[...links,toggle],first=controls[0],last=controls.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}
   if(['ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' '].includes(e.key))pinned=false;
  };
  const release=(event:Event)=>{if(event.target instanceof Node&&sidebar.contains(event.target))return;pinned=false;};
  const resize=()=>{if(window.innerWidth>1024&&open)drawer(false);};
  let observer:IntersectionObserver|undefined;
  if(typeof IntersectionObserver!=='undefined'){
   observer=new IntersectionObserver(entries=>{if(pinned)return;const last=entries.filter(e=>e.isIntersecting).at(-1);if(last)select(last.target.id);},{rootMargin:`-${window.innerHeight*.2}px 0px -${window.innerHeight*.7}px 0px`});
   guide.querySelectorAll('section[id]').forEach(s=>observer!.observe(s));
  }
  guide.addEventListener('click',click);document.addEventListener('keydown',key);window.addEventListener('hashchange',hash);window.addEventListener('wheel',release,{passive:true});window.addEventListener('touchstart',release,{passive:true});window.addEventListener('resize',resize);
  return()=>{if(open){document.body.style.overflow=previousOverflow;content.inert=false;}guide.removeEventListener('click',click);document.removeEventListener('keydown',key);window.removeEventListener('hashchange',hash);window.removeEventListener('wheel',release);window.removeEventListener('touchstart',release);window.removeEventListener('resize',resize);observer?.disconnect();};
 },[]);
 return <div className="scs-guide" ref={ref}>{children}</div>;
}
