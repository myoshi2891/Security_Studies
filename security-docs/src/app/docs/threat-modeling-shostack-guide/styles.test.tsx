import { expect, test } from 'bun:test';
import { Window } from 'happy-dom';
import { readFileSync } from 'node:fs';
import postcss from 'postcss';
import { sourceTest, sourceCss, sourceDocument, renderedPage, scope } from './fidelity-helpers';

const css = () =>
  ['../../globals.css', '../docs-layout.css', './threat-modeling-shostack-guide.css']
    .map(f => readFileSync(new URL(f, import.meta.url), 'utf8'))
    .join('\n')
    .replace(/@import[^;]+;/g, '');

const norm = (v: string, p: string) =>
  p === 'font-weight'
    ? ({ normal: '400', bold: '700' }[v] ?? v)
    : p === 'letter-spacing' && (!v || v === 'normal')
      ? '0px'
      : !v && p === 'box-shadow'
        ? 'none'
        : !v && p === 'background-color'
          ? 'transparent'
          : !v && /^(margin|padding|border)/.test(p)
            ? '0px'
            : v.replace(/(-?[\d.]+)rem/g, (_, n) => Number(n) * 16 + 'px').replace(/["']/g, '');

const sourceStyle = () => {
  const tree = sourceCss.clone();
  tree.walkDecls('list-style', d => {
    if (['none', 'disc', 'decimal'].includes(d.value)) d.cloneAfter({ prop: 'list-style-type' });
  });
  return tree.toString();
};

export async function compareCascade(width: number, theme: string, selectors: string[]) {
  const actual = new Window({ settings: { device: { prefersColorScheme: theme } } });
  const original = new Window({ settings: { device: { prefersColorScheme: theme } } });
  try {
    for (const w of [actual, original]) {
      w.happyDOM.setWindowSize({ width, height: 900 });
      w.document.documentElement.className = theme;
      expect(w.matchMedia('(prefers-color-scheme: dark)').matches).toBe(theme === 'dark');
    }
    original.document.head.innerHTML =
      '<style>h1,h2,h3,h4{font-weight:bold;letter-spacing:0px}ul{list-style-type:disc}ol{list-style-type:decimal}' +
      sourceStyle() +
      '</style>';
    original.document.body.innerHTML = sourceDocument.body.innerHTML;
    actual.document.head.innerHTML = '<style>' + css() + '</style>';
    actual.document.body.innerHTML =
      '<main class="docs-main"><article class="prose docs-article">' + (await renderedPage()).body.innerHTML + '</article></main>';
    const errors = new Set<string>();
    for (const selector of selectors) {
      const a = [...actual.document.querySelectorAll(selector)].filter(e => !e.closest('.mermaid-target'));
      const o = [...original.document.querySelectorAll(selector.replaceAll('.guide-content', 'main'))].filter(
        e => !e.closest('.mermaid-target'),
      );
      expect(a.length, selector).toBe(o.length);
      for (let i = 0; i < a.length; i++) {
        const as = actual.getComputedStyle(a[i]);
        const os = original.getComputedStyle(o[i]);
        for (const p of [
          'font-family',
          'font-size',
          'font-weight',
          'letter-spacing',
          'line-height',
          'color',
          'background-color',
          'margin-top',
          'margin-bottom',
          'padding-top',
          'padding-left',
          'padding-right',
          'padding-bottom',
          'border-top-width',
          'border-bottom-width',
          'border-left-width',
          'list-style-type',
          'display',
          'text-transform',
          'text-decoration-line',
          'box-shadow',
        ]) {
          const av = norm(as.getPropertyValue(p), p);
          const ov = norm(os.getPropertyValue(p), p);
          if (av !== ov) errors.add(`${selector} ${p} expected ${ov} received ${av}`);
        }
      }
    }
    expect([...errors]).toEqual([]);
  } finally {
    await actual.happyDOM.close();
    await original.happyDOM.close();
  }
}

for (const width of [375, 640, 768, 1024, 1440]) {
  for (const theme of ['light', 'dark']) {
    sourceTest(
      `all source typography, 944 cells, callouts, code, details, badges and references at ${width}px ${theme}`,
      () =>
        compareCascade(width, theme, [
          'h1,h2,h3,h4',
          'th,td',
          '.guide-content p',
          '.callout,.callout-body',
          'pre,pre code,.code-head',
          'details,summary,.details-body',
          '.hero,.eyebrow,.meta,.meta-item,.meta-label,.meta-value',
          '.brand,.brand-title,.brand-sub',
          '.sidebar nav a,.sidebar-foot',
          '.ref-list,.ref-card,.ref-num,.ref-title,.ref-desc,.ref-url',
          '.footer',
          'h2 .num,h2 .title,.nav-link .n',
        ]),
      30000,
    );
  }
}

test('list bullets (disc), ordered numbers (decimal) and list spacing survive the app prose reset', async () => {
  const tree = postcss.parse(readFileSync(new URL('./threat-modeling-shostack-guide.css', import.meta.url), 'utf8'));
  const decl = (s: string) => {
    const out: string[] = [];
    tree.walkRules(r => {
      if (r.selector.split(',').map(v => v.trim().replace(/\s*>\s*/g, '>')).includes(scope + ' ' + s)) {
        r.walkDecls(d => {
          out.push(d.prop + ':' + d.value);
        });
      }
    });
    return out;
  };
  expect(decl('ul')).toContain('margin:0 0 1rem');
  expect(decl('ul')).toContain('padding-left:1.4rem');
  expect(decl('ul')).toContain('list-style-type:disc');
  expect(decl('ol')).toContain('margin:0 0 1rem');
  expect(decl('ol')).toContain('padding-left:1.4rem');
  expect(decl('ol')).toContain('list-style-type:decimal');
  expect(decl('li')).toContain('margin:.25rem 0');
  expect(decl('ul>li::before')).toContain('content:none');
  expect(decl('ol>li::before')).toContain('content:none');

  const w = new Window();
  try {
    w.document.head.innerHTML = '<style>' + css() + '</style>';
    w.document.body.innerHTML =
      '<main class="docs-main"><article class="prose docs-article"><div class="shostack-threat-guide"><div class="guide-content"><ul><li>bullet</li></ul><ol><li>numbered</li></ol></div></div></article></main>';
    const ulStyle = w.getComputedStyle(w.document.querySelector('ul')!);
    const olStyle = w.getComputedStyle(w.document.querySelector('ol')!);
    const liStyle = w.getComputedStyle(w.document.querySelector('li')!);
    expect(ulStyle.listStyleType).toBe('disc');
    expect(olStyle.listStyleType).toBe('decimal');
    expect(norm(ulStyle.paddingLeft, 'padding-left')).toBe('22.4px');
    expect(norm(liStyle.marginTop, 'margin-top')).toBe('4px');
    expect(norm(liStyle.marginBottom, 'margin-bottom')).toBe('4px');
  } finally {
    await w.happyDOM.close();
  }
});

test('chapter badges, sidebar numbers, reference badges and empty table cell rules survive', () => {
  const tree = postcss.parse(readFileSync(new URL('./threat-modeling-shostack-guide.css', import.meta.url), 'utf8'));
  const decl = (s: string) => {
    const out: string[] = [];
    tree.walkRules(r => {
      if (r.selector.split(',').map(v => v.trim()).includes(scope + ' ' + s)) {
        r.walkDecls(d => {
          out.push(d.prop + ':' + d.value);
        });
      }
    });
    return out;
  };
  expect(decl('h2 .num')).toContain('background:var(--color-background-info)');
  expect(decl('h2 .num')).toContain('border:1px solid var(--color-border-primary)');
  expect(decl('h2 .num')).toContain('color:var(--accent)');
  expect(decl('.nav-link .n')).toContain('text-align:right');
  expect(decl('.ref-num')).toContain('border-radius:50%');
  expect(decl('.ref-num')).toContain('background:var(--color-background-info)');
  expect(decl('td:empty::after')).toContain('min-height:1.7rem');
});

test('diagrams retain intrinsic width, centered small figures and left-reachable scrolling', async () => {
  for (const width of [375, 640, 768, 1024, 1440]) {
    const w = new Window();
    try {
      w.happyDOM.setWindowSize({ width, height: 1000 });
      w.document.head.innerHTML = '<style>' + css() + '</style>';
      w.document.body.innerHTML =
        '<div class="shostack-threat-guide"><div class="diagram"><div class="mermaid-target"><div class="diagram-viewport"><svg style="width:2400px"></svg></div></div></div></div>';
      const style = (s: string) => w.getComputedStyle(w.document.querySelector(s)!);
      expect(style('.diagram').overflowX).toBe('auto');
      expect(style('.mermaid-target').display).toBe('block');
      expect(style('.mermaid-target').justifyContent).toBe('normal');
      expect(style('.diagram-viewport').overflowX).toBe('auto');
      expect(style('svg').width).toBe('2400px');
      expect(style('svg').maxWidth).toBe('none');
      expect(style('svg').marginLeft).toBe('auto');
      expect(style('svg').marginRight).toBe('auto');
    } finally {
      await w.happyDOM.close();
    }
  }
});
