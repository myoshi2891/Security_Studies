'use client';
import {useCallback,useEffect,useRef,useState,type ReactNode} from 'react';


/** Decode a URL fragment, keeping the raw value when it is malformed. */
const decodeFragment=(value:string)=>{try{return decodeURIComponent(value);}catch{return value;}};

/** Keys that scroll the document, so pressing one means the reader has resumed scrolling. */
const SCROLL_KEYS=new Set(['ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' ']);

/** Quiet time that ends a clicked entry's jump, long enough to span the frames of a smooth scroll. */
const JUMP_SETTLE_MS=150;

/** Sub-pixel movement of a pinned heading, which never means the reader has gone elsewhere. */
const PIN_DRIFT_PX=2;

/** Keep the source's single expanded chapter, selected subsection and scrolling aside. */
export function GuideSidebar({children}:{children:ReactNode}){
 const panel=useRef<HTMLElement>(null),toggle=useRef<HTMLButtonElement>(null);
 const [open,setOpen]=useState(false),openRef=useRef(open);
 const background=useRef<{element:HTMLElement;inert:boolean}|null>(null);
 const restoreBackground=useCallback(()=>{if(background.current){background.current.element.inert=background.current.inert;background.current=null;}},[]);
 // A clicked entry stays selected through the jump; the reader's own scroll input, or any later scroll that moves the entry away, hands selection back to the observers.
 const pinned=useRef(false);
 useEffect(()=>{openRef.current=open;const guide=panel.current?.closest('.issep-guide');guide?.classList.toggle('nav-open',open);return ()=>{guide?.classList.remove('nav-open');};},[open]);
 const close=useCallback(()=>{setOpen(false);restoreBackground();toggle.current?.focus();},[restoreBackground]);
 const select=useCallback((id:string)=>{
  const aside=panel.current;
  if(!aside)return;
  const links=[...aside.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')];
  const selected=links.find(a=>decodeFragment(a.hash.slice(1))===id);
  if(!selected)return;
  const group=selected.closest('nav>ul>li');
  const parent=group?.querySelector<HTMLAnchorElement>(':scope>a');
  for(const item of aside.querySelectorAll('nav>ul>li')){
   if(item!==group&&item.contains(document.activeElement))item.querySelector<HTMLAnchorElement>(':scope>a')?.focus({preventScroll:true});
   item.classList.toggle('open',item===group);
  }
  for(const link of links){
   link.classList.toggle('active',link===selected||link===parent);
   link.removeAttribute('aria-current');
   if(!link.className)link.removeAttribute('class');
  }
  selected.setAttribute('aria-current','location');
  const rect=selected.getBoundingClientRect(),bounds=aside.getBoundingClientRect();
  if(rect.top<bounds.top+8||rect.bottom>bounds.bottom-8)aside.scrollTop+=rect.top-bounds.top-aside.clientHeight/3;
 },[]);
 useEffect(()=>{
  const aside=panel.current,guide=aside?.closest('.issep-guide');
  // Find-in-page sends the page no input events, so a scroll is its only trace; the pinned heading moving tells it apart from layout-only scrolls.
  let pinnedTarget:HTMLElement|null=null,pinnedTop:number|null=null,settleTimer:ReturnType<typeof setTimeout>|undefined;
  const nodes=[...(guide?.querySelectorAll('section[id],section h3[id]')??[])],visible=new Set<Element>();
  const track=()=>{
   if(pinned.current)return;
   const section=nodes.filter(node=>visible.has(node)&&node.matches('section')).at(-1);
   const preceding=section&&nodes.filter(node=>node.matches('h3')&&node.closest('section[id]')===section&&node.getBoundingClientRect().top<=window.innerHeight*0.2).at(-1);
   const current=nodes.filter(node=>visible.has(node)&&node.matches('h3')).at(-1)??preceding??section??nodes.filter(node=>node.getBoundingClientRect().top<=window.innerHeight*0.2).at(-1);
   if(current)select(current.id);
  };
  const release=()=>{pinned.current=false;track();};
  const settle=()=>{clearTimeout(settleTimer);pinnedTop=null;settleTimer=setTimeout(()=>{pinnedTop=pinnedTarget?.getBoundingClientRect().top??null;},JUMP_SETTLE_MS);};
  const followScroll=()=>{
   if(!pinned.current)return;
   if(pinnedTop===null){settle();return;}
   if(Math.abs((pinnedTarget?.getBoundingClientRect().top??pinnedTop)-pinnedTop)<=PIN_DRIFT_PX)return;
   pinned.current=false;track();
  };
  // A requested entry, by click or fragment, stays selected through its jump until the reader scrolls.
  const pin=(id:string)=>{
   pinnedTarget=document.getElementById(id);
   const linked=[...(aside?.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')??[])].some(link=>decodeFragment(link.hash.slice(1))===id);
   select(linked?id:pinnedTarget?.closest('section[id]')?.id??id);
   pinned.current=pinnedTarget!==null;settle();
  };
  const hash=()=>{const id=decodeFragment(window.location.hash.slice(1));if(id)pin(id);else release();};
  hash();window.addEventListener('hashchange',hash);
  const click=(event:MouseEvent)=>{
   const link=event.target instanceof Element?event.target.closest<HTMLAnchorElement>('a[href^="#"]'):null;
   if(!link||event.ctrlKey||event.metaKey||event.shiftKey)return;
   const id=decodeFragment(link.hash.slice(1));pin(id);
   if(!openRef.current)return;
   const target=document.getElementById(id),heading=target?.matches('h1,h2,h3,h4,h5')?target:target?.querySelector<HTMLElement>('h1,h2,h3,h4,h5')??target;
   if(!heading){close();return;}
   event.preventDefault();window.history.pushState(null,'',`#${encodeURIComponent(id)}`);setOpen(false);restoreBackground();heading.tabIndex=-1;heading.focus({preventScroll:true});target?.scrollIntoView();
  };
  aside?.addEventListener('click',click);
  const wheel=(event:WheelEvent)=>{if(event.target instanceof Node&&aside?.contains(event.target))return;release();};
  const pointer=(event:PointerEvent)=>{if(event.target instanceof Node&&aside?.contains(event.target))return;release();};
  const releaseKey=(event:KeyboardEvent)=>{if(SCROLL_KEYS.has(event.key))release();};
  window.addEventListener('wheel',wheel,{passive:true});window.addEventListener('pointerdown',pointer);window.addEventListener('keydown',releaseKey);window.addEventListener('scroll',followScroll,{capture:true,passive:true});
  const observers:IntersectionObserver[]=[];
  const observe=()=>{
   observers.forEach(observer=>observer.disconnect());observers.length=0;visible.clear();
   if(typeof IntersectionObserver==='undefined')return;
   // Pixel margins keep the band at 20–30% of viewport height; percentage root margins use width.
   const rootMargin=`-${window.innerHeight*0.2}px 0px -${window.innerHeight*0.7}px 0px`;
   for(const selector of ['section[id]','section h3[id]']){
    const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting)visible.add(entry.target);else visible.delete(entry.target);}track();},{rootMargin});
    nodes.filter(node=>node.matches(selector)).forEach(node=>observer.observe(node));observers.push(observer);
   }
  };
  observe();window.addEventListener('resize',observe);
  return ()=>{window.removeEventListener('hashchange',hash);aside?.removeEventListener('click',click);window.removeEventListener('wheel',wheel);window.removeEventListener('pointerdown',pointer);window.removeEventListener('keydown',releaseKey);window.removeEventListener('scroll',followScroll,{capture:true});window.removeEventListener('resize',observe);clearTimeout(settleTimer);observers.forEach(observer=>observer.disconnect());};
 },[close,select,restoreBackground]);
 useEffect(()=>{
  const resize=()=>{
   const focusNavigation=window.innerWidth>1024&&(openRef.current||document.activeElement===toggle.current);
   const focusMenu=window.innerWidth<=1024&&panel.current?.contains(document.activeElement);
   if(openRef.current||focusMenu)close();
   if(focusNavigation){
    const selected=panel.current?.querySelector<HTMLAnchorElement>('nav a[aria-current="location"]')??panel.current?.querySelector<HTMLAnchorElement>('nav a');
    // Chapter links remain visible if a subsequent observer update collapses the focused subsection's group.
    (selected?.closest('nav>ul>li')?.querySelector<HTMLAnchorElement>(':scope>a')??selected)?.focus();
   }
  };
  window.addEventListener('resize',resize);
  return ()=>{window.removeEventListener('resize',resize);};
 },[close]);
 useEffect(()=>{
  if(!open)return;
  const previous=document.body.style.overflow;document.body.style.overflow='hidden';
  const content=panel.current?.closest('.issep-guide')?.querySelector<HTMLElement>('.guide-content');
  if(content){background.current={element:content,inert:content.inert??false};content.inert=true;}
  const visible=()=>[...(panel.current?.querySelectorAll<HTMLAnchorElement>('nav>ul>li>a,nav>ul>li.open>ul a')??[])];
  visible()[0]?.focus();
  const key=(event:KeyboardEvent)=>{if(event.key==='Escape')close();if(event.key!=='Tab')return;const links=visible(),first=links[0],last=links.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}};
  const header=(event:PointerEvent)=>{if(!(event.target instanceof Element)||!event.target.closest('.docs-header'))return;if(panel.current?.contains(document.activeElement))toggle.current?.focus();setOpen(false);};
  document.addEventListener('keydown',key);document.addEventListener('pointerdown',header);
  return ()=>{document.body.style.overflow=previous;restoreBackground();document.removeEventListener('keydown',key);document.removeEventListener('pointerdown',header);};
 },[open,close,restoreBackground]);
 return <>
  <aside className={`sidebar${open?' open':''}`} id="sidebar" aria-label="目次" ref={panel}>{children}</aside>
  <div className={`backdrop${open?' show':''}`} id="backdrop" aria-hidden="true" onClick={close}/>
  <button className="menu-btn" id="menuBtn" type="button" aria-label={open?'目次を閉じる':'目次を開く'} aria-expanded={open} aria-controls="sidebar" ref={toggle} onClick={()=>setOpen(value=>!value)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg></button>
 </>;
}
