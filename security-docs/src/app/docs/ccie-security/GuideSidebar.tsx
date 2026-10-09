'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Menu, X } from 'lucide-react';

export interface GuideChapter {
  id: string;
  title: string;
  children: readonly { id: string; title: string }[];
}

/** Original guide navigation: fixed on desktop, a dismissible drawer on mobile. */
export function GuideSidebar({ items }: { items: readonly GuideChapter[] }) {
  const [active, setActive] = useState('s1');
  const [open, setOpen] = useState(false);
  const aside = useRef<HTMLElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const chapterId = active.split('-')[0];

  const select = useCallback((id: string) => {
    if (items.some(item => item.id === id || item.children.some(child => child.id === id))) setActive(id);
  }, [items]);

  useEffect(() => {
    let mounted = true;
    const onHash = () => { if (mounted) select(window.location.hash.slice(1)); };
    queueMicrotask(onHash);
    window.addEventListener('hashchange', onHash);
    const observer = typeof IntersectionObserver === 'undefined' ? undefined : new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) select(entry.target.id);
    }, { rootMargin: '-20% 0px -70% 0px' });
    for (const item of items) {
      for (const id of [item.id, ...item.children.map(child => child.id)]) {
        const target = document.getElementById(id);
        if (target) observer?.observe(target);
      }
    }
    return () => { mounted = false; window.removeEventListener('hashchange', onHash); observer?.disconnect(); };
  }, [items, select]);

  const close = useCallback(() => {
    setOpen(false);
    button.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { close(); return; }
      if (event.key !== 'Tab') return;
      const links = [...(aside.current?.querySelectorAll<HTMLAnchorElement>('a') ?? [])].filter(link => !link.closest('ul.sub') || link.closest('li.top')?.classList.contains('open'));
      const first = links[0];
      const last = links.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    const onResize = () => { if (window.innerWidth > 1024) close(); };
    const onPointer = (event: PointerEvent) => {
      if (event.target instanceof Element && event.target.closest('.docs-header')) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    window.addEventListener('resize', onResize);
    aside.current?.querySelector<HTMLAnchorElement>('a')?.focus();
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
      window.removeEventListener('resize', onResize);
    };
  }, [open, close]);

  const onSelect = (id: string) => { select(id); if (open) close(); };
  return (
    <>
      <button type="button" className="menu-btn" ref={button} aria-label={open ? '目次を閉じる' : '目次を開く'} aria-expanded={open} aria-controls="ccie-sidebar" onClick={() => setOpen(value => !value)}>
        {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
      </button>
      <button type="button" className={`backdrop${open ? ' open' : ''}`} aria-label="目次を閉じる背景" tabIndex={-1} hidden={!open} onClick={close} />
      <aside id="ccie-sidebar" className={`sidebar${open ? ' open' : ''}`} aria-label="CCIE Security 目次" ref={aside}>
        <div className="brand">
          <svg className="seal" viewBox="0 0 48 48" width="44" height="44" aria-hidden="true">
            <circle cx="24" cy="24" r="22" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M24 9 L36 14 V24 C36 31 31 36 24 39 C17 36 12 31 12 24 V14 Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M18 24 L22.5 28.5 L30 20" fill="none" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          <div><div className="brand-title">CCIE Security</div><div className="brand-sub">初学者向け学習ガイド</div></div>
        </div>
        <nav className="guide-toc" aria-label="ページ内目次">
          <ul>{items.map(item => (
            <li key={item.id} className={`top${chapterId === item.id ? ' open' : ''}`}>
              <a href={`#${item.id}`} className={chapterId === item.id ? 'active' : undefined} aria-current={active === item.id ? 'location' : undefined} onClick={() => onSelect(item.id)}>{item.title}</a>
              {item.children.length > 0 && <ul className="sub">{item.children.map(child => (
                <li key={child.id}><a href={`#${child.id}`} className={active === child.id ? 'active' : undefined} aria-current={active === child.id ? 'location' : undefined} onClick={() => onSelect(child.id)}>{child.title}</a></li>
              ))}</ul>}
            </li>
          ))}</ul>
        </nav>
      </aside>
    </>
  );
}
