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
  expect(v.container.querySelector('#backdrop')).toHaveClass('open');
  expect(document.body.style.overflow).toBe('hidden');
  const links = [...v.container.querySelectorAll<HTMLAnchorElement>('#sidebar a')];
  expect(links).toHaveLength(16);
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
  for(const id of ['step-9-開発qaの現場に落とし込む','step-4-最低限おぼえる用語']) {
    await act(async () => {window.history.replaceState(null, '', '#'+id); window.dispatchEvent(new HashChangeEvent('hashchange'));});
    expect(v.container.querySelector('a[href="#'+id+'"]')).toHaveAttribute('aria-current','location');
    expect(v.container.querySelectorAll('nav a.active')).toHaveLength(1);
  }
});

test('selecting a topic from the open mobile drawer closes the drawer and focuses its heading', async () => {
  const v = await setup();
  await click(v.container.querySelector('#menuBtn'));
  await click(v.container.querySelector('a[href="#step-2-2011年版から2024年版への変更点"]'));
  expect(v.container.querySelector('#menuBtn')).toHaveAttribute('aria-expanded', 'false');
  expect(v.container.querySelector('a[href="#step-2-2011年版から2024年版への変更点"]')).toHaveClass('active');
  const target = v.container.querySelector('#step-2-2011年版から2024年版への変更点 h2') ?? v.container.querySelector('#step-2-2011年版から2024年版への変更点');
  expect(document.activeElement).toBe(target);
});

test('selecting a drawer link without a matching target closes the drawer and returns focus to the toggle', async () => {
  const v = await setup();
  const btn = v.container.querySelector('#menuBtn');
  const orphan = document.createElement('a');
  orphan.href = '#missing-target';
  v.container.querySelector('#sidebar nav')!.appendChild(orphan);
  await click(btn);
  await click(orphan);
  expect(btn).toHaveAttribute('aria-expanded', 'false');
  expect(document.activeElement?.id).toBe('menuBtn');
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
  const step0 = v.container.querySelector('section[id="0-このガイドの読み方"]');
  const step4 = v.container.querySelector('section#step-3-規格の全体像6つの構成要素');
  notify([
    [step0, true],
    [step4, true],
  ]);
  const g4 = v.container.querySelector('a[href="#step-3-規格の全体像6つの構成要素"]')!;
  const g1 = v.container.querySelector('a[href="#0-このガイドの読み方"]')!;
  expect(g4).toHaveClass('active');
  expect(v.container.querySelector('a[href="#step-3-規格の全体像6つの構成要素"]')).toHaveAttribute('aria-current', 'location');
  notify([[step4, false]]);
  expect(g1).toHaveClass('active');
  expect(g4).not.toHaveClass('active');
  expect(v.container.querySelector('a[href="#0-このガイドの読み方"]')).toHaveAttribute('aria-current', 'location');
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

test('scroll tracking keeps the active step visible in the scrolling nav itself', async () => {
  const {v,notify}=await observed();
  const panel=v.container.querySelector<HTMLElement>('#sidebar nav')!;
  const link=v.container.querySelector<HTMLElement>('nav a[href="#step-11-導入ロードマップ"]')!;
  Object.defineProperty(panel,'clientHeight',{configurable:true,value:500});
  Object.defineProperty(link,'offsetTop',{configurable:true,value:1200});
  notify([[v.container.querySelector('section#step-11-導入ロードマップ'),true]]);
  expect(panel.scrollTop).toBeGreaterThan(0);
  expect(link).toHaveAttribute('aria-current','location');
  expect(v.container.querySelector('#sidebar')!.scrollTop).toBe(0);
});

test('malformed URL fragments on load, hashchange and TOC links do not throw', async () => {
  const errors: unknown[] = [];
  const onError = (event: ErrorEvent) => errors.push(event.error ?? event.message);
  window.addEventListener('error', onError);
  try {
    window.history.replaceState(null, '', '#%E0%A4%A');
    const v = await setup();
    const bad = document.createElement('a');
    bad.href = '#%E0%A4%A';
    v.container.querySelector('nav')!.appendChild(bad);
    const id = 'step-4-最低限おぼえる用語';
    await act(async () => {window.history.replaceState(null, '', '#'+id); window.dispatchEvent(new HashChangeEvent('hashchange'));});
    expect(v.container.querySelector('a[href="#'+id+'"]')).toHaveAttribute('aria-current','location');
    await act(async () => {window.history.replaceState(null, '', '#%E0%A4%A'); window.dispatchEvent(new HashChangeEvent('hashchange'));});
    await click(bad);
    expect(errors).toEqual([]);
  } finally {
    window.removeEventListener('error', onError);
  }
});
