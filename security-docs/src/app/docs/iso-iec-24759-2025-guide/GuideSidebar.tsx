'use client';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Menu, X } from 'lucide-react';

/** URL のフラグメントは利用者が自由に書き換えられるため、復号できない値は「選択なし」として扱う */
const decodeFragment = (value: string) => {
  try { return decodeURIComponent(value); } catch { return ''; }
};

/** Keep the original nested TOC markup, with keyboard-accessible mobile controls. */
export function GuideSidebar({ children }: { children: ReactNode }) {
  const panel = useRef<HTMLElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const openRef = useRef(open);
  useEffect(() => { openRef.current = open; }, [open]);
  const close = useCallback(() => { setOpen(false); toggle.current?.focus(); }, []);
  const select = useCallback((id: string) => {
    const nav = panel.current;
    const links = [...(nav?.querySelectorAll<HTMLAnchorElement>('nav a[href^="#"]') ?? [])];
    const selected = links.find(a => decodeFragment(a.hash) === `#${id}`);
    for (const a of links) { a.classList.remove('active'); a.removeAttribute('aria-current'); }
    if (!selected) return;
    selected.classList.add('active'); selected.setAttribute('aria-current', 'location');
    // The original ISO27001 aside owns its scrolling viewport.
    const viewport = nav;
    if (viewport) {
      const linkBounds = selected.getBoundingClientRect();
      const bounds = viewport.getBoundingClientRect();
      if (linkBounds.top < bounds.top + 8 || linkBounds.bottom > bounds.bottom - 8) {
        viewport.scrollTop += linkBounds.top - bounds.top - viewport.clientHeight / 3;
      }
    }
  }, []);
  useEffect(() => {
    const guide = panel.current?.closest('.iso24759-guide');
    const visible = new Set<Element>();
    let areaTop = window.innerHeight * 0.2;
    let pinnedTarget: Element | null = null, pinnedTop: number | null = null;
    let settleTimer: ReturnType<typeof setTimeout> | undefined;
    const track = () => {
      if (pinnedTarget) return;
      const positions = [...visible].map(element => ({ element, top: element.getBoundingClientRect().top })).sort((a, b) => a.top - b.top);
      const current = (positions.filter(({ top }) => top <= areaTop).at(-1) ?? positions[0])?.element;
      if (current) select(current.id);
    };
    const settle = () => {
      clearTimeout(settleTimer); pinnedTop = null;
      settleTimer = setTimeout(() => { pinnedTop = pinnedTarget?.getBoundingClientRect().top ?? null; }, 150);
    };
    const pin = (id: string) => {
      pinnedTarget = document.getElementById(id)?.closest('section[id]') ?? null;
      select(pinnedTarget?.id ?? id); settle();
    };
    const release = () => { pinnedTarget = null; clearTimeout(settleTimer); track(); };
    const releaseKey = (event: KeyboardEvent) => {
      if (event.target instanceof Node && panel.current?.contains(event.target)) return;
      if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(event.key)) release();
    };
    const scroll = () => {
      if (!pinnedTarget) return;
      if (pinnedTop === null) { settle(); return; }
      if (Math.abs(pinnedTarget.getBoundingClientRect().top - pinnedTop) > 2) release();
    };
    const hash = () => {
      const fragment = window.location.hash.slice(1);
      if (fragment) pin(decodeFragment(fragment));
      else { pinnedTarget = null; select(decodeFragment(panel.current?.querySelector<HTMLAnchorElement>('nav a')?.hash.slice(1) || '')); }
    };
    hash(); window.addEventListener('hashchange', hash);
    const click = (event: MouseEvent) => {
      const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href^="#"]') : null;
      if (!link || event.ctrlKey || event.metaKey) return;
      const id = decodeFragment(link.hash.slice(1));
      pin(id);
      if (!openRef.current) return;
      // リンク選択で閉じた場合は移動先の見出しへ。見出しがなければ従来どおりメニューボタンへ戻す
      const target = document.getElementById(id);
      const heading = target?.matches('h1,h2,h3,h4') ? target : target?.querySelector<HTMLElement>('h1,h2,h3,h4') ?? target;
      if (!heading) { close(); return; }
      event.preventDefault();
      window.history.pushState(null, '', `#${encodeURIComponent(id)}`);
      setOpen(false);
      heading.closest('.main')?.removeAttribute('inert');
      if (!heading.hasAttribute('tabindex')) heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
      target?.scrollIntoView();
    };
    const nav = panel.current; nav?.addEventListener('click', click);
    const scrollInput = (event: WheelEvent | TouchEvent) => {
      if (event.target instanceof Node && nav?.contains(event.target)) return;
      release();
    };
    const observer = typeof IntersectionObserver === 'undefined' ? undefined : new IntersectionObserver(entries => {
      for (const entry of entries) { if (entry.isIntersecting) visible.add(entry.target); else visible.delete(entry.target); }
      areaTop = entries[0]?.rootBounds?.top ?? window.innerHeight * 0.2;
      track();
    }, { rootMargin: '-20% 0px -70% 0px' });
    for (const section of guide?.querySelectorAll('section[id]') ?? []) observer?.observe(section);
    window.addEventListener('wheel', scrollInput, { passive: true }); window.addEventListener('touchmove', scrollInput, { passive: true }); window.addEventListener('keydown', releaseKey); window.addEventListener('scroll', scroll, { capture: true, passive: true });
    return () => { window.removeEventListener('hashchange', hash); nav?.removeEventListener('click', click); observer?.disconnect(); clearTimeout(settleTimer); window.removeEventListener('wheel', scrollInput); window.removeEventListener('touchmove', scrollInput); window.removeEventListener('keydown', releaseKey); window.removeEventListener('scroll', scroll, { capture: true }); };
  }, [close, select]);
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow; document.body.style.overflow = 'hidden';
    const content = panel.current?.closest('.iso24759-guide')?.querySelector<HTMLElement>('.main');
    const previousInert = content?.inert ?? false;
    if (content) content.inert = true;
    const links = [...(panel.current?.querySelectorAll<HTMLElement>('a,button') ?? [])]; links[0]?.focus();
    const key = (event: KeyboardEvent) => {
      if (event.key === 'k' && (event.ctrlKey || event.metaKey)) { setOpen(false); return; }
      if (event.key === 'Escape') close();
      if (event.key !== 'Tab') return;
      const first = links[0], last = links.at(-1);
      if (!panel.current?.contains(document.activeElement)) { event.preventDefault(); (event.shiftKey ? last : first)?.focus(); }
      else if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    const resize = () => { if (window.innerWidth > 1024) close(); };
    const header = (event: PointerEvent) => {
      if (!(event.target instanceof Element) || !event.target.closest('.docs-header')) return;
      if (panel.current?.contains(document.activeElement)) toggle.current?.focus();
      setOpen(false);
    };
    document.addEventListener('keydown', key); window.addEventListener('resize', resize); document.addEventListener('pointerdown', header);
    return () => { document.body.style.overflow = previous; if (content) content.inert = previousInert; document.removeEventListener('keydown', key); window.removeEventListener('resize', resize); document.removeEventListener('pointerdown', header); };
  }, [open, close]);
  return <>
    <aside className={`sidebar${open ? ' open' : ''}`} id="sidebar" role={open ? 'dialog' : undefined} aria-modal={open ? true : undefined} aria-label="目次" ref={panel}>
      {children}
      {open && <button type="button" className="mt-4 flex items-center gap-2 rounded border px-3 py-2" onClick={close}><X aria-hidden="true" />目次を閉じる</button>}
    </aside>
    <button type="button" className={`backdrop${open ? ' show' : ''}`} id="backdrop" aria-label="目次を閉じる背景" tabIndex={-1} hidden={!open} onClick={close} />
    <button className="menu-btn" id="menuBtn" type="button" aria-label={open ? '目次を閉じる' : '目次を開く'} aria-expanded={open} aria-controls="sidebar" ref={toggle} onClick={() => setOpen(value => !value)}>{open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}</button>
  </>;
}
