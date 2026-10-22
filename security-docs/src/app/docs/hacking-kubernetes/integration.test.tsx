import { expect, test } from 'bun:test';
import { existsSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import postcss from 'postcss';
import { docsConfig } from '@/config/docs';
import { getSearchIndex } from '@/lib/search';
import { canonical, declarations, evaluatedPage, renderedPage, scope, sourceCss, sourceDocument, sourceHtml, sourceTest } from './fidelity-helpers';
const inventory=JSON.parse(readFileSync(new URL('../../../../../docs/migration-inventory/hacking-kubernetes.json',import.meta.url),'utf8'));
const main=() => sourceDocument.querySelector('main')!;
const bodyElements=(el:Element,selector:string)=>[...el.querySelectorAll(selector)].filter(node=>node.matches('.mermaid')||!node.closest('.mermaid'));

// MD 原本は HTML 原本と独立に存在判定する
const markdownSource=new URL('../../../../../archive/md/Hacking-kubernetes-guide.md',import.meta.url);
test.skipIf(!existsSync(markdownSource))('keeps the archived Markdown original byte-for-byte unchanged',()=>{
 expect(createHash('sha256').update(readFileSync(markdownSource)).digest('hex')).toBe(inventory.markdownSha256);
});
sourceTest('keeps the original HTML byte-for-byte unchanged and every source chapter, reference and footer in order',async()=>{
 expect(createHash('sha256').update(sourceHtml).digest('hex')).toBe(inventory.sha256);
 const page=(await renderedPage()).querySelector('.layout')!;
 const children=(el:Element)=>[...el.childNodes].map(canonical).filter(value=>value!==null);
 expect(children(page)).toEqual(children(main()));
 for(const [selector,count] of Object.entries(inventory.counts)){
  expect(bodyElements(main(),selector).length,`source ${selector}`).toBe(count as number);
  expect(bodyElements(page,selector).length,selector).toBe(count as number);
 }
});
test('registers the page exactly once in Security Guides without changing existing items',()=>{
 expect(docsConfig.sidebarNav.find(group=>group.id==='platform')!.items).toContainEqual({title:'Hacking Kubernetes',href:'/docs/hacking-kubernetes'});
 expect(docsConfig.sidebarNav.flatMap(group=>group.items).filter(item=>item.href==='/docs/hacking-kubernetes')).toHaveLength(1);
});
sourceTest('indexes all 103 original headings including inline-code headings with the original title and metadata',async()=>{
 const metadata=(await evaluatedPage()).metadata as {title:string;description:string};
 expect(metadata.title).toBe(main().querySelector('h1')!.textContent!);expect(metadata.description).toContain('Kubernetes');
 const result=(await getSearchIndex()).filter(item=>item.href==='/docs/hacking-kubernetes');
 expect(result).toHaveLength(1);expect(result[0].title).toBe(metadata.title);
 const headings=[...main().querySelectorAll('h1,h2,h3,h4,h5,h6')].map(el=>el.textContent!.replace(/\s+/g,' ').trim());expect(headings).toHaveLength(103);expect(result[0].headings).toEqual(headings);
});
test('serves all headings through the static search index and preserves the existing documents',async()=>{
 const index=JSON.parse(readFileSync(new URL('../../../../public/search-index.json',import.meta.url),'utf8'));
 expect(index.filter((item:{href:string})=>item.href==='/docs/hacking-kubernetes')).toEqual((await getSearchIndex()).filter(item=>item.href==='/docs/hacking-kubernetes'));
 const page=index.filter((item:{href:string})=>item.href==='/docs/hacking-kubernetes');expect(page).toHaveLength(1);expect(page[0].headings).toHaveLength(103);
});
sourceTest('preserves the original TOC labels, inline code, order, source anchors and every reference target',async()=>{
 const page=await renderedPage();const ids=[...page.querySelectorAll('[id]')].map(el=>el.id);expect(new Set(ids).size).toBe(ids.length);
 expect(ids).toEqual(inventory.ids);
 expect(canonical(page.querySelector('.sidebar nav')!)).toEqual(canonical(sourceDocument.querySelector('.sidebar nav')!));
 const original=[...sourceDocument.querySelectorAll('a[href^="#"]')].map(el=>el.getAttribute('href'));
 const migrated=[...page.querySelectorAll('a[href^="#"]')].map(el=>el.getAttribute('href'));expect(migrated).toEqual(original);
 for(const href of migrated)expect(page.getElementById(href!.slice(1)),href!).not.toBeNull();
});
sourceTest('retains each original diagram role and accessible label on the rendered SVG wrapper, outside the text description',async()=>{
 const page=await renderedPage();const figures=[...page.querySelectorAll('.mermaid')];expect(figures).toHaveLength(12);
 const {render,waitFor,cleanup}=await import('@testing-library/react');const {createElement}=await import('react');
 const {MermaidFigure}=await import(new URL('./MermaidFigure.tsx',import.meta.url).href);
 const saved=globalThis.IntersectionObserver;globalThis.IntersectionObserver=undefined as unknown as typeof IntersectionObserver;
 try{for(const figure of figures){const id=figure.getAttribute('data-diagram')!;const original=sourceDocument.querySelector(`[data-diagram="${id}"]`)!;
  expect(figure.getAttribute('role')).toBeNull();
  const view=render(createElement(MermaidFigure,{id,source:figure.getAttribute('data-definition')!,renderer:async()=>({svg:'<svg viewBox="0 0 10 10"></svg>'})}));
  await waitFor(()=>expect(view.container.querySelector('svg')).not.toBeNull());
  const image=view.container.querySelector('[role="img"]')!;
  expect(image.getAttribute('role')).toBe(original.getAttribute('role'));expect(image.getAttribute('aria-label')).toBe(original.getAttribute('aria-label'));
  expect(image.querySelector('svg')).not.toBeNull();expect(image.querySelector('details, ul')).toBeNull();
  expect(view.container.querySelector('.mermaid')!.getAttribute('role')).toBeNull();
  cleanup();
 }}finally{globalThis.IntersectionObserver=saved;}
});
sourceTest('locally highlights all bash and yaml code without changing a single command, indentation or newline',async()=>{
 const page=await renderedPage();const codes=page.querySelectorAll('.layout pre code');const originals=main().querySelectorAll('pre code');expect(codes).toHaveLength(24);
 codes.forEach((el,index)=>{expect(el.textContent).toBe(originals[index].textContent);expect(el.getAttribute('class')).toBe(originals[index].getAttribute('class'));if(el.className.startsWith('language-'))expect(el.querySelector('[class^="hljs-"]')).not.toBeNull();});
});
test('contains no remote executable dependencies, unsafe URLs, raw legacy scripts or inline handlers',async()=>{
 const page=(await renderedPage()).querySelector('.kubernetes-guide')!;expect(page.querySelector('script,style,iframe,form')).toBeNull();
 for(const el of page.querySelectorAll('*'))for(const attr of [...el.attributes]){expect(attr.name.startsWith('on')).toBe(false);if(['href','src'].includes(attr.name))expect(attr.value).not.toMatch(/^\s*(javascript:|data:text\/html)/i);}
 expect(readFileSync(new URL('./page.mdx',import.meta.url),'utf8')).not.toMatch(/cdn\.jsdelivr\.net|cdnjs\.cloudflare\.com/);
});
sourceTest('detects missing cells, list items, references, emphasis and commands',async()=>{
 for(const selector of ['td','.prose li','.ref-card .chip','strong','pre code']){
  const page=await renderedPage();const item=page.querySelector(`.layout ${selector}`)!;const section=item.closest('section')!;const original=sourceDocument.getElementById(section.id)!;
  expect(canonical(section)).toEqual(canonical(original));item.remove();expect(canonical(section)).not.toEqual(canonical(original));
 }
});
sourceTest('detects lost round dots, ordered marker colors, numbering and checkbox counters',()=>{
 const css=postcss.parse(readFileSync(new URL('./hacking-kubernetes.css',import.meta.url),'utf8'));
 for(const selector of ['.prose ul>li::before','.prose ol>li::marker','.check-num::before']){
  expect(declarations(sourceCss,selector).length).toBeGreaterThan(0);
  expect(declarations(css,`${scope} ${selector}`)).toEqual(declarations(sourceCss,selector));
  const broken=css.clone();broken.walkRules(`${scope} ${selector}`,r=>{r.remove();});expect(declarations(broken,`${scope} ${selector}`)).not.toEqual(declarations(sourceCss,selector));
 }
 const broken=css.clone();broken.walkRules(`${scope} .prose ol`,r=>{r.walkDecls('list-style-type',d=>{d.remove();});});expect(declarations(css,`${scope} .prose ol`)).toContain('list-style-type:decimal');expect(declarations(broken,`${scope} .prose ol`)).not.toContain('list-style-type:decimal');
});
