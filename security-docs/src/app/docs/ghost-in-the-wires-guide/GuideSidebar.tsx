'use client';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { GuideIcon } from './GuideIcon';

/** Keep the original nested .nav-group TOC markup, with keyboard-accessible mobile controls. */
export function GuideSidebar({ children }: { children: ReactNode }) {
  const panel = useRef<HTMLElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const openRef = useRef(open);
  useEffect(() => {
    openRef.current = open;
  }, [open]);

  const close = useCallback(() => {
    setOpen(false);
    toggle.current?.focus();
  }, []);

  const select = useCallback((id: string) => {
    const nav = panel.current;
    if (!nav) return;
    const links = [...nav.querySelectorAll<HTMLAnchorElement>('nav a[href^="#"]')];
    const groups = [...nav.querySelectorAll<HTMLElement>('.nav-group[data-target]')];
    const selected = links.find(a => a.hash === `#${id}`);
    const targetChapter = id.match(/^ch\d+/)?.[0] ?? id;
    const activeGroup =
      selected?.closest<HTMLElement>('.nav-group[data-target]') ??
      groups.find(g => g.dataset.target === targetChapter);
    if (!selected && !activeGroup) return;

    for (const a of links) {
      a.classList.remove('active');
      a.removeAttribute('aria-current');
    }
    for (const g of groups) {
      g.classList.remove('active');
    }
    if (activeGroup) {
      activeGroup.classList.add('active');
      const top = activeGroup.offsetTop;
      if (top < nav.scrollTop || top > nav.scrollTop + nav.clientHeight - 160) {
        nav.scrollTop = Math.max(0, top - 80);
      }
    }
    const currentLink = selected ?? activeGroup?.querySelector<HTMLAnchorElement>('.nav-link');
    if (currentLink) {
      currentLink.classList.add('active');
      currentLink.setAttribute('aria-current', 'location');
      const top = (currentLink as HTMLElement).offsetTop;
      if (top < nav.scrollTop + 60 || top + (currentLink as HTMLElement).offsetHeight > nav.scrollTop + nav.clientHeight - 20) {
        nav.scrollTop = Math.max(0, top - nav.clientHeight / 2);
      }
    }
  }, []);

  useEffect(() => {
    const guide = panel.current?.closest('.ghost-wires-guide');
    const hash = () => select(window.location.hash.slice(1) || 'step-0');
    hash();
    window.addEventListener('hashchange', hash);
    const click = (event: MouseEvent) => {
      const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href^="#"]') : null;
      if (!link) return;
      const id = link.hash.slice(1);
      select(id);
      if (!openRef.current) return;
      const target = document.getElementById(id);
      const heading = target?.matches('h1,h2,h3,h4')
        ? target
        : (target?.querySelector<HTMLElement>('h1,h2,h3,h4') ?? target);
      if (!heading) {
        close();
        return;
      }
      setOpen(false);
      if (!heading.hasAttribute('tabindex')) heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
    };
    const nav = panel.current;
    nav?.addEventListener('click', click);
    const visible = new Set<Element>();
    const observer =
      typeof IntersectionObserver === 'undefined'
        ? undefined
        : new IntersectionObserver(
            entries => {
              for (const entry of entries) {
                if (entry.isIntersecting) visible.add(entry.target);
                else visible.delete(entry.target);
              }
              const candidates = [...(guide?.querySelectorAll('section[id]') ?? [])].filter(el => visible.has(el));
              const current = candidates.at(-1);
              if (current) select(current.id);
            },
            { rootMargin: '-20% 0px -70% 0px' },
          );
    for (const section of guide?.querySelectorAll('section[id]') ?? []) {
      observer?.observe(section);
    }
    return () => {
      window.removeEventListener('hashchange', hash);
      nav?.removeEventListener('click', click);
      observer?.disconnect();
    };
  }, [close, select]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const links = [...(panel.current?.querySelectorAll<HTMLAnchorElement>('a') ?? [])];
    links[0]?.focus();
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
      if (event.key !== 'Tab') return;
      const first = links[0];
      const last = links.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    const resize = () => {
      if (window.innerWidth > 1024) close();
    };
    const header = (event: PointerEvent) => {
      if (!(event.target instanceof Element) || !event.target.closest('.docs-header')) return;
      if (panel.current?.contains(document.activeElement)) toggle.current?.focus();
      setOpen(false);
    };
    document.addEventListener('keydown', key);
    window.addEventListener('resize', resize);
    document.addEventListener('pointerdown', header);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener('keydown', key);
      window.removeEventListener('resize', resize);
      document.removeEventListener('pointerdown', header);
    };
  }, [open, close]);

  return (
    <>
      <aside className={`sidebar${open ? ' open' : ''}`} id="sidebar" aria-label="目次" ref={panel}>
        {children}
      </aside>
      <div className={`backdrop${open ? ' show' : ''}`} id="backdrop" onClick={close} />
      <button
        className="menu-btn"
        id="menuBtn"
        type="button"
        aria-label={open ? '目次を閉じる' : '目次を開く'}
        aria-expanded={open}
        aria-controls="sidebar"
        ref={toggle}
        onClick={() => setOpen(value => !value)}
      >
        <GuideIcon name={open ? 'ti-x' : 'ti-menu-2'} className={open ? 'ti ti-x' : 'ti ti-menu-2'} />
      </button>
    </>
  );
}
