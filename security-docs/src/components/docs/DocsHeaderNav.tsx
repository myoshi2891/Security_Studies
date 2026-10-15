'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';
import { Menu, ChevronDown, Search, X } from 'lucide-react';
import { clsx } from 'clsx';
import { docsConfig } from '@/config/docs';
import './DocsHeaderNav.css';

const normalize = (value: string) => value.normalize('NFKC').toLocaleLowerCase('ja');

/** Shared guide navigation: registration alone updates both home and document headers. */
export function DocsHeaderNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const panelId = useId();
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const filter = useRef<HTMLInputElement>(null);
  const term = normalize(query.trim());
  const sections = docsConfig.sidebarNav.map(section => ({
    ...section,
    items: section.items.filter(item => normalize(`${section.title} ${item.title}`).includes(term)),
  })).filter(section => section.items.length > 0);
  const total = docsConfig.sidebarNav.reduce((sum, section) => sum + section.items.length, 0);
  const matches = sections.reduce((sum, section) => sum + section.items.length, 0);

  useEffect(() => {
    if (!open) return;
    filter.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setOpen(false); button.current?.focus(); }
    };
    const onPointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [open]);

  return (
    <div className="docs-header-nav" ref={root}>
      <button ref={button} type="button" className="docs-nav-toggle" aria-expanded={open} aria-controls={panelId} onClick={() => { setQuery(''); setOpen(value => !value); }}>
        <Menu aria-hidden="true" size={18} />
        <span className="docs-nav-label-full">ガイド一覧</span>
        <span className="docs-nav-label-short">ガイド</span>
        <span className="docs-nav-total" aria-hidden="true">{total}</span>
        <ChevronDown className="docs-nav-chevron" aria-hidden="true" size={14} />
      </button>
      <nav id={panelId} className="docs-global-navigation" aria-label="グローバルナビゲーション" hidden={!open}>
        <div className="docs-nav-toolbar">
          <div className="docs-nav-filter">
            <Search size={18} aria-hidden="true" />
            <input ref={filter} type="search" aria-label="ガイドを絞り込む" placeholder="ガイド名・カテゴリで絞り込み" value={query} onChange={event => setQuery(event.target.value)} />
            {query && <button type="button" aria-label="絞り込みを解除" onClick={() => { setQuery(''); filter.current?.focus(); }}><X size={16} aria-hidden="true" /></button>}
          </div>
          <span className="docs-nav-results" role="status" aria-live="polite">{matches}件</span>
        </div>
        <div className="docs-nav-groups">
          {sections.map(section => (
            <div key={section.title} className="docs-nav-category">
              <h4><span>{section.title}</span><span aria-hidden="true">{section.items.length}</span></h4>
              <ul>
                {section.items.map(item => {
                  const active = pathname === item.href || (pathname ?? '').startsWith(`${item.href}/`);
                  return <li key={item.href}><Link href={item.href} aria-current={active ? 'page' : undefined} className={clsx('docs-nav-link', active && 'font-medium')} onClick={() => setOpen(false)}>{item.title}</Link></li>;
                })}
              </ul>
            </div>
          ))}
          {matches === 0 && <p className="docs-nav-empty">該当するガイドがありません</p>}
        </div>
      </nav>
    </div>
  );
}
