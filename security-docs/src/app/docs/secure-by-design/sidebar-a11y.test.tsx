import { afterEach, describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createElement } from 'react';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { Window } from 'happy-dom';
import { GuideSidebar } from './GuideSidebar';
import { toc } from './toc';

afterEach(() => { cleanup(); });

describe('Secure by Design drawer accessibility', () => {
  test('closes on shared header pointer input, keeps native focus for focusable targets and restores burger focus otherwise', () => {
    // Arrange
    const { container, getByRole } = render(createElement('div', null,
      createElement('header', { className: 'docs-header' }, createElement('span', { className: 'plain' }, 'Security Studies'), createElement('a', { href: '/docs' }, 'Docs')),
      createElement('div', { className: 'secure-by-design-guide' }, createElement(GuideSidebar, { items: toc }))));
    const button = getByRole('button', { name: '目次を開く' });
    // Act / Assert: ヘッダー外は無視
    fireEvent.click(button);
    fireEvent.pointerDown(document.body);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    // フォーカス可能なヘッダー要素はブラウザー既定のフォーカス移動に任せる
    fireEvent.pointerDown(container.querySelector('header a')!);
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(document.activeElement === button, 'focus moved to button').toBe(false);
    // フォーカス不可の要素では burger へ戻す
    fireEvent.click(button);
    fireEvent.pointerDown(container.querySelector('header .plain')!);
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(document.activeElement === button, 'focus target').toBe(true);
  });

  test('removes the closed drawer from the tablet tab order and restores it only while open', async () => {
    const css = readFileSync(resolve(import.meta.dir, 'secure-by-design.css'), 'utf8');
    const cases = [[1440, false, 'visible'], [900, false, 'hidden'], [900, true, 'visible'], [375, false, 'hidden'], [375, true, 'visible']] as const;
    for (const [width, open, expected] of cases) {
      const isolated = new Window({ settings: { disableJavaScriptEvaluation: true, disableCSSFileLoading: true } });
      try {
        isolated.happyDOM.setWindowSize({ width, height: 900 });
        isolated.document.head.innerHTML = `<style>${css}</style>`;
        isolated.document.body.innerHTML = `<div class="secure-by-design-guide${open ? ' nav-open' : ''}"><aside class="sidebar"><nav><a href="#sec-0">0</a></nav></aside></div>`;
        expect(isolated.getComputedStyle(isolated.document.querySelector('.sidebar')!).visibility === 'hidden', `${width}px open=${open}`).toBe(expected === 'hidden');
      } finally { await isolated.happyDOM.close(); }
    }
  });
});
