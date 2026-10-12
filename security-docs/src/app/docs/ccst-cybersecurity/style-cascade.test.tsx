import { expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { Window } from 'happy-dom';
import postcss from 'postcss';
import { declarations, renderedPage, scope, sourceCss } from './fidelity-helpers';

const migratedCss = () => postcss.parse(readFileSync(new URL('./ccst-cybersecurity.css', import.meta.url), 'utf8'));
function combinedStyles() {
  const css = postcss.parse([readFileSync(new URL('../../globals.css', import.meta.url), 'utf8'), readFileSync(new URL('../docs-layout.css', import.meta.url), 'utf8'), migratedCss().toString()].join('\n'));
  const palette = new Map<string, string>();
  css.walkDecls(/^--/, d => { palette.set(d.prop, d.value); });
  css.walkDecls(d => { if (d.prop === 'color' || d.prop.startsWith('background')) d.value = d.value.replace(/var\((--[\w-]+)\)/g, (match, token: string) => palette.get(token) ?? match); });
  css.walkRules(rule => { rule.selector = rule.selector.replace(/:hover\b/g, '[data-css-hover]'); });
  return css.toString();
}
function color(value: string) {
  const hex = value.match(/^#([\da-f]{6})$/i)?.[1];
  return hex ? `rgb(${[0, 2, 4].map(i => parseInt(hex.slice(i, i + 2), 16)).join(', ')})` : value;
}
async function windowFor(width = 1440, mode: 'light' | 'dark' = 'light') {
  const window = new Window({ settings: { disableJavaScriptEvaluation: true, disableCSSFileLoading: true, device: { prefersColorScheme: mode } } });
  window.happyDOM.setWindowSize({ width, height: 900 });
  window.document.body.innerHTML = `<main class="docs-main"><article class="prose docs-article">${(await renderedPage()).querySelector('.ccst-guide')!.outerHTML}</article></main>`;
  for (const row of window.document.querySelectorAll('tbody tr')) row.setAttribute('data-css-hover', '');
  window.document.head.innerHTML = `<style>${combinedStyles()}</style>`;
  return window;
}
test('keeps every original CSS rule and declaration under a page-local scope', () => {
  const css = migratedCss();
  sourceCss.walkRules(original => {
    const selector = original.selectors.map(s => [':root', 'html', 'body'].includes(s) ? scope : s.startsWith('body.nav-open') ? s.replace('body.nav-open', `${scope}.nav-open`) : `${scope} ${s}`).join(',');
    const context = (rule: postcss.Rule) => rule.parent?.type === 'atrule' ? (rule.parent as postcss.AtRule).params : '';
    const expected = original.nodes.filter(n => n.type === 'decl').map(n => n.toString());
    const matches: string[][] = [];
    css.walkRules(selector, rule => { if (context(rule) === context(original)) matches.push(rule.nodes.filter(n => n.type === 'decl').map(n => n.toString())); });
    expect(matches, selector).toContainEqual(expected);
  });
});
test('uses the installed local Source Serif family rather than falling back to system fonts', () => {
  const css = migratedCss();
  let font = ''; css.walkDecls('--font-head', d => { font = d.value; });
  expect(font).toStartWith('"Source Serif 4 Variable"');
});
test('resets shared heading letter spacing and bottom borders to source defaults', async () => {
  const window = await windowFor();
  try {
    // happy-dom drops letter-spacing:normal (confirmed with an isolated reproduction).
    // Check the real declaration, and independently check computed heading typography.
    expect(declarations(migratedCss(), `${scope} h1`)).toContain('letter-spacing:normal');
    for (const h1 of window.document.querySelectorAll('.main h1')) expect(window.getComputedStyle(h1).fontWeight).toBe('500');
    for (const h2 of window.document.querySelectorAll('.main h2')) {
      const style = window.getComputedStyle(h2);
      expect(style.borderBottomWidth).toBe('0px'); expect(style.paddingBottom).toBe('0px');
    }
  } finally { await window.happyDOM.close(); }
});
test('retains the source ordered-item spacing without shared prose margins', async () => {
  const window = await windowFor();
  try {
    for (const li of window.document.querySelectorAll('.main ol>li')) expect(window.getComputedStyle(li).marginBottom).toBe('0px');
  } finally { await window.happyDOM.close(); }
});
for (const mode of ['light', 'dark'] as const) test(`all 163 tables retain original alternating backgrounds and header colors on hover in ${mode}`, async () => {
  const window = await windowFor(1440, mode);
  try {
    const tables = window.document.querySelectorAll('.main table'); expect(tables).toHaveLength(163);
    for (const table of tables) {
      for (const header of table.querySelectorAll('th')) expect(color(window.getComputedStyle(header).backgroundColor)).toBe('rgb(238, 241, 248)');
      for (const [index, row] of [...table.querySelectorAll('tbody tr')].entries()) {
        const cell = row.querySelector('td'); if (!cell) continue;
        expect(color(window.getComputedStyle(cell).backgroundColor)).toBe(index % 2 ? 'rgb(250, 251, 252)' : 'rgb(255, 255, 255)');
      }
    }
  } finally { await window.happyDOM.close(); }
});
for (const width of [375, 768, 1440]) test(`all table wrappers, native ordered lists and source column widths survive shared CSS at ${width}px`, async () => {
  const window = await windowFor(width);
  try {
    const main = window.document.querySelector('.ccst-guide .main')!;
    expect(window.getComputedStyle(main).marginLeft).toBe(width > 1000 ? '288px' : '0px');
    expect(window.getComputedStyle(window.document.querySelector('.stats')!).gridTemplateColumns).toBe('repeat(auto-fit,minmax(150px,1fr))');
    for (const wrap of window.document.querySelectorAll('.main .table-wrap')) {
      const outer = window.getComputedStyle(wrap), inner = window.getComputedStyle(wrap.querySelector('table')!);
      expect(outer.overflowX).toBe('auto'); expect(outer.marginTop).toBe(wrap.closest('.callout') ? '4px' : '14px'); expect(outer.marginBottom).toBe('20px');
      expect(inner.marginTop).toBe('0px'); expect(inner.marginBottom).toBe('0px');
    }
    for (const ol of window.document.querySelectorAll('.main ol')) expect(window.getComputedStyle(ol).listStyleType).toBe('decimal');
    expect(window.getComputedStyle(window.document.querySelector('.sidebar')!).position).toBe('fixed');
  } finally { await window.happyDOM.close(); }
});
for (const mode of ['light', 'dark'] as const) test(`all three code blocks retain their literal source colors, spacing and scrolling in ${mode}`, async () => {
  const window = await windowFor(1440, mode);
  try {
    const blocks = window.document.querySelectorAll('.main pre'); expect(blocks).toHaveLength(3);
    for (const pre of blocks) {
      const style = window.getComputedStyle(pre);
      expect(color(style.backgroundColor)).toBe('rgb(251, 251, 253)');
      expect(style.marginTop).toBe('14px'); expect(style.marginBottom).toBe('20px'); expect(style.overflowX).toBe('auto');
      expect(color(window.getComputedStyle(pre.querySelector('code')!).color)).toBe('rgb(22, 27, 38)');
    }
  } finally { await window.happyDOM.close(); }
});


test('applies original anchor scrolling to the actual viewport only on this route and respects reduced motion', () => {
  const values: [string | undefined, string][] = [];
  migratedCss().walkRules(':root:has(.ccst-guide)', rule => {
    const media = rule.parent?.type === 'atrule' ? (rule.parent as postcss.AtRule).params : undefined;
    rule.walkDecls('scroll-behavior', d => { values.push([media, d.value]); });
  });
  expect(values).toEqual([[undefined, 'smooth'], ['(prefers-reduced-motion:reduce)', 'auto']]);
});

test('centers all diagram SVGs using block auto margins inside a left-origin scroll container', () => {
  const css = migratedCss();
  const container = declarations(css, `${scope} .diagram [role="img"]`);
  const svg = declarations(css, `${scope} .diagram [role="img"] svg`);
  expect(container).toContain('display:block');
  expect(container).toContain('min-width:0');
  expect(container).toContain('overflow-x:auto');
  expect(svg).toContain('display:block');
  expect(svg).toContain('margin-left:auto');
  expect(svg).toContain('margin-right:auto');
  expect(svg).toContain('max-width:none');
  // Block auto margins become zero when content exceeds the containing width.
  // Flex centering or translations can instead push the left edge outside the scroll origin.
  expect(container).not.toContain('justify-content:center');
  expect(svg.some(value => value.startsWith('transform:') || /^margin-(left|right):-/.test(value))).toBe(false);
});
test('retains narrow and oversized SVG widths with auto centering and keyboard-accessible scrolling', async () => {
  for (const width of [375, 1440]) {
    const window = new Window({ settings: { disableJavaScriptEvaluation: true, disableCSSFileLoading: true } });
    try {
      window.happyDOM.setWindowSize({ width, height: 900 });
      window.document.body.innerHTML = `<article class="prose"><div class="ccst-guide"><figure class="diagram"><div role="img" tabindex="0" style="width: ${width - 40}px"><svg viewBox="0 0 120 80" style="width:120px;height:auto"></svg><svg viewBox="0 0 2400 80" style="width:2400px;height:auto"></svg></div></figure></div></article>`;
      window.document.head.innerHTML = `<style>${combinedStyles()}</style>`;
      const scroll = window.document.querySelector('[role="img"]')!;
      expect(window.getComputedStyle(scroll).display).toBe('block');
      expect(window.getComputedStyle(scroll).overflowX).toBe('auto');
      expect(scroll.getAttribute('tabindex')).toBe('0');
      const svgs = [...scroll.querySelectorAll('svg')];
      expect(svgs.map(svg => window.getComputedStyle(svg).width)).toEqual(['120px', '2400px']);
      for (const svg of svgs) {
        const style = window.getComputedStyle(svg);
        expect(style.display).toBe('block'); expect(style.marginLeft).toBe('auto'); expect(style.marginRight).toBe('auto');
      }
    } finally { await window.happyDOM.close(); }
  }
});
