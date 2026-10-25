import { afterEach, expect, test } from 'bun:test';
import { act, cleanup, render } from '@testing-library/react';
import { createElement } from 'react';
import { evaluatedPage, renderedPage } from './fidelity-helpers';

afterEach(cleanup);

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

test('both exercise answer disclosures in chapter 15 toggle independently and preserve answer content', async () => {
  const v = await setup();
  const answers = [...v.container.querySelectorAll<HTMLDetailsElement>('#ch15 details')];
  expect(answers).toHaveLength(2);
  for (const answer of answers) {
    expect(answer.open).toBe(false);
    expect(answer.querySelector('summary')?.textContent).toBe('解答の目安');
    expect(answer.querySelector('.details-body p')).not.toBeNull();
    await act(async () => {
      answer.querySelector('summary')!.click();
    });
    expect(answer.open).toBe(true);
    await act(async () => {
      answer.querySelector('summary')!.click();
    });
    expect(answer.open).toBe(false);
  }
});

test('all 17 chapter badges, 17 sidebar numbers and 22 reference numbers remain ordered and external links use safe rel', async () => {
  const page = await renderedPage();
  expect([...page.querySelectorAll('h2 .num')].map(e => e.textContent)).toEqual(
    Array.from({ length: 17 }, (_, i) => String(i + 1)),
  );
  expect([...page.querySelectorAll('.nav-link .n')].map(e => e.textContent)).toEqual(
    Array.from({ length: 17 }, (_, i) => String(i + 1)),
  );
  expect([...page.querySelectorAll('.ref-num')].map(e => e.textContent)).toEqual(
    Array.from({ length: 22 }, (_, i) => String(i + 1)),
  );
  const urls = [...page.querySelectorAll<HTMLAnchorElement>('.ref-url')];
  expect(urls).toHaveLength(22);
  for (const url of urls) {
    expect(url.getAttribute('target')).toBe('_blank');
    expect(url.getAttribute('rel')).toBe('noopener noreferrer');
  }
});
