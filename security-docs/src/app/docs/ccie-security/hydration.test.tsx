import { afterEach, describe, expect, spyOn, test } from 'bun:test';
import { cleanup, render } from '@testing-library/react';
import { act, Children, createElement, isValidElement, type ReactElement, type ReactNode } from 'react';
import { hydrateRoot, type Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { evaluatedPage } from './fidelity-helpers';

afterEach(cleanup);

function nativeElements(root: ReactNode, tags: Set<string>): ReactElement<{ children?: ReactNode }>[] {
  const elements: ReactElement<{ children?: ReactNode }>[] = [];
  Children.forEach(root, node => {
    if (!isValidElement<{ children?: ReactNode }>(node)) return;
    if (typeof node.type === 'string' && tags.has(node.type)) elements.push(node);
    elements.push(...nativeElements(node.props.children, tags));
  });
  return elements;
}

describe('CCIE table hydration regression', () => {
  test('all 85 tables have no direct text children in table, thead, tbody, tfoot, tr or colgroup before browser parsing', async () => {
    const { default: Page } = await evaluatedPage();
    const tree = Page({});
    expect(nativeElements(tree, new Set(['table']))).toHaveLength(85);
    const violations: string[] = [];
    for (const el of nativeElements(tree, new Set(['table', 'thead', 'tbody', 'tfoot', 'tr', 'colgroup']))) {
      Children.forEach(el.props.children, child => {
        if (typeof child === 'string' || typeof child === 'number') violations.push(`${String(el.type)}:${JSON.stringify(child)}`);
      });
    }
    expect(violations).toEqual([]);
  });

  test('React client rendering of the real 85 tables emits no whitespace or nesting warning', async () => {
    const { default: Page } = await evaluatedPage();
    const tables = nativeElements(Page({}), new Set(['table']));
    const messages: string[] = [];
    const error = spyOn(console, 'error').mockImplementation((...args: unknown[]) => { messages.push(args.map(String).join(' ')); });
    try {
      render(createElement('div', {}, tables.map((table, key) => createElement('div', { key }, table))));
      expect(messages.filter(message => /whitespace|hydration|cannot be a child|validateDOMNesting/i.test(message))).toEqual([]);
    } finally { error.mockRestore(); }
  });

  test('hydrating the server-rendered 85 tables reports no recoverable errors', async () => {
    const { default: Page } = await evaluatedPage();
    const tables = nativeElements(Page({}), new Set(['table']));
    const tree = createElement('div', {}, tables.map((table, key) => createElement('div', { key }, table)));
    const container = document.createElement('div');
    container.innerHTML = renderToString(tree);
    document.body.appendChild(container);
    const recoverable: unknown[] = [];
    let root: Root | undefined;
    try {
      await act(async () => {
        root = hydrateRoot(container, tree, { onRecoverableError: error => { recoverable.push(error); } });
      });
      expect(recoverable).toEqual([]);
    } finally {
      await act(async () => { root?.unmount(); });
      container.remove();
    }
  });
});
