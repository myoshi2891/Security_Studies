'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { GuideIcon, type IconName } from './GuideIcon';

export interface TocGroup { title: string; items: readonly { id: string; title: string; icon: IconName }[]; }
/** Source grouped TOC with a dismissible mobile drawer below the shared header. */
export function GuideSidebar({ groups }: { groups: readonly TocGroup[] }) {
  const [active, setActive] = useState('sec1');
  const [open, setOpen] = useState(false);
  const panel = useRef<HTMLElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const select = useCallback((id: string) => { if (groups.some(group => group.items.some(item => item.id === id))) setActive(id); }, [groups]);
  const close = useCallback(() => { setOpen(false); button.current?.focus(); }, []);

  useEffect(() => {
    let mounted = true;
    const hash = () => { if (mounted) select(window.location.hash.slice(1)); };
    queueMicrotask(hash); window.addEventListener('hashchange', hash);
    const observer = typeof IntersectionObserver === 'undefined' ? undefined : new IntersectionObserver(entries => {
      const top = entries.filter(entry => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (top) select(top.target.id);
    }, { rootMargin: '-20% 0px -70% 0px' });
    const guide = panel.current?.closest('.atlas-guide');
    for (const group of groups) for (const item of group.items) {
      const section = guide?.querySelector(`[id="${item.id}"]`);
      if (section) observer?.observe(section);
    }
    return () => { mounted = false; window.removeEventListener('hashchange', hash); observer?.disconnect(); };
  }, [groups, select]);

  useEffect(() => {
    const guide = panel.current?.closest('.atlas-guide');
    guide?.classList.toggle('nav-open', open);
    if (!open) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { close(); return; }
      if (event.key !== 'Tab') return;
      const links = [...(panel.current?.querySelectorAll<HTMLAnchorElement>('nav a') ?? [])];
      const first = links[0], last = links.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    const resize = () => { if (window.innerWidth > 900) close(); };
    const pointer = (event: PointerEvent) => { if (event.target instanceof Element && event.target.closest('.docs-header')) setOpen(false); };
    document.addEventListener('keydown', key); document.addEventListener('pointerdown', pointer); window.addEventListener('resize', resize);
    panel.current?.querySelector<HTMLAnchorElement>('nav a')?.focus();
    return () => {
      guide?.classList.remove('nav-open'); document.body.style.overflow = overflow;
      document.removeEventListener('keydown', key); document.removeEventListener('pointerdown', pointer); window.removeEventListener('resize', resize);
    };
  }, [open, close]);

  return <>
    <aside className="sidebar" id="atlas-sidebar" aria-label="MITRE ATLAS 目次" ref={panel}>
      <div className="brand"><GuideIcon name="ti-shield-lock" /> MITRE ATLAS ガイド</div>
      <nav>{groups.map(group => <div key={group.title}>
        <div className="nav-section-title">{group.title}</div>
        {group.items.map(item => <a key={item.id} href={`#${item.id}`} aria-current={active === item.id ? 'location' : undefined} onClick={() => { select(item.id); if (open) close(); }}><GuideIcon name={item.icon} />{item.title}</a>)}
      </div>)}</nav>
    </aside>
    <button className="backdrop" type="button" aria-label="目次を閉じる背景" tabIndex={-1} hidden={!open} onClick={close} />
    <button className="menu-button" type="button" ref={button} aria-controls="atlas-sidebar" aria-expanded={open} aria-label={open ? '目次を閉じる' : '目次を開く'} onClick={() => setOpen(value => !value)}>{open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}</button>
  </>;
}
