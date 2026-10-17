import { afterEach, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { cleanup, render } from '@testing-library/react';
import { Window } from 'happy-dom';
import postcss from 'postcss';
import { canonical, declarations, renderedPage, scope, sourceCss, sourceDocument } from './fidelity-helpers';
afterEach(cleanup);

test('preserves every original CSS rule and media condition in an isolated scope', () => {
  const css=postcss.parse(readFileSync(new URL('./hacking-kubernetes.css',import.meta.url),'utf8'));
  sourceCss.walkRules(rule=>{
    const expected=rule.selector.split(',').map(s=>[':root','body','html'].includes(s.trim())?scope:`${scope} ${s.trim()}`).join(',');
    const media=rule.parent?.type==='atrule'?rule.parent.params:undefined;
    const original:string[]=[]; rule.walkDecls(d=>{original.push(`${d.prop}:${d.value}`);});
    const matches:string[][]=[];
    css.walkRules(expected,r=>{if((r.parent?.type==='atrule'?r.parent.params:undefined)===media){const ds:string[]=[];r.walkDecls(d=>{ds.push(`${d.prop}:${d.value}`);});matches.push(ds);}});
    expect(matches.some(ds=>JSON.stringify(ds)===JSON.stringify(original)),rule.selector).toBe(true);
  });
  css.walkRules(rule=>{expect(rule.selector.split(',').every(s=>s.trim().startsWith(scope)||s.trim().startsWith('.docs-main:has(.kubernetes-guide)')||s.trim()==='html:has(.kubernetes-guide)')).toBe(true);});
});
test('preserves hero metadata, heading and inline emphasis',async()=>{
  const page=await renderedPage(); expect(canonical(page.querySelector('.hero')!)).toEqual(canonical(sourceDocument.querySelector('.hero')!));
});
test('restores ordered numbers, scoped prose width, original spacing and application header clearance at all widths',async()=>{
  const css=['../../../../node_modules/tailwindcss/preflight.css','../../globals.css','../docs-layout.css','./hacking-kubernetes.css'].map(file=>readFileSync(new URL(file,import.meta.url),'utf8')).join('\n');
  for(const width of [1440,900,375]){
    const w=new Window();w.happyDOM.setWindowSize({width,height:900});
    try{
      w.document.head.innerHTML=`<style>${css}</style>`;
      w.document.body.innerHTML='<div class="docs-shell"><main class="docs-main"><article class="prose docs-article"><div class="kubernetes-guide"><aside class="sidebar"></aside><div class="layout"><section class="section"><div class="prose"><ul><li>点</li></ul><ol><li>番号</li></ol><div class="table-wrap"><table><tbody><tr><td>セル</td></tr></tbody></table></div></div></section></div></div></article></main></div>';
      const style=(s:string)=>w.getComputedStyle(w.document.querySelector(s)!);
      expect(style('.kubernetes-guide').width).toBe('100%');
      expect(style('.kubernetes-guide .prose').maxWidth).toBe('none');
      expect(style('.kubernetes-guide .prose').marginLeft).toBe('0px');
      expect(style('.kubernetes-guide .prose ul').listStyleType).toBe('none');
      expect(style('.kubernetes-guide .prose ol').listStyleType).toBe('decimal');
      expect(style('.kubernetes-guide .prose li').marginBottom).toBe('6px');
      expect(style('.kubernetes-guide table').marginTop).toBe('0px');
      expect(style('.kubernetes-guide .layout').marginLeft).toBe(width>1024?'288px':'0px');
      expect(style('.kubernetes-guide .sidebar').top).toBe('64px');
      expect(style('.kubernetes-guide .sidebar').visibility).toBe(width>1024?'visible':'hidden');
    }finally{await w.happyDOM.close();}
  }
});
test('preserves dots, colored ordered markers and numbered checkbox styling including checked and keyboard states',()=>{
 const css=postcss.parse(readFileSync(new URL('./hacking-kubernetes.css',import.meta.url),'utf8'));
 for(const selector of ['.prose ul>li::before','.prose ol>li::marker','.checklist','.check-num::before','.check-card input:checked+.box','.check-card input:focus-visible+.box']){
  expect(declarations(css,`${scope} ${selector}`)).toEqual(declarations(sourceCss,selector));
  expect(declarations(sourceCss,selector).length).toBeGreaterThan(0);
 }
 expect(declarations(css,`${scope} .prose ol`)).toContain('list-style-type:decimal');
 expect(declarations(css,`${scope} .mermaid`)).toContain('display:block');
 expect(declarations(css,`${scope} .mermaid svg`)).toContain('margin-left:auto');
 expect(declarations(css,`${scope} .mermaid svg`)).toContain('max-width:none');
});
test('native lists and tables bypass the shared MDX wrappers',async()=>{
 const {E}=await import(new URL('./GuideElements.tsx',import.meta.url).href);
 expect(render(createElement(E.ul,{},createElement(E.li,{},'点'))).container.innerHTML).toBe('<ul><li>点</li></ul>');
});


test('smooth anchor scrolling belongs to the document only while this route exists and respects reduced motion',async()=>{
 const css=readFileSync(new URL('./hacking-kubernetes.css',import.meta.url),'utf8');
 for(const motion of ['no-preference','reduce']){
  const w=new Window({settings:{device:{prefersReducedMotion:motion}}});
  try{
   w.document.head.innerHTML=`<style>${css}</style>`;w.document.body.innerHTML='<div class="kubernetes-guide"></div>';
   expect(w.getComputedStyle(w.document.documentElement).scrollBehavior).toBe(motion==='reduce'?'auto':'smooth');
   w.document.body.innerHTML='';expect(w.document.querySelector('.kubernetes-guide')).toBeNull();
   // Happy DOM caches :has() after descendant removal. A route-free document
   // verifies both the fresh selector result and the resulting computed style.
   const empty=new Window({settings:{device:{prefersReducedMotion:motion}}});
   try{
    empty.document.head.innerHTML=`<style>${css}</style>`;
    expect(empty.document.documentElement.matches('html:has(.kubernetes-guide)')).toBe(false);
    expect(empty.getComputedStyle(empty.document.documentElement).scrollBehavior).not.toBe('smooth');
   }finally{await empty.happyDOM.close();}

  }finally{await w.happyDOM.close();}
 }
});
test('mobile menu SVG dimensions preserve the original 1.75rem icon size',async()=>{
 const w=new Window();w.happyDOM.setWindowSize({width:375,height:900});
 try{
  w.document.head.innerHTML=`<style>${readFileSync(new URL('./hacking-kubernetes.css',import.meta.url),'utf8')}</style>`;
  w.document.body.innerHTML='<div class="kubernetes-guide"><button class="nav-toggle"><svg width="24" height="24"></svg></button></div>';
  const style=w.getComputedStyle(w.document.querySelector('svg')!);expect(style.width).toBe('28px');expect(style.height).toBe('28px');
 }finally{await w.happyDOM.close();}
});
