import { afterEach, expect, test } from 'bun:test';
import { createElement } from 'react';
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
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
