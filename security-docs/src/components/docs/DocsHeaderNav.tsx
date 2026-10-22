'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';
import { Menu, ChevronDown, Search, X, FileCheck2 } from 'lucide-react';
import { clsx } from 'clsx';
import { docsConfig } from '@/config/docs';
import './DocsHeaderNav.css';

const normalize = (value: string) => value.normalize('NFKC').toLocaleLowerCase('ja');

/** Shared guide navigation: registration alone updates both home and document headers. */
export function DocsHeaderNav() {
  const pathname = usePathname();
  const [scope, setScope] = useState<'all' | 'iso' | null>(null);
  const open = scope !== null;
  const [query, setQuery] = useState('');
  const panelId = useId();
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const isoButton = useRef<HTMLButtonElement>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const filter = useRef<HTMLInputElement>(null);
  const term = normalize(query.trim());
  const sections = docsConfig.sidebarNav.filter(section => scope !== 'iso' || section.id === 'iso').map(section => ({
    ...section,
    items: section.items.filter(item => normalize(`${section.title} ${section.label} ${item.title}`).includes(term)),
  })).filter(section => section.items.length > 0);
  const total = docsConfig.sidebarNav.reduce((sum, section) => sum + section.items.length, 0);
  const matches = sections.reduce((sum, section) => sum + section.items.length, 0);

  useEffect(() => {
    if (!open) return;
    filter.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setScope(null); trigger.current?.focus(); }
    };
    const onPointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) setScope(null);
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [open, scope]);

  const toggle = (next: 'all' | 'iso') => {
    trigger.current = next === 'iso' ? isoButton.current : button.current;
    setQuery('');
    setScope(value => value === next ? null : next);
  };

  return (
    <div className="docs-header-nav" ref={root}>
      <button ref={button} type="button" className="docs-nav-toggle" aria-expanded={scope === 'all'} aria-controls={panelId} onClick={() => toggle('all')}>
        <Menu aria-hidden="true" size={18} />
        <span className="docs-nav-label-full">ガイド一覧</span>
        <span className="docs-nav-label-short">ガイド</span>
        <span className="docs-nav-total" aria-hidden="true">{total}</span>
        <ChevronDown className="docs-nav-chevron" aria-hidden="true" size={14} />
      </button>
      <button ref={isoButton} type="button" className="docs-nav-toggle docs-nav-iso" aria-expanded={scope === 'iso'} aria-controls={panelId} onClick={() => toggle('iso')}>
        <FileCheck2 size={18} aria-hidden="true" />
        <span className="docs-nav-label-full">ISO規格</span>
        <span className="docs-nav-label-short">ISO</span>
        <ChevronDown className="docs-nav-chevron" size={14} aria-hidden="true" />
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
            <div key={section.id} className="docs-nav-category">
              <h4><span>{section.label} <small>{section.title}</small></span><span aria-hidden="true">{section.items.length}</span></h4>
              <ul>
                {section.items.map(item => {
                  const active = pathname === item.href || (pathname ?? '').startsWith(`${item.href}/`);
                  return <li key={item.href}><Link href={item.href} aria-current={active ? 'page' : undefined} className={clsx('docs-nav-link', active && 'font-medium')} onClick={() => setScope(null)}>{item.title}</Link></li>;
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
