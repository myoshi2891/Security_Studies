import { expect, test } from 'bun:test';
import { Window } from 'happy-dom';
import { readFileSync } from 'node:fs';
import postcss from 'postcss';
import { sourceTest, sourceCss, sourceDocument, renderedPage, scope } from './fidelity-helpers';

const css = () =>
  ['../../globals.css', '../docs-layout.css', './ghost-in-the-wires-guide.css']
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
      `all source typography, 332 cells, callouts, code, details, badges and references at ${width}px ${theme}`,
      () =>
        compareCascade(width, theme, [
          'h1,h2,h3,h4', 'th,td', '.guide-content p', '.guide-content ul,.guide-content ol,.guide-content li',
          'blockquote,code,em,strong', 'details.qa,details.qa summary,.qa-body',
          '.hero,.lead', '.brand,.brand-title,.brand-sub', '.sidebar nav a',
          '.src-list,.src-card,.src-badge,.src-type,.src-desc,.src-url',
          '.life-timeline,.life-timeline figcaption,.timeline-events,.timeline-year', '.footer',

        ]),
      30000,
    );
  }
}


test('source list markers remain mint square bullets and decimal numbers, with timeline circles overriding generic bullets', () => {
 const root=postcss.parse(readFileSync(new URL('./ghost-in-the-wires-guide.css',import.meta.url),'utf8'));
 const decl=(selector:string)=>{const out:string[]=[];root.walkRules(r=>{if(r.selector.split(',').map(s=>s.trim()).includes(scope+' '+selector))r.walkDecls(d=>{out.push(d.prop+':'+d.value);});});return out;};
 expect(decl('.section ul > li::before')).toEqual(expect.arrayContaining(["content:''",'width:5px' ,'height:5px','background:var(--accent)']));
 expect(decl('.section ol > li::marker')).toEqual(expect.arrayContaining(['color:var(--accent)','font-weight:600']));
 expect(decl('ol')).toContain('list-style-type:decimal');
 expect(decl('.timeline-events > li::before')).toContain('border-radius:50%');
 expect(decl('.timeline-events > li:not(:last-child)::after')).toContain('width:1px');
 expect(decl('details.qa summary::before')).toContain("content:'+'");
 expect(decl('details.qa[open] summary::before')).toContain("content:'\\2212'");
});
test('diagrams center small SVGs and keep oversized SVGs scrollable from the left at every breakpoint',async()=>{
 const {Window}=await import('happy-dom');
 for(const width of [375,640,768,1024,1440]){
  const w=new Window();try{
   w.happyDOM.setWindowSize({width,height:900});
   w.document.head.innerHTML='<style>'+css()+'</style>';
   w.document.body.innerHTML='<div class="ghost-wires-guide"><div class="diagram"><div class="mermaid-target"><div class="diagram-viewport"><svg style="width:2400px"></svg></div></div></div></div>';
   const style=(s:string)=>w.getComputedStyle(w.document.querySelector(s)!);
   expect(style('.diagram-viewport').overflowX).toBe('auto');expect(style('.diagram').display).toBe('block');
   expect(style('svg').width).toBe('2400px');expect(style('svg').maxWidth).toBe('none');expect(style('svg').marginLeft).toBe('auto');expect(style('svg').marginRight).toBe('auto');
  }finally{await w.happyDOM.close();}
 }
});
