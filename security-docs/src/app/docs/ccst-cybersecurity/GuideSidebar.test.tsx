import { afterEach, expect, test } from 'bun:test';
import { createElement } from 'react';
import { act, cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { GuideSidebar } from './GuideSidebar';
import { toc } from './toc';
afterEach(() => { cleanup(); window.location.hash = ''; });
const fixture = () => render(createElement('div', { className: 'ccst-guide' }, createElement(GuideSidebar, { groups: toc })));
test('selects chapter, reference and subsection hashes without inventing targets', async () => {
  window.location.hash = '#s3-6'; const { container } = fixture();
  await waitFor(() => expect(container.querySelector('a[href="#s3-6"]')).toHaveAttribute('aria-current', 'location'));
  window.location.hash = '#ref-e'; fireEvent(window, new Event('hashchange'));
  expect(container.querySelector('a[href="#ref-e"]')).toHaveAttribute('aria-current', 'location');
});
test('closes via backdrop, TOC selection and resize above the original 1000px breakpoint', () => {
  const { getByRole, container } = fixture(); const button = getByRole('button', { name: '目次を開く' });
  fireEvent.click(button); fireEvent.click(getByRole('button', { name: '目次を閉じる背景' })); expect(button).toHaveAttribute('aria-expanded', 'false');
  fireEvent.click(button); fireEvent.click(container.querySelector('a[href="#s0"]')!); expect(button).toHaveAttribute('aria-expanded', 'false');
  const original = Object.getOwnPropertyDescriptor(window, 'innerWidth')!;
  fireEvent.click(button); Object.defineProperty(window, 'innerWidth', { value: 1001, configurable: true, writable: true }); fireEvent(window, new Event('resize'));
  expect(button).toHaveAttribute('aria-expanded', 'false'); Object.defineProperty(window, 'innerWidth', original);
});
test('restores body scroll on unmount and preserves an existing scroll lock', () => {
  document.body.style.overflow = 'clip'; const { getByRole, unmount } = fixture();
  fireEvent.click(getByRole('button', { name: '目次を開く' })); expect(document.body.style.overflow).toBe('hidden');
  unmount(); expect(document.body.style.overflow).toBe('clip'); document.body.style.overflow = '';
});
test('shared header pointer input closes the drawer while retaining header focus', () => {
  const { container, getByRole } = render(createElement('div', null, createElement('header', { className: 'docs-header' }, createElement('button', null, '検索')), createElement('div', { className: 'ccst-guide' }, createElement(GuideSidebar, { groups: toc }))));
  const button = getByRole('button', { name: '目次を開く' }); fireEvent.click(button);
  const search = getByRole('button', { name: '検索' }); search.focus(); fireEvent.pointerDown(search);
  expect(button).toHaveAttribute('aria-expanded', 'false'); expect(document.activeElement === search).toBe(true);
  expect(container.querySelector('.ccst-guide')).not.toHaveClass('nav-open');
});
test('wraps Tab and Shift+Tab focus inside the open drawer and closes on Escape', () => {
  const { getByRole, container } = fixture(); const button = getByRole('button', { name: '目次を開く' }); fireEvent.click(button);
  const links = [...container.querySelectorAll<HTMLAnchorElement>('nav a')]; const first = links[0], last = links.at(-1)!;
  expect(document.activeElement === first).toBe(true);
  fireEvent.keyDown(document, { key: 'Tab', shiftKey: true }); expect(document.activeElement === last).toBe(true);
  fireEvent.keyDown(document, { key: 'Tab' }); expect(document.activeElement === first).toBe(true);
  links[1].focus(); fireEvent.keyDown(document, { key: 'Tab' }); fireEvent.keyDown(document, { key: 'Enter' }); expect(document.activeElement === links[1]).toBe(true);
  fireEvent.keyDown(document, { key: 'Escape' }); expect(button).toHaveAttribute('aria-expanded', 'false'); expect(document.activeElement === button).toBe(true);
});
test('scroll tracking selects the topmost intersecting known section and disconnects on unmount', async () => {
  const original = globalThis.IntersectionObserver; const observed: Element[] = []; let disconnected = false;
  let notify: (entries: { isIntersecting: boolean; boundingClientRect: { top: number }; target: Element }[]) => void = () => {};
  globalThis.IntersectionObserver = class { constructor(callback: typeof notify) { notify = callback; } observe(target: Element) { observed.push(target); } disconnect() { disconnected = true; } } as unknown as typeof IntersectionObserver;
  try {
    const { container, unmount } = render(createElement('div', { className: 'ccst-guide' }, createElement(GuideSidebar, { groups: toc }), createElement('section', { id: 's0' }), createElement('section', { id: 's3-6' }), createElement('section', { id: 'unknown' })));
    const [s0, s36] = ['s0', 's3-6'].map(id => container.querySelector(`[id="${id}"]`)!);
    expect(observed).toEqual([s0, s36]);
    act(() => notify([{ isIntersecting: true, boundingClientRect: { top: 300 }, target: s0 }, { isIntersecting: true, boundingClientRect: { top: 120 }, target: s36 }, { isIntersecting: false, boundingClientRect: { top: 0 }, target: s0 }]));
    await waitFor(() => expect(container.querySelector('a[href="#s3-6"]')).toHaveAttribute('aria-current', 'location'));
    act(() => notify([{ isIntersecting: false, boundingClientRect: { top: 0 }, target: s0 }]));
    expect(container.querySelector('a[href="#s3-6"]')).toHaveAttribute('aria-current', 'location');
    unmount(); expect(disconnected).toBe(true);
  } finally { globalThis.IntersectionObserver = original; }
});
test('keeps intersecting sections across separate observer notifications when choosing the topmost', async () => {
  const original = globalThis.IntersectionObserver;
  let notify: (entries: { isIntersecting: boolean; boundingClientRect: { top: number }; target: Element }[]) => void = () => {};
  globalThis.IntersectionObserver = class { constructor(callback: typeof notify) { notify = callback; } observe() {} disconnect() {} } as unknown as typeof IntersectionObserver;
  try {
    const { container } = render(createElement('div', { className: 'ccst-guide' }, createElement(GuideSidebar, { groups: toc }), createElement('section', { id: 's0' }), createElement('section', { id: 's3-6' })));
    const [s0, s36] = ['s0', 's3-6'].map(id => container.querySelector(`[id="${id}"]`)!);
    act(() => notify([{ isIntersecting: true, boundingClientRect: { top: 100 }, target: s0 }]));
    await waitFor(() => expect(container.querySelector('a[href="#s0"]')).toHaveAttribute('aria-current', 'location'));
    // 別の通知で下側の節が交差しても、交差中の上側の節を選び続ける
    act(() => notify([{ isIntersecting: true, boundingClientRect: { top: 400 }, target: s36 }]));
    expect(container.querySelector('a[href="#s0"]')).toHaveAttribute('aria-current', 'location');
    // 上側の節が交差を外れたら、残る交差中の節へ移る
    act(() => notify([{ isIntersecting: false, boundingClientRect: { top: -50 }, target: s0 }]));
    await waitFor(() => expect(container.querySelector('a[href="#s3-6"]')).toHaveAttribute('aria-current', 'location'));
  } finally { globalThis.IntersectionObserver = original; }
});
