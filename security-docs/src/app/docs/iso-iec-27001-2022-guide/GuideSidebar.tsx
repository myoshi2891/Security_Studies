'use client';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Menu, X } from 'lucide-react';

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
    const selected = links.find(a => a.hash === `#${id}`);
    if (!selected) return;
    for (const a of links) { a.classList.remove('active'); a.removeAttribute('aria-current'); }
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
    const guide = panel.current?.closest('.iso27001-guide');
    const hash = () => select(window.location.hash.slice(1) || 'ch0');
    hash(); window.addEventListener('hashchange', hash);
    const click = (event: MouseEvent) => {
      const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href^="#"]') : null;
      if (!link) return;
      const id = link.hash.slice(1);
      select(id);
      if (!openRef.current) return;
      // リンク選択で閉じた場合は移動先の見出しへ。見出しがなければ従来どおりメニューボタンへ戻す
      const target = document.getElementById(id);
      const heading = target?.matches('h1,h2,h3,h4') ? target : target?.querySelector<HTMLElement>('h1,h2,h3,h4') ?? target;
      if (!heading) { close(); return; }
      setOpen(false);
      if (!heading.hasAttribute('tabindex')) heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
    };
    const nav = panel.current; nav?.addEventListener('click', click);
    const visible = new Set<Element>();
    const observer = typeof IntersectionObserver === 'undefined' ? undefined : new IntersectionObserver(entries => {
      for (const entry of entries) { if (entry.isIntersecting) visible.add(entry.target); else visible.delete(entry.target); }
      const candidates = [...(guide?.querySelectorAll('section[id]') ?? [])].filter(el => visible.has(el));
      const current = candidates.at(-1);
      if (current) select(current.id);
    }, { rootMargin: '-20% 0px -70% 0px' });
    for (const section of guide?.querySelectorAll('section[id]') ?? []) observer?.observe(section);
    return () => { window.removeEventListener('hashchange', hash); nav?.removeEventListener('click', click); observer?.disconnect(); };
  }, [close, select]);
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow; document.body.style.overflow = 'hidden';
    const links = [...(panel.current?.querySelectorAll<HTMLAnchorElement>('a') ?? [])]; links[0]?.focus();
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
      if (event.key !== 'Tab') return;
      const first = links[0], last = links.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    const resize = () => { if (window.innerWidth > 1024) close(); };
    const header = (event: PointerEvent) => {
      if (!(event.target instanceof Element) || !event.target.closest('.docs-header')) return;
      if (panel.current?.contains(document.activeElement)) toggle.current?.focus();
      setOpen(false);
    };
    document.addEventListener('keydown', key); window.addEventListener('resize', resize); document.addEventListener('pointerdown', header);
    return () => { document.body.style.overflow = previous; document.removeEventListener('keydown', key); window.removeEventListener('resize', resize); document.removeEventListener('pointerdown', header); };
  }, [open, close]);
  return <>
    <aside className={`sidebar${open ? ' open' : ''}`} id="sidebar" aria-label="目次" ref={panel}>{children}</aside>
    <button type="button" className={`backdrop${open ? ' show' : ''}`} id="backdrop" aria-label="目次を閉じる背景" tabIndex={-1} hidden={!open} onClick={close} />
    <button className="menuBtn" id="menuBtn" type="button" aria-label={open ? '目次を閉じる' : '目次を開く'} aria-expanded={open} aria-controls="sidebar" ref={toggle} onClick={() => setOpen(value => !value)}>{open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}</button>
  </>;
}
