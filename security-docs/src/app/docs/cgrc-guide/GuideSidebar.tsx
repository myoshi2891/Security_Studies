'use client';
import {useCallback,useEffect,useRef,useState,type ReactNode} from 'react';
import {GuideIcon} from './GuideIcon';

/** Decode a URL fragment, keeping the raw value when it is malformed. */
const decodeFragment=(value:string)=>{try{return decodeURIComponent(value);}catch{return value;}};

/** Keep the source's single expanded chapter, selected subsection and scrolling aside. */
export function GuideSidebar({children}:{children:ReactNode}){
 const panel=useRef<HTMLElement>(null),toggle=useRef<HTMLButtonElement>(null);
 const [open,setOpen]=useState(false),openRef=useRef(open);
 useEffect(()=>{openRef.current=open;},[open]);
 const close=useCallback(()=>{setOpen(false);toggle.current?.focus();},[]);
 const select=useCallback((id:string)=>{
  const aside=panel.current;
  if(!aside)return;
  const links=[...aside.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')];
  const selected=links.find(a=>decodeFragment(a.hash.slice(1))===id);
  if(!selected)return;
  const group=selected.closest('nav>ul>li');
  const parent=group?.querySelector<HTMLAnchorElement>(':scope>a');
  for(const item of aside.querySelectorAll('nav>ul>li'))item.classList.toggle('open',item===group);
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
  const aside=panel.current,guide=aside?.closest('.cgrc-guide');
  const hash=()=>select(decodeFragment(window.location.hash.slice(1))||'reading');
  hash();window.addEventListener('hashchange',hash);
  const click=(event:MouseEvent)=>{
   const link=event.target instanceof Element?event.target.closest<HTMLAnchorElement>('a[href^="#"]'):null;
   if(!link)return;
   const id=decodeFragment(link.hash.slice(1));select(id);
   if(!openRef.current)return;
   const target=document.getElementById(id),heading=target?.matches('h1,h2,h3,h4,h5')?target:target?.querySelector<HTMLElement>('h1,h2,h3,h4,h5')??target;
   if(!heading){close();return;}
   event.preventDefault();window.history.pushState(null,'',`#${encodeURIComponent(id)}`);setOpen(false);heading.tabIndex=-1;heading.focus({preventScroll:true});target?.scrollIntoView();
  };
  aside?.addEventListener('click',click);
  const observers:IntersectionObserver[]=[];
  for(const selector of ['section[id]']){
   if(typeof IntersectionObserver==='undefined')continue;
   const nodes=[...(guide?.querySelectorAll(selector)??[])],visible=new Set<Element>();
   const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting)visible.add(entry.target);else visible.delete(entry.target);}const current=nodes.filter(node=>visible.has(node)).at(-1);if(current)select(current.id);},{rootMargin:'-20% 0px -70% 0px'});
   nodes.forEach(node=>observer.observe(node));observers.push(observer);
  }
  return ()=>{window.removeEventListener('hashchange',hash);aside?.removeEventListener('click',click);observers.forEach(observer=>observer.disconnect());};
 },[close,select]);
 useEffect(()=>{
  if(!open)return;
  const previous=document.body.style.overflow;document.body.style.overflow='hidden';
  const visible=()=>[...(panel.current?.querySelectorAll<HTMLAnchorElement>('.brand,nav>ul>li>a,nav>ul>li.open>ul a')??[])];
  visible()[0]?.focus();
  const key=(event:KeyboardEvent)=>{if(event.key==='Escape')close();if(event.key!=='Tab')return;const links=visible(),first=links[0],last=links.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}};
  const resize=()=>{if(window.innerWidth>1024)close();};
  const header=(event:PointerEvent)=>{if(!(event.target instanceof Element)||!event.target.closest('.docs-header'))return;if(panel.current?.contains(document.activeElement))toggle.current?.focus();setOpen(false);};
  document.addEventListener('keydown',key);window.addEventListener('resize',resize);document.addEventListener('pointerdown',header);
  return ()=>{document.body.style.overflow=previous;document.removeEventListener('keydown',key);window.removeEventListener('resize',resize);document.removeEventListener('pointerdown',header);};
 },[open,close]);
 return <>
  <aside className={`sidebar${open?' open':''}`} id="sidebar" aria-label="目次" ref={panel}>{children}</aside>
  <div className={`backdrop${open?' open':''}`} id="backdrop" onClick={close}/>
  <button className="nav-toggle" id="navToggle" type="button" aria-label={open?'メニューを閉じる':'メニューを開く'} aria-expanded={open} aria-controls="sidebar" ref={toggle} onClick={()=>setOpen(value=>!value)}><GuideIcon name={open?'ti-x':'ti-menu-2'} className={open?'ti ti-x':'ti ti-menu-2'}/></button>
 </>;
}
