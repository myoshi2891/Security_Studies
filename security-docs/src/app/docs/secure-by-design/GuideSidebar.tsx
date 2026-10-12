'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Menu, X } from 'lucide-react';

export interface GuideChapter { id: string; title: string; }

/** Original fixed TOC, with a keyboard accessible mobile drawer. */
export function GuideSidebar({ items }: { items: readonly GuideChapter[] }) {
  const [active, setActive] = useState('sec-0');
  const [open, setOpen] = useState(false);
  const aside = useRef<HTMLElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const select = useCallback((id: string) => {
    if (items.some(item => item.id === id)) setActive(id);
  }, [items]);
  const close = useCallback(() => { setOpen(false); button.current?.focus(); }, []);

  useEffect(() => {
    let mounted = true;
    const onHash = () => { if (mounted) select(window.location.hash.slice(1)); };
    queueMicrotask(onHash);
    window.addEventListener('hashchange', onHash);
    const observer = typeof IntersectionObserver === 'undefined' ? undefined : new IntersectionObserver(entries => {
      const top = entries.filter(entry => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (top) select(top.target.id);
    }, { rootMargin: '-20% 0px -70% 0px' });
    const guide = aside.current?.closest('.secure-by-design-guide');
    for (const item of items) {
      const target = guide?.querySelector(`[id="${item.id}"]`);
      if (target) observer?.observe(target);
    }
    return () => { mounted = false; window.removeEventListener('hashchange', onHash); observer?.disconnect(); };
  }, [items, select]);

  useEffect(() => {
    const panel = aside.current;
    const link = panel?.querySelector<HTMLAnchorElement>(`a[href="#${active}"]`);
    if (!panel || !link) return;
    const top = link.offsetTop;
    if (top < panel.scrollTop + 60) panel.scrollTop = Math.max(0, top - 60);
    else if (top + link.offsetHeight > panel.scrollTop + panel.clientHeight - 60) panel.scrollTop = top + link.offsetHeight - panel.clientHeight + 60;
  }, [active]);

  useEffect(() => {
    const guide = aside.current?.closest('.secure-by-design-guide');
    guide?.classList.toggle('nav-open', open);
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { close(); return; }
      if (event.key !== 'Tab') return;
      const links = [...(aside.current?.querySelectorAll<HTMLAnchorElement>('a') ?? [])];
      const first = links[0], last = links.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    const onResize = () => { if (window.innerWidth > 1024) close(); };
    const onPointer = (event: PointerEvent) => { if (event.target instanceof Element && event.target.closest('.docs-header')) setOpen(false); };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    window.addEventListener('resize', onResize);
    aside.current?.querySelector<HTMLAnchorElement>('a')?.focus();
    return () => {
      guide?.classList.remove('nav-open');
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
      window.removeEventListener('resize', onResize);
    };
  }, [open, close]);

  return <>
    <aside className="sidebar" id="sbd-sidebar" aria-label="目次" ref={aside}>
      <a className="brand" href="#top" onClick={() => { if (open) close(); }}>
        <span className="brand-name">Secure by Design</span>
        <span className="brand-sub">入門ガイド / 2026年10月8日時点</span>
      </a>
      <nav><ul>{items.map(item => <li key={item.id}>
        <a href={`#${item.id}`} className={active === item.id ? 'active' : undefined} aria-current={active === item.id ? 'location' : undefined} onClick={() => { select(item.id); if (open) close(); }}>{item.title}</a>
      </li>)}</ul></nav>
    </aside>
    <button type="button" className="backdrop" aria-label="目次を閉じる背景" tabIndex={-1} hidden={!open} onClick={close} />
    <button type="button" className="burger" ref={button} aria-label={open ? '目次を閉じる' : '目次を開く'} aria-expanded={open} aria-controls="sbd-sidebar" onClick={() => setOpen(value => !value)}>
      {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
    </button>
  </>;
}
