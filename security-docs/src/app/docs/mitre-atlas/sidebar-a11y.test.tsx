import { afterEach, describe, expect, test } from 'bun:test';
import { createElement } from 'react';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { GuideSidebar } from './GuideSidebar';
import { toc } from './toc';

afterEach(() => { cleanup(); });

describe('MITRE ATLAS drawer accessibility', () => {
  test('returns drawer focus to the menu button on shared header pointer input but keeps focus already in the header', () => {
    // Arrange
    const { container, getByRole } = render(createElement('div', null,
      createElement('header', { className: 'docs-header' }, createElement('span', { className: 'plain' }, 'Security Studies'), createElement('button', { type: 'button' }, '検索')),
      createElement('div', { className: 'atlas-guide' }, createElement(GuideSidebar, { groups: toc }))));
    const button = getByRole('button', { name: '目次を開く' });
    // Act / Assert: ドロワー内にフォーカスがあれば menu ボタンへ戻す
    fireEvent.click(button);
    expect(document.activeElement === container.querySelector('nav a'), 'focus target').toBe(true);
    fireEvent.pointerDown(container.querySelector('header .plain')!);
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(document.activeElement === button, 'focus target').toBe(true);
    // ヘッダー内に既にフォーカスがあれば維持する
    fireEvent.click(button);
    const search = getByRole('button', { name: '検索' });
    search.focus();
    fireEvent.pointerDown(search);
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(document.activeElement === search, 'focus target').toBe(true);
  });
});
