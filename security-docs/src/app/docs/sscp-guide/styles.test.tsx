import { expect, test } from 'bun:test';
import { Window } from 'happy-dom';
import { readFileSync } from 'node:fs';
import postcss from 'postcss';
import { sourceTest, sourceCss, sourceDocument, renderedPage, scope } from './fidelity-helpers';

const css = () =>
  ['../../globals.css', '../docs-layout.css', './sscp-guide.css']
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
          // Happy DOM has no browser form-control UA styles; styles.browser.mjs compares these in Chromium.
          if (a[i].matches('input') && ['font-family','font-size','font-weight','line-height','color'].includes(p)) continue;
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
      `all source typography, 1752 cells, callouts, code, details, badges and references at ${width}px ${theme}`,
      () =>
        compareCascade(width, theme, [
          'h1,h2,h3,h4,h5,h6', 'th,td', '.guide-content p', '.guide-content ul,.guide-content ol,.guide-content li',
          'code,em,strong', '.hero,.eyebrow,.meta,.meta dt,.meta dd', '.brand,.brand-title,.brand-sub',
          '.sidebar nav a,.sidebar-note', '.ref,.ref-num,.ref-title,.ref-url,.ref-mark',
          '.callout,.callout-head,.callout-body,.sub-label,.chk,.chk-num,.chk-text,.chk input', '.footer',
        ]),
      30000,
    );
  }
}




test('gold bullets, indigo decimal markers, reference badges and CSS checklist numbers retain exact source styling',()=>{
 const tree=postcss.parse(readFileSync(new URL('./sscp-guide.css',import.meta.url),'utf8'));const values=(s:string)=>{const out:string[]=[];tree.walkRules(s,r=>r.walkDecls(d=>{out.push(d.prop+':'+d.value);}));return out;};
 expect(values(scope+' .guide-content ul > li::before')).toEqual(expect.arrayContaining(["content:''",'width:6px','height:6px','border-radius:50%','background:var(--color-gold)']));
 expect(values(scope+' .guide-content ol > li::marker')).toEqual(expect.arrayContaining(['color:var(--color-indigo)','font-weight:500']));expect(values(scope+' ol')).toContain('list-style-type:decimal');expect(values(scope+' .sidebar nav li::before')).toContain('content:none');
 expect(values(scope+' ul.checklist')).toContain('counter-reset:chk');expect(values(scope+' .guide-content ul.checklist > li')).toContain('counter-increment:chk');expect(values(scope+' .chk-num::before')).toContain('content:counter(chk)');expect(values(scope+' .guide-content ul.checklist > li::before')).toContain('content:none');
});
test('native-width SVGs center when narrow and keep the left edge reachable when wide',async()=>{
 for(const width of [375,640,768,1024,1440])for(const svgWidth of [120,2400]){const w=new Window();try{w.happyDOM.setWindowSize({width,height:900});w.document.head.innerHTML='<style>'+css()+'</style>';w.document.body.innerHTML='<div class="sscp-guide"><div class="mermaid-target"><div class="diagram-viewport"><svg style="width:'+svgWidth+'px"></svg></div></div></div>';const s=(sel:string)=>w.getComputedStyle(w.document.querySelector(sel)!);expect(s('.mermaid-target').display).toBe('block');expect(s('.diagram-viewport').overflowX).toBe('auto');expect(s('svg').width).toBe(svgWidth+'px');expect(s('svg').maxWidth).toBe('none');expect(s('svg').marginLeft).toBe('auto');expect(s('svg').marginRight).toBe('auto');}finally{await w.happyDOM.close();}}
});
