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

test('mobile TOC opens via #menuBtn, swaps ti-menu-2/ti-x icon, traps focus, closes by Escape and restores scroll', async () => {
  const v = await setup();
  const btn = v.container.querySelector<HTMLButtonElement>('#menuBtn');
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
  expect(links).toHaveLength(18);
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

test('hash navigation activates the corresponding step link', async () => {
  const v = await setup();
  for(const id of ['step-10','step-5']) {
    await act(async () => {window.history.replaceState(null, '', '#'+id); window.dispatchEvent(new HashChangeEvent('hashchange'));});
    expect(v.container.querySelector('a[href="#'+id+'"]')).toHaveAttribute('aria-current','location');
    expect(v.container.querySelectorAll('nav a.active')).toHaveLength(1);
  }
});

test('selecting a topic from the open mobile drawer closes the drawer and focuses its heading', async () => {
  const v = await setup();
  await click(v.container.querySelector('#menuBtn'));
  await click(v.container.querySelector('a[href="#step-3"]'));
  expect(v.container.querySelector('#menuBtn')).toHaveAttribute('aria-expanded', 'false');
  expect(v.container.querySelector('a[href="#step-3"]')).toHaveClass('active');
  const target = v.container.querySelector('#step-3 h2') ?? v.container.querySelector('#step-3');
  expect(document.activeElement).toBe(target);
});

test('backdrop and desktop resize close the drawer', async () => {
  const v = await setup();
  const btn = v.container.querySelector('#menuBtn');
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
  const step-0 = v.container.querySelector('section#step-0');
  const step-4 = v.container.querySelector('section#step-4');
  notify([
    [step-0, true],
    [step-4, true],
  ]);
  const g4 = v.container.querySelector('a[href="#step-4"]')!;
  const g1 = v.container.querySelector('a[href="#step-0"]')!;
  expect(g4).toHaveClass('active');
  expect(v.container.querySelector('a[href="#step-4"]')).toHaveAttribute('aria-current', 'location');
  notify([[step-4, false]]);
  expect(g1).toHaveClass('active');
  expect(g4).not.toHaveClass('active');
  expect(v.container.querySelector('a[href="#step-0"]')).toHaveAttribute('aria-current', 'location');
});

test('pointerdown on the shared header closes the drawer and returns focus, other areas keep it open', async () => {
  const v = await setup();
  const header = document.body.appendChild(document.createElement('header'));
  header.className = 'docs-header';
  const inner = header.appendChild(document.createElement('button'));
  try {
    const btn = v.container.querySelector('#menuBtn');
    await click(btn);
    await act(async () => {
      document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    });
    expect(btn).toHaveAttribute('aria-expanded', 'true');
    await act(async () => {
      inner.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    });
    expect(btn).toHaveAttribute('aria-expanded', 'false');
    expect(document.activeElement?.id).toBe('menuBtn');
  } finally {
    header.remove();
  }
});
