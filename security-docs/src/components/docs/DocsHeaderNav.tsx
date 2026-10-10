'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';
import { Menu, ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';
import { docsConfig } from '@/config/docs';

/** The complete document navigation lives in the shared header, on every screen size. */
export function DocsHeaderNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
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
      <button ref={button} type="button" className="docs-nav-toggle" aria-label="ドキュメントメニュー" aria-expanded={open} aria-controls={panelId} onClick={() => setOpen(value => !value)}>
        <Menu aria-hidden="true" size={18} /><span>ドキュメント</span><ChevronDown aria-hidden="true" size={14} />
      </button>
      <nav id={panelId} className="docs-global-navigation" aria-label="グローバルナビゲーション" hidden={!open}>
        {docsConfig.sidebarNav.map(section => (
          <div key={section.title} className="docs-nav-category">
            <h4>{section.title}</h4>
            <ul>
              {section.items.map(item => {
                const active = pathname === item.href || (pathname ?? '').startsWith(`${item.href}/`);
                return (
                  <li key={item.href}>
                    <Link href={item.href} aria-current={active ? 'page' : undefined} className={clsx('docs-nav-link', active && 'font-medium')} onClick={() => setOpen(false)}>{item.title}</Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </div>
  );
}
