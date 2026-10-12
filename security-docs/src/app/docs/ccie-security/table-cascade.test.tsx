import { expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { Window } from 'happy-dom';
import postcss from 'postcss';
import { renderedPage } from './fidelity-helpers';

/** CSS engines may serialize the same color as hex or rgb; compare the actual channels. */
function normalizedColor(value: string) {
  const hex = value.match(/^#([\da-f]{6})$/i)?.[1];
  return hex ? `rgb(${[0, 2, 4].map(offset => parseInt(hex.slice(offset, offset + 2), 16)).join(', ')})` : value;
}

/** Preserve selector specificity while simulating hover, which happy-dom cannot synthesize. */
function combinedStyles() {
  const css = postcss.parse([
    readFileSync(new URL('../../globals.css', import.meta.url), 'utf8'),
    readFileSync(new URL('../docs-layout.css', import.meta.url), 'utf8'),
    readFileSync(new URL('./ccie-security.css', import.meta.url), 'utf8'),
  ].join('\n'));
  // Expand the real palette for color properties: happy-dom does not resolve all inherited
  // custom properties in the combined @import stylesheet. Selectors and media rules stay intact.
  const palette = new Map<string, string>();
  css.walkDecls(/^--/, declaration => { palette.set(declaration.prop, declaration.value); });
  css.walkDecls(declaration => {
    if (declaration.prop === 'color' || declaration.prop.startsWith('background')) declaration.value = declaration.value.replace(/var\((--[\w-]+)\)/g, (match, token: string) => palette.get(token) ?? match);
  });
  css.walkRules(rule => { rule.selector = rule.selector.replace(/:hover\b/g, '[data-css-hover]'); });
  return css.toString();
}

for (const mode of ['light', 'dark']) test(`all 85 CCIE tables retain their white cell background and readable text on hover in ${mode} mode`, async () => {
  const isolated = new Window({ settings: { disableJavaScriptEvaluation: true, disableCSSFileLoading: true, device: { prefersColorScheme: mode } } });
  try {
    isolated.document.body.innerHTML = `<article class="prose docs-article">${(await renderedPage()).querySelector('.ccie-guide')!.outerHTML}</article>`;
    const tables = isolated.document.querySelectorAll('.ccie-guide .table-wrap table');
    expect(tables).toHaveLength(85);
    for (const table of tables) table.querySelector('tr:has(td)')!.setAttribute('data-css-hover', '');
    // Mark hover before installing styles to avoid happy-dom's cached attribute-selector styles.
    isolated.document.head.innerHTML = `<style>${combinedStyles()}</style>`;
    const beforeText = isolated.getComputedStyle(isolated.document.querySelector('.ccie-guide')!).color;
    for (const table of tables) {
      const cell = table.querySelector('tr:has(td) td')!;
      expect(normalizedColor(isolated.getComputedStyle(cell).backgroundColor)).toBe('rgb(255, 255, 255)');
      expect(isolated.getComputedStyle(cell).color).toBe(beforeText);
      const header = table.querySelector('th');
      if (header) expect(normalizedColor(isolated.getComputedStyle(header).backgroundColor)).toBe('rgb(238, 241, 248)');
    }
    // The shared documentation hover style remains available outside the CCIE guide.
    const control = isolated.document.createElement('table');
    control.innerHTML = '<tbody><tr data-css-hover><td>Shared docs</td></tr></tbody>';
    isolated.document.querySelector('article')!.appendChild(control);
    expect(normalizedColor(isolated.getComputedStyle(control.querySelector('td')!).backgroundColor)).toBe(mode === 'dark' ? 'rgb(24, 24, 27)' : 'rgb(250, 250, 250)');
    expect(isolated.getComputedStyle(control).marginTop).toBe('40px');
    expect(isolated.getComputedStyle(control).marginBottom).toBe('40px');
  } finally { await isolated.happyDOM.close(); }
});

test('all 85 tables have zero inner margin at desktop and phone widths while retaining original wrapper spacing and scrolling', async () => {
  for (const width of [1440, 375]) {
    const isolated = new Window({ settings: { disableJavaScriptEvaluation: true, disableCSSFileLoading: true } });
    try {
      isolated.happyDOM.setWindowSize({ width, height: 900 });
      isolated.document.head.innerHTML = `<style>${combinedStyles()}</style>`;
      isolated.document.body.innerHTML = `<article class="prose docs-article">${(await renderedPage()).querySelector('.ccie-guide')!.outerHTML}</article>`;
      const wrappers = isolated.document.querySelectorAll('.ccie-guide .table-wrap');
      expect(wrappers).toHaveLength(85);
      for (const wrapper of wrappers) {
        const table = wrapper.querySelector('table')!;
        const inner = isolated.getComputedStyle(table), outer = isolated.getComputedStyle(wrapper);
        expect(inner.marginTop).toBe('0px'); expect(inner.marginBottom).toBe('0px');
        expect(outer.marginTop).toBe('17.6px'); expect(outer.marginBottom).toBe('17.6px');
        expect(outer.overflowX).toBe('auto'); expect(outer.borderTopWidth).toBe('1px');
      }
    } finally { await isolated.happyDOM.close(); }
  }
});
