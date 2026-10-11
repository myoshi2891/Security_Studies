import { afterEach, describe, expect, mock, test } from 'bun:test';
import { act, cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { createElement } from 'react';
import { readFileSync } from 'node:fs';
import postcss from 'postcss';
import { renderedPage, sourceDocument } from './fidelity-helpers';

afterEach(() => {
  cleanup();
  window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
});
const items = [...sourceDocument.querySelectorAll('aside nav > ul > li')].map(li => {
  const link = li.querySelector('a')!;
  return { id: link.getAttribute('href')!.slice(1), title: link.textContent!, children: [...li.querySelectorAll('ul.sub a')].map(a => ({ id: a.getAttribute('href')!.slice(1), title: a.textContent! })) };
});
const load = () => import(new URL('./GuideSidebar.tsx', import.meta.url).href);

describe('CCIE original sidebar and full-width layout', () => {
  test('the actual MDX includes the original left sidebar and a separate full-width content region', async () => {
    const page = await renderedPage();
    expect(page.querySelector('.ccie-guide > .guide-main')).not.toBeNull();
    expect(page.querySelector('aside.sidebar .brand-title')).toHaveTextContent('CCIE Security');
    expect(page.querySelector('aside.sidebar .brand-sub')).toHaveTextContent('初学者向け学習ガイド');
    expect(page.querySelector('details.guide-toc')).toBeNull();
  });

  test('preserves every original chapter and subsection link inside the sidebar', async () => {
    const { GuideSidebar } = await load();
    const { container } = render(createElement(GuideSidebar, { items }));
    expect([...container.querySelectorAll('aside nav a')].map(a => [a.textContent, a.getAttribute('href')])).toEqual([...sourceDocument.querySelectorAll('aside nav a')].map(a => [a.textContent, a.getAttribute('href')]));
  });

  test('chapter selection opens its subsections and marks the current chapter', async () => {
    const { GuideSidebar } = await load();
    const { container } = render(createElement(GuideSidebar, { items }));
    const link = container.querySelector<HTMLAnchorElement>('a[href="#s2"]')!;
    fireEvent.click(link);
    expect(link.closest('li')).toHaveClass('open');
    expect(link).toHaveAttribute('aria-current', 'location');
    expect(container.querySelector('a[href="#s1"]')!.closest('li')).not.toHaveClass('open');
  });

  test('scroll observation selects the subsection and disconnects on unmount', async () => {
    const previous = globalThis.IntersectionObserver;
    let callback!: IntersectionObserverCallback;
    const disconnect = mock(() => {});
    class Observer {
      constructor(cb: IntersectionObserverCallback) { callback = cb; }
      observe = mock(() => {});
      disconnect = disconnect;
    }
    globalThis.IntersectionObserver = Observer as unknown as typeof IntersectionObserver;
    try {
      const { GuideSidebar } = await load();
      const { container, unmount } = render(createElement('div', {}, createElement('section', { id: 's2' }, createElement('h3', { id: 's2-1' }, '節')), createElement(GuideSidebar, { items })));
      await waitFor(() => expect(callback).toBeDefined());
      const target = document.getElementById('s2-1')!;
      const rect = target.getBoundingClientRect();
      act(() => callback([{ isIntersecting: true, target, time: 0, intersectionRatio: 1, boundingClientRect: rect, intersectionRect: rect, rootBounds: null }], {} as IntersectionObserver));
      expect(container.querySelector('a[href="#s2-1"]')).toHaveAttribute('aria-current', 'location');
      expect(container.querySelector('a[href="#s2"]')!.closest('li')).toHaveClass('open');
      unmount();
      expect(disconnect).toHaveBeenCalledTimes(1);
    } finally { globalThis.IntersectionObserver = previous; }
  });

  test('mobile menu opens, Escape closes it and focus returns to its button', async () => {
    const { GuideSidebar } = await load();
    const { getByRole, container } = render(createElement(GuideSidebar, { items }));
    const button = getByRole('button', { name: '目次を開く' });
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(container.querySelector('aside.sidebar')).toHaveClass('open');
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(button).toHaveFocus();
  });

  test('backdrop and link selection close the mobile drawer', async () => {
    const { GuideSidebar } = await load();
    const { getByRole, container } = render(createElement(GuideSidebar, { items }));
    const button = getByRole('button', { name: '目次を開く' });
    fireEvent.click(button);
    fireEvent.click(getByRole('button', { name: '目次を閉じる背景' }));
    expect(button).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(button);
    fireEvent.click(container.querySelector('a[href="#s1-1"]')!);
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  test('desktop resizing closes a previously opened mobile drawer', async () => {
    const { GuideSidebar } = await load();
    const { getByRole } = render(createElement(GuideSidebar, { items }));
    const button = getByRole('button', { name: '目次を開く' });
    fireEvent.click(button);
    const previous = Object.getOwnPropertyDescriptor(window, 'innerWidth');
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1280 });
    try {
      fireEvent(window, new Event('resize'));
      expect(button).toHaveAttribute('aria-expanded', 'false');
    } finally {
      if (previous) Object.defineProperty(window, 'innerWidth', previous);
      else Reflect.deleteProperty(window, 'innerWidth');
    }
  });

  test('direct subsection URLs select and expand their original chapter', async () => {
    window.history.replaceState(null, '', '#s8-16');
    const { GuideSidebar } = await load();
    const { container } = render(createElement(GuideSidebar, { items }));
    await waitFor(() => expect(container.querySelector('a[href="#s8-16"]')).toHaveAttribute('aria-current', 'location'));
    expect(container.querySelector('a[href="#s8"]')!.closest('li')).toHaveClass('open');
  });

  test('Tab wraps focus within an opened mobile drawer', async () => {
    const { GuideSidebar } = await load();
    const { getByRole, container } = render(createElement(GuideSidebar, { items }));
    fireEvent.click(getByRole('button', { name: '目次を開く' }));
    const first = container.querySelector<HTMLAnchorElement>('a[href="#s1"]')!;
    const last = container.querySelector<HTMLAnchorElement>('a[href="#s13"]')!;
    last.focus();
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(first).toHaveFocus();
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(last).toHaveFocus();
  });

  test('CSS anchors the 288px sidebar to the viewport left and expands content to its remaining width', () => {
    const css = postcss.parse(readFileSync(new URL('./ccie-security.css', import.meta.url), 'utf8'));
    const declarations = (selector: string, mobile = false) => {
      const values: Record<string, string> = {};
      css.walkRules(selector, rule => {
        const inMedia = rule.parent?.type === 'atrule';
        if (inMedia !== mobile) return;
        rule.walkDecls(d => { values[d.prop] = d.value; });
      });
      return values;
    };
    expect(declarations('.ccie-guide.ccie-guide .sidebar')).toMatchObject({ position: 'fixed', left: '0', top: 'var(--docs-header-height)', width: 'var(--sidebar-w)', bottom: '0' });
    expect(declarations('.ccie-guide.ccie-guide .guide-main')).toMatchObject({ 'margin-left': 'var(--sidebar-w)', 'max-width': 'none', padding: '2.5rem 3rem 3rem' });
    expect(declarations('.ccie-guide.ccie-guide .guide-main', true)).toMatchObject({ 'margin-left': '0' });
    expect(declarations('.ccie-guide.ccie-guide')).toMatchObject({ padding: '0', 'border-radius': '0', width: '100%', 'max-width': 'none' });
    const layoutCss = readFileSync(new URL('../docs-layout.css', import.meta.url), 'utf8');
    expect(layoutCss).toMatch(/\.prose\.docs-article\s*\{[^}]*max-width:\s*none/s);
  });
});
