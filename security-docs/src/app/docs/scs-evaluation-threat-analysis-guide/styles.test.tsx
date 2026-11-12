import { expect, test } from 'bun:test';
import { Window } from 'happy-dom';
import { readFileSync } from 'node:fs';
import postcss from 'postcss';
import { sourceTest, sourceCss, sourceDocument, renderedPage, scope } from './fidelity-helpers';

const css = () =>
  ['../../globals.css', '../docs-layout.css', './scs-guide.css']
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
      '<style>pre{font-family:monospace}h1,h2,h3,h4{font-weight:bold;letter-spacing:0px}ul{list-style-type:disc}ol{list-style-type:decimal}' +
      readFileSync(new URL('../../../../node_modules/highlight.js/styles/github.css',import.meta.url),'utf8') + resolveClamp(sourceStyle()) +
      '</style>';
    original.document.body.innerHTML = sourceDocument.body.innerHTML;
    for(const code of original.document.querySelectorAll('pre code')) code.classList.add('hljs');
    actual.document.head.innerHTML = '<style>ul,ol{list-style-type:none}button,input{font:inherit}'+resolveClamp(css())+'</style>';
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



for(const width of [375,768,1024,1025,1440])for(const theme of ['light','dark']){
 sourceTest(`all original typography, 865 cells, custom bullets, circled counters and checks at ${width}px ${theme}`,()=>compareCascade(width,theme,[
 'h1,h2,h3','th,td','.guide-content p','.guide-content ul,.guide-content ol,.guide-content li','code,strong','.hero,.eyebrow','.brand,.brand-name,.brand-sub','#nav a','.callout,.callout-title,.callout-body','.checklist label,.ck-n,.ck-text','.footer','pre,details.qa,details.qa summary,.qa-body'
 ]),30000);
}
test('custom round dots, ordered counters, checklist counters and hidden TOC dots survive without originals',()=>{
 const tree=postcss.parse(readFileSync(new URL('./scs-guide.css',import.meta.url),'utf8'));
 const val=(s:string,p:string)=>{const a:string[]=[];tree.walkRules(s,r=>r.walkDecls(p,d=>{a.push(d.value);}));return a;};
 expect(val(scope+' ul > li::before','width')).toContain('7px');expect(val(scope+' ul > li::before','border-radius')).toContain('50%');
 expect(val(scope+' ol','counter-reset')).toContain('n');expect(val(scope+' ol > li','counter-increment')).toContain('n');expect(val(scope+' ol > li::before','content')).toContain('counter(n)');expect(val(scope+' ol > li::before','line-height')).toContain('28px');
 expect(val(scope+' .ck-n::before','counter-increment')).toContain('c');expect(val(scope+' .ck-n::before','content')).toContain('counter(c)');
 expect(val(scope+' .sidebar nav li::before','content')).toContain('none');expect(val(scope+' ul.checklist > li::before','content')).toContain('none');
 tree.walkRules(r=>{for(const s of r.selector.split(','))expect(s.trim()).toMatch(/^(?:\.scs-guide\.scs-guide|\.docs-main:has\(\.scs-guide\)|html:has\(\.scs-guide\))/);});
 expect(val(scope+' .diagram','display').at(-1)).toBe('block');expect(val(scope+' .diagram svg','max-width').at(-1)).toBe('none');
});

test('original GitHub syntax colors and a bundled serif font remain available locally',()=>{
 const tree=postcss.parse(readFileSync(new URL('./scs-guide.css',import.meta.url),'utf8'));
 const found:string[]=[];tree.walkRules(r=>{if(r.selector.split(',').map(s=>s.trim()).includes(scope+' .hljs-comment'))r.walkDecls('color',d=>{found.push(d.value);});});expect(found).toContain('#6a737d');
 const faces:string[]=[];tree.walkAtRules('font-face',r=>r.walkDecls('font-family',d=>{faces.push(d.value);}));expect(faces).toContain("'Source Serif 4'");
});
