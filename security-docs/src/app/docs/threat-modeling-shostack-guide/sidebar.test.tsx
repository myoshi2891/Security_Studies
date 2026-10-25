import { afterEach, expect, test } from 'bun:test';
import { act, cleanup, render } from '@testing-library/react';
import { createElement } from 'react';
import { evaluatedPage } from './fidelity-helpers';

afterEach(() => {
  cleanup();
  window.history.replaceState(null, '', '/');
});

async function setup() {
  const saved = globalThis.IntersectionObserver;
  globalThis.IntersectionObserver = class {
    observe() {}
    disconnect() {}
  } as unknown as typeof IntersectionObserver;
  try {
    const { default: Page } = await evaluatedPage();
    return render(createElement(Page, {}));
  } finally {
    globalThis.IntersectionObserver = saved;
  }
}

const click = async (e: Element | null) => {
  expect(e).not.toBeNull();
  await act(async () => {
    (e as HTMLElement).click();
  });
};

test('mobile TOC opens via #navToggle, swaps ti-menu-2/ti-x icon, traps focus, closes by Escape and restores scroll', async () => {
  const v = await setup();
  const btn = v.container.querySelector<HTMLButtonElement>('#navToggle');
  const before = document.body.style.overflow;
  expect(btn).toHaveAttribute('aria-expanded', 'false');
  expect(btn).toHaveAttribute('aria-label', '目次を開く');
  expect(btn?.querySelector('i.ti-menu-2')).not.toBeNull();
  await click(btn);
  expect(btn).toHaveAttribute('aria-expanded', 'true');
  expect(btn).toHaveAttribute('aria-label', '目次を閉じる');
  expect(btn?.querySelector('i.ti-x')).not.toBeNull();
  expect(v.container.querySelector('#sidebar')).toHaveClass('open');
  expect(v.container.querySelector('#backdrop')).toHaveClass('show');
  expect(document.body.style.overflow).toBe('hidden');
  const links = [...v.container.querySelectorAll<HTMLAnchorElement>('#sidebar a')];
  expect(links).toHaveLength(77);
  links.at(-1)!.focus();
  await act(async () => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
  });
  expect(document.activeElement).toBe(links[0]);
  await act(async () => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true }));
  });
  expect(document.activeElement).toBe(links.at(-1)!);
  await act(async () => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  });
  expect(btn).toHaveAttribute('aria-expanded', 'false');
  expect(btn).toHaveAttribute('aria-label', '目次を開く');
  expect(btn?.querySelector('i.ti-menu-2')).not.toBeNull();
  expect(document.activeElement).toBe(btn);
  expect(document.body.style.overflow).toBe(before);
});

test('hash navigation activates the matching nav-group for both chapter and sub-chapter anchors', async () => {
  const v = await setup();
  await act(async () => {
    window.history.replaceState(null, '', '#ch10');
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  });
  const group10 = v.container.querySelector('.nav-group[data-target="ch10"]')!;
  const link10 = v.container.querySelector('a[href="#ch10"]')!;
  expect(group10).toHaveClass('active');
  expect(link10).toHaveAttribute('aria-current', 'location');

  await act(async () => {
    window.history.replaceState(null, '', '#ch5-2');
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  });
  const group5 = v.container.querySelector('.nav-group[data-target="ch5"]')!;
  const sub52 = v.container.querySelector('a[href="#ch5-2"]')!;
  expect(group5).toHaveClass('active');
  expect(group10).not.toHaveClass('active');
  expect(sub52).toHaveAttribute('aria-current', 'location');
});

test('selecting a topic from the open mobile drawer closes the drawer and focuses its heading', async () => {
  const v = await setup();
  await click(v.container.querySelector('#navToggle'));
  await click(v.container.querySelector('a[href="#ch3"]'));
  expect(v.container.querySelector('#navToggle')).toHaveAttribute('aria-expanded', 'false');
  expect(v.container.querySelector('.nav-group[data-target="ch3"]')).toHaveClass('active');
  const target = v.container.querySelector('#ch3 h2') ?? v.container.querySelector('#ch3');
  expect(document.activeElement).toBe(target);
});

test('backdrop and desktop resize close the drawer', async () => {
  const v = await setup();
  const btn = v.container.querySelector('#navToggle');
  await click(btn);
  await click(v.container.querySelector('#backdrop'));
  expect(btn).toHaveAttribute('aria-expanded', 'false');
  await click(btn);
  const descriptor = Object.getOwnPropertyDescriptor(window, 'innerWidth');
  Object.defineProperty(window, 'innerWidth', { configurable: true, writable: true, value: 1440 });
  try {
    await act(async () => {
      window.dispatchEvent(new Event('resize'));
    });
    expect(btn).toHaveAttribute('aria-expanded', 'false');
  } finally {
    if (descriptor) Object.defineProperty(window, 'innerWidth', descriptor);
    else Reflect.deleteProperty(window, 'innerWidth');
    expect(Object.getOwnPropertyDescriptor(window, 'innerWidth')).toEqual(descriptor);
  }
});

async function observed() {
  const callbacks = new Map<Element, IntersectionObserverCallback>();
  const saved = globalThis.IntersectionObserver;
  globalThis.IntersectionObserver = class {
    cb: IntersectionObserverCallback;
    constructor(cb: IntersectionObserverCallback) {
      this.cb = cb;
    }
    observe(t: Element) {
      callbacks.set(t, this.cb);
    }
    disconnect() {}
  } as unknown as typeof IntersectionObserver;
  try {
    const { default: Page } = await evaluatedPage();
    const v = render(createElement(Page, {}));
    const notify = (entries: [Element | null, boolean][]) => {
      const cb = entries[0][0] ? callbacks.get(entries[0][0]) : undefined;
      expect(cb).toBeDefined();
      act(() => {
        cb?.(
          entries.map(([target, isIntersecting]) => ({ target, isIntersecting }) as IntersectionObserverEntry),
          {} as IntersectionObserver,
        );
      });
    };
    return { v, notify };
  } finally {
    globalThis.IntersectionObserver = saved;
  }
}

test('scroll spy highlights the active chapter nav-group and falls back when a later chapter leaves', async () => {
  const { v, notify } = await observed();
  const ch1 = v.container.querySelector('section#ch1');
  const ch4 = v.container.querySelector('section#ch4');
  notify([
    [ch1, true],
    [ch4, true],
  ]);
  const g4 = v.container.querySelector('.nav-group[data-target="ch4"]')!;
  const g1 = v.container.querySelector('.nav-group[data-target="ch1"]')!;
  expect(g4).toHaveClass('active');
  expect(v.container.querySelector('a[href="#ch4"]')).toHaveAttribute('aria-current', 'location');
  notify([[ch4, false]]);
  expect(g1).toHaveClass('active');
  expect(g4).not.toHaveClass('active');
  expect(v.container.querySelector('a[href="#ch1"]')).toHaveAttribute('aria-current', 'location');
});

test('pointerdown on the shared header closes the drawer and returns focus, other areas keep it open', async () => {
  const v = await setup();
  const header = document.body.appendChild(document.createElement('header'));
  header.className = 'docs-header';
  const inner = header.appendChild(document.createElement('button'));
  try {
    const btn = v.container.querySelector('#navToggle');
    await click(btn);
    await act(async () => {
      document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    });
    expect(btn).toHaveAttribute('aria-expanded', 'true');
    await act(async () => {
      inner.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    });
    expect(btn).toHaveAttribute('aria-expanded', 'false');
    expect(document.activeElement?.id).toBe('navToggle');
  } finally {
    header.remove();
  }
});
