import { expect, test } from 'bun:test';
import { Window } from 'happy-dom';
import { readFileSync } from 'node:fs';
import postcss from 'postcss';
import { sourceTest, sourceCss, sourceDocument, renderedPage, scope } from './fidelity-helpers';

const css = () =>
  ['../../globals.css', '../docs-layout.css', './iso-iec-29100-2024-guide.css']
    .map(f => readFileSync(new URL(f, import.meta.url), 'utf8'))
    .join('\n')
    .replace(/@import[^;]+;/g, '');

const norm = (v: string, p: string) =>
  p === 'text-transform' && (!v || v === 'none') ? 'none' :
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
    // Happy DOM does not resolve clamp(), and compounds em values from overridden
    // declarations. Chromium styles.browser.mjs checks font sizes/letter spacing
    // for every real heading, inline code and brand at these same 10 conditions.
    const resolveClamp = (css: string) => css.replace(/clamp\(([-\d.]+)rem,\s*([-\d.]+)vw,\s*([-\d.]+)rem\)/g,
      (_, min, vw, max) => Math.max(Number(min)*16, Math.min(Number(vw)*width/100, Number(max)*16))+'px');
    original.document.head.innerHTML =
      '<style>h1,h2,h3,h4{font-weight:bold;letter-spacing:0px}ul{list-style-type:disc}ol{list-style-type:decimal}' +
      readFileSync(new URL('../../../../node_modules/highlight.js/styles/atom-one-dark.css',import.meta.url),'utf8') + resolveClamp(sourceStyle()) +
      '</style>';
    original.document.body.innerHTML = sourceDocument.body.innerHTML;
    for(const code of original.document.querySelectorAll('pre code')) code.classList.add('hljs');
    actual.document.head.innerHTML = '<style>' + resolveClamp(css()) + '</style>';
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
          if (['font-size', 'letter-spacing'].includes(p) && (a[i].matches('h1,h2,code,.brand') || a[i].closest('.brand'))) continue;
          const av = norm(as.getPropertyValue(p), p);
          const ov = norm(os.getPropertyValue(p), p);
          if (av !== ov) errors.add(`${selector} [${i}:${a[i].tagName}.${a[i].className}] ${p} expected ${ov} received ${av}`);
        }
      }
    }
    expect([...errors]).toEqual([]);
  } finally {
    await actual.happyDOM.close();
    await original.happyDOM.close();
  }
}

for (const width of [375, 768, 980, 1024, 1440]) {
  for (const theme of ['light', 'dark']) {
    sourceTest(
      `all source typography, 937 cells, callouts, code, details, badges and references at ${width}px ${theme}`,
      () =>
        compareCascade(width, theme, [
          'h1,h2,h3,h4', 'th,td', '.guide-content p', '.guide-content ul,.guide-content ol,.guide-content li',
          'code,em,strong', '.hero,.meta,.meta dt,.meta dd', '.brand,.brand-title,.brand-sub',
          '.sidebar nav a,.sidebar-note', '.ref,.ref-badge,.ref-title,.ref-desc,.ref-url',
          '.callout,.quiz-head,.quiz-badge,.quiz-q,.quiz-summary,.quiz-answer,.quiz-ans-badge', '.footer',
        ]),
      30000,
    );
  }
}



test('all custom bullet dots and ordered counters retain their explicit source CSS',()=>{
 const tree=postcss.parse(readFileSync(new URL('./iso-iec-29100-2024-guide.css',import.meta.url),'utf8'));
 const values=(s:string)=>{const out:string[]=[];tree.walkRules(s,r=>r.walkDecls(d=>{out.push(d.prop+':'+d.value);}));return out;};
 expect(values(scope+' .prose ul > li::before')).toEqual(expect.arrayContaining(["content:''",'width:6px','height:6px','border-radius:50%','background:var(--accent)']));
 expect(values(scope+' .prose ol')).toContain('counter-reset:n');
 expect(values(scope+' .prose ol > li')).toContain('counter-increment:n');
 expect(values(scope+' .prose ol > li::before')).toEqual(expect.arrayContaining(['content:counter(n)','width:1.875rem','height:1.875rem','border-radius:50%']));
 expect(values(scope+' .sidebar nav li::before')).toContain('content:none');
});
test('small diagrams center and wide diagrams keep their left edge reachable',async()=>{
 for(const width of [375,640,768,1024,1440])for(const svgWidth of [120,2400]){
 const w=new Window();try{w.happyDOM.setWindowSize({width,height:900});w.document.head.innerHTML='<style>'+css()+'</style>';w.document.body.innerHTML='<div class="iso29100-guide"><div class="mermaid"><div class="diagram-viewport"><svg style="width:'+svgWidth+'px"></svg></div></div></div>';
 const s=(sel:string)=>w.getComputedStyle(w.document.querySelector(sel)!);
 expect(s('.mermaid').display).toBe('block');expect(s('.diagram-viewport').overflowX).toBe('auto');expect(s('svg').width).toBe(svgWidth+'px');expect(s('svg').marginLeft).toBe('auto');expect(s('svg').marginRight).toBe('auto');expect(s('svg').maxWidth).toBe('none');
 }finally{await w.happyDOM.close();}}
});
