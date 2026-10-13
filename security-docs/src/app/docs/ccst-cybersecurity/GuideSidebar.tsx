'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Menu, X } from 'lucide-react';

export interface TocGroup { title: string; id: string | null; items: readonly { id: string; title: string }[]; }
/** Source grouped TOC with a dismissible mobile drawer below the shared header. */
export function GuideSidebar({ groups }: { groups: readonly TocGroup[] }) {
  const [active, setActive] = useState('s0');
  const [open, setOpen] = useState(false);
  const panel = useRef<HTMLElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const select = useCallback((id: string) => { if (groups.some(group => group.id === id || group.items.some(item => item.id === id))) setActive(id); }, [groups]);
  const close = useCallback(() => { setOpen(false); button.current?.focus(); }, []);

  useEffect(() => {
    let mounted = true;
    const hash = () => { if (mounted) select(window.location.hash.slice(1)); };
    queueMicrotask(hash); window.addEventListener('hashchange', hash);
    // 通知は交差状態が変わった節だけを含むため、交差中の節を通知間で保持して全体から最上部を選ぶ
    const intersecting = new Map<Element, number>();
    const observer = typeof IntersectionObserver === 'undefined' ? undefined : new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) intersecting.set(entry.target, entry.boundingClientRect.top);
        else intersecting.delete(entry.target);
      }
      const top = [...intersecting].sort(([, a], [, b]) => a - b)[0];
      if (top) select(top[0].id);
    }, { rootMargin: '-20% 0px -70% 0px' });
    const guide = panel.current?.closest('.ccst-guide');
    for (const group of groups) for (const item of [...(group.id ? [{ id: group.id }] : []), ...group.items]) {
      const section = guide?.querySelector(`[id="${item.id}"]`);
      if (section) observer?.observe(section);
    }
    return () => { mounted = false; window.removeEventListener('hashchange', hash); observer?.disconnect(); };
  }, [groups, select]);

  useEffect(() => {
    const guide = panel.current?.closest('.ccst-guide');
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
    const resize = () => { if (window.innerWidth > 1000) close(); };
    const pointer = (event: PointerEvent) => {
      if (!(event.target instanceof Element) || !event.target.closest('.docs-header')) return;
      // ドロワー内のフォーカスだけを menu ボタンへ戻し、ヘッダー側のフォーカスは維持する
      if (panel.current?.contains(document.activeElement)) button.current?.focus();
      setOpen(false);
    };
    document.addEventListener('keydown', key); document.addEventListener('pointerdown', pointer); window.addEventListener('resize', resize);
    panel.current?.querySelector<HTMLAnchorElement>('nav a')?.focus();
    return () => {
      guide?.classList.remove('nav-open'); document.body.style.overflow = overflow;
      document.removeEventListener('keydown', key); document.removeEventListener('pointerdown', pointer); window.removeEventListener('resize', resize);
    };
  }, [open, close]);

  useEffect(() => {
    const link = panel.current?.querySelector<HTMLAnchorElement>(`a[href="#${active}"]`);
    if (!link || !panel.current) return;
    const top = link.offsetTop;
    if (top < panel.current.scrollTop) panel.current.scrollTop = top;
    else if (top + link.offsetHeight > panel.current.scrollTop + panel.current.clientHeight) panel.current.scrollTop = top + link.offsetHeight - panel.current.clientHeight;
  }, [active]);

  const onSelect = (id: string) => { select(id); if (open) close(); };
  return <>
    <aside className="sidebar" id="ccst-sidebar" aria-label="CCST Cybersecurity 目次" ref={panel}>
      <div className="brand">
        <svg className="crest" viewBox="0 0 40 40" width="40" height="40" aria-hidden="true"><circle className="ring" cx="20" cy="20" r="18" /><path className="shield" d="M20 9l9 3.5v7.2c0 5.4-3.7 9.4-9 11.3-5.3-1.9-9-5.9-9-11.3v-7.2z" /><path className="tick" d="M15.5 20.5l3.2 3.2 6-6.4" /></svg>
        <div><div className="brand-t">CCST<br />サイバーセキュリティ</div><div className="brand-s">100-160 学習ガイド</div></div>
      </div>
      <nav className="guide-toc" aria-label="ページ内目次">{groups.map(group => <div key={group.title}>
        <div className="nav-group">{group.id ? <a href={`#${group.id}`} className={active === group.id ? 'active' : undefined} aria-current={active === group.id ? 'location' : undefined} onClick={() => onSelect(group.id!)}>{group.title}</a> : group.title}</div>
        <ul>{group.items.map(item => <li key={item.id}><a href={`#${item.id}`} className={active === item.id ? 'active' : undefined} aria-current={active === item.id ? 'location' : undefined} onClick={() => onSelect(item.id)}>{item.title}</a></li>)}</ul>
      </div>)}</nav>
    </aside>
    <button className="nav-backdrop" type="button" aria-label="目次を閉じる背景" tabIndex={-1} hidden={!open} onClick={close} />
    <button className="nav-toggle" type="button" ref={button} aria-controls="ccst-sidebar" aria-expanded={open} aria-label={open ? '目次を閉じる' : '目次を開く'} onClick={() => setOpen(value => !value)}>{open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}</button>
  </>;
}
