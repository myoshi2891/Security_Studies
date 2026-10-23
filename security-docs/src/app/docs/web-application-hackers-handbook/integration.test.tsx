import { expect, test } from 'bun:test';
import { existsSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import postcss from 'postcss';
import { docsConfig } from '@/config/docs';
import { getSearchIndex } from '@/lib/search';
import { canonical, declarations, evaluatedPage, renderedPage, scope, sourceCss, sourceDocument, sourceHtml, sourceTest } from './fidelity-helpers';
const inventory=JSON.parse(readFileSync(new URL('../../../../../docs/migration-inventory/web-application-hackers-handbook.json',import.meta.url),'utf8'));
const main=() => sourceDocument.querySelector('main')!;
const bodyElements=(el:Element,selector:string)=>[...el.querySelectorAll(selector)].filter(node=>node.matches('.mermaid-target')||!node.closest('.mermaid-target'));

// MD 原本は HTML 原本と独立に存在判定する
const markdownSource=new URL('../../../../../archive/security-guides/Web-application-hackers-handbook-guide.md',import.meta.url);
test.skipIf(!existsSync(markdownSource))('keeps the archived Markdown original byte-for-byte unchanged',()=>{
 expect(createHash('sha256').update(readFileSync(markdownSource)).digest('hex')).toBe(inventory.markdownSha256);
});
sourceTest('keeps the original HTML byte-for-byte unchanged and every source chapter, reference and footer in order',async()=>{
 expect(createHash('sha256').update(sourceHtml).digest('hex')).toBe(inventory.sha256);
 const page=(await renderedPage()).querySelector('.main')!;
 const children=(el:Element)=>[...el.childNodes].map(canonical).filter(value=>value!==null);
 expect(children(page)).toEqual(children(main()));
 for(const [selector,count] of Object.entries(inventory.counts)){
  expect(bodyElements(main(),selector).length,`source ${selector}`).toBe(count as number);
  expect(bodyElements(page,selector).length,selector).toBe(count as number);
 }
});
test('registers the page exactly once in Security Guides without changing existing items',()=>{
 expect(docsConfig.sidebarNav.find(group=>group.title==='Security Guides')!.items).toContainEqual({title:"Web Application Hacker's Handbook",href:'/docs/web-application-hackers-handbook'});
 expect(docsConfig.sidebarNav.flatMap(group=>group.items).filter(item=>item.href==='/docs/web-application-hackers-handbook')).toHaveLength(1);
});
sourceTest('indexes all 127 original headings including inline-code headings with the original title and metadata',async()=>{
 const metadata=(await evaluatedPage()).metadata as {title:string;description:string};
 expect(metadata.title).toBe(main().querySelector('h1')!.textContent!);expect(metadata.description).toContain('Handbook');
 const result=(await getSearchIndex()).filter(item=>item.href==='/docs/web-application-hackers-handbook');
 expect(result).toHaveLength(1);expect(result[0].title).toBe(metadata.title);
 const headings=[...main().querySelectorAll('h1,h2,h3,h4,h5,h6')].map(el=>el.textContent!.replace(/\s+/g,' ').trim());expect(headings).toHaveLength(127);expect(result[0].headings).toEqual(headings);
});
test('serves all headings through the static search index and preserves the existing documents',async()=>{
 const index=JSON.parse(readFileSync(new URL('../../../../public/search-index.json',import.meta.url),'utf8'));
 expect(index).toEqual(await getSearchIndex());expect(index).toHaveLength(docsConfig.sidebarNav.flatMap(group=>group.items).length);
 const page=index.filter((item:{href:string})=>item.href==='/docs/web-application-hackers-handbook');expect(page).toHaveLength(1);expect(page[0].headings).toHaveLength(127);
});
sourceTest('preserves the original TOC labels, inline code, order, source anchors and every reference target',async()=>{
 const page=await renderedPage();const ids=[...page.querySelectorAll('[id]')].map(el=>el.id);expect(new Set(ids).size).toBe(ids.length);
 expect(ids).toEqual(inventory.ids);
 expect(canonical(page.querySelector('.sidebar nav')!)).toEqual(canonical(sourceDocument.querySelector('.sidebar nav')!));
 const original=[...sourceDocument.querySelectorAll('a[href^="#"]')].map(el=>el.getAttribute('href'));
 const migrated=[...page.querySelectorAll('a[href^="#"]')].map(el=>el.getAttribute('href'));expect(migrated).toEqual(original);
 for(const href of migrated)expect(page.getElementById(href!.slice(1)),href!).not.toBeNull();
});
sourceTest('retains all source diagram hooks and full definitions',async()=>{
 const page=await renderedPage();const figures=[...page.querySelectorAll('.mermaid-target')];expect(figures).toHaveLength(16);
 for(const figure of figures){const original=sourceDocument.querySelector(`[data-diagram="${figure.getAttribute('data-diagram')}"]`)!;
  expect(figure.getAttribute('role')).toBe(original.getAttribute('role'));expect(figure.getAttribute('aria-label')).toBe(original.getAttribute('aria-label'));
 }
});
sourceTest('locally highlights all Python and JavaScript code without changing a single command, indentation or newline',async()=>{
 const page=await renderedPage();const codes=page.querySelectorAll('.main pre code');const originals=main().querySelectorAll('pre code');expect(codes).toHaveLength(7);
 codes.forEach((el,index)=>{expect(el.textContent).toBe(originals[index].textContent);expect(el.getAttribute('class')).toBe(originals[index].getAttribute('class'));if(el.className.startsWith('language-'))expect(el.querySelector('[class^="hljs-"]')).not.toBeNull();});
});
test('contains no remote executable dependencies, unsafe URLs, raw legacy scripts or inline handlers',async()=>{
 const page=(await renderedPage()).querySelector('.wahh-guide')!;expect(page.querySelector('script,style,iframe,form')).toBeNull();
 for(const el of page.querySelectorAll('*'))for(const attr of [...el.attributes]){expect(attr.name.startsWith('on')).toBe(false);if(['href','src'].includes(attr.name))expect(attr.value).not.toMatch(/^\s*(javascript:|data:text\/html)/i);}
 expect(readFileSync(new URL('./page.mdx',import.meta.url),'utf8')).not.toMatch(/cdn\.jsdelivr\.net|cdnjs\.cloudflare\.com/);
});
sourceTest('detects missing cells, list items, references, emphasis and commands',async()=>{
 for(const selector of ['td','.prose li','.ref .ref-title','strong','pre code']){
  const page=await renderedPage();const item=page.querySelector(`.main section ${selector}`)!;const section=item.closest('section')!;const original=sourceDocument.getElementById(section.id)!;
  expect(canonical(section)).toEqual(canonical(original));item.remove();expect(canonical(section)).not.toEqual(canonical(original));
 }
});
sourceTest('detects lost round dots and checklist counters',()=>{
 const css=postcss.parse(readFileSync(new URL('./web-application-hackers-handbook.css',import.meta.url),'utf8'));
 for(const selector of ['.prose ul > li::before','ul.checklist .num::before']){
  expect(declarations(sourceCss,selector).length).toBeGreaterThan(0);
  expect(declarations(css,`${scope} ${selector}`)).toEqual(declarations(sourceCss,selector));
  const broken=css.clone();broken.walkRules(`${scope} ${selector}`,r=>{r.remove();});expect(declarations(broken,`${scope} ${selector}`)).not.toEqual(declarations(sourceCss,selector));
 }
 const broken=css.clone();broken.walkRules(`${scope} .prose ol`,r=>{r.walkDecls('list-style-type',d=>{d.remove();});});expect(declarations(css,`${scope} .prose ol`)).toContain('list-style-type:decimal');expect(declarations(broken,`${scope} .prose ol`)).not.toContain('list-style-type:decimal');
});

const priorRoutes=["/docs/approach","/docs/architecture","/docs/ai-coding-safety","/docs/llm-ai-security","/docs/secdev-guide","/docs/secure-by-design","/docs/hacking-kubernetes","/docs/supply-chain","/docs/pqc","/docs/owasp","/docs/threat-landscape","/docs/mitre-atlas","/docs/ccie-security","/docs/ccst-cybersecurity","/docs/certifications","/docs/archive/approach"];
test('preserves every prior route exactly once after regrouping domains',()=>{
 const routes=docsConfig.sidebarNav.flatMap(group=>group.items).map(item=>item.href);
 expect(routes.filter(href=>priorRoutes.includes(href)).sort()).toEqual([...priorRoutes].sort());
 expect(new Set(routes).size).toBe(routes.length);
});
