import {afterEach,expect,test} from 'bun:test';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {createElement} from 'react';
import {cleanup,render,fireEvent} from '@testing-library/react';
import {docsConfig} from '@/config/docs';
import HomePage from '@/app/page';
import {DocsHeaderNav} from '@/components/docs/DocsHeaderNav';
import {getSearchIndex} from '@/lib/search';
import {canonical,evaluatedPage,renderedPage,sourceDocument,sourceHtml,definitions} from './fidelity-helpers';
afterEach(cleanup);
const route='/docs/applied-cryptography-guide';
const inventory=JSON.parse(readFileSync(new URL('../../../../../docs/migration-inventory/applied-cryptography-guide.json',import.meta.url),'utf8'));

test('both original files retain their immutable hashes and all main children retain their order',async()=>{
 expect(createHash('sha256').update(sourceHtml).digest('hex')).toBe(inventory.htmlSha256);
 expect(createHash('sha256').update(readFileSync(new URL('../../../../../archive/md/Applied-cryptography-guide.md',import.meta.url))).digest('hex')).toBe(inventory.markdownSha256);
 const children=(el:Element)=>[...el.childNodes].map(canonical).filter(v=>v!==null);
 expect(children((await renderedPage()).querySelector('.main')!)).toEqual(children(sourceDocument.querySelector('main')!));
});
test('every original table cell, list item, answer, link and code appears in order with its styling hooks',async()=>{
 const main=sourceDocument.querySelector('main')!,page=(await renderedPage()).querySelector('.main')!;
 for(const selector of ['h1','h2','h3','table','th','td','ul','ol','li','pre code','a','.qa','.ref','details','summary','strong','em']){
  const values=(el:Element)=>[...el.querySelectorAll(selector)].filter(n=>!n.closest('.diagram')).map(canonical);
  expect(values(page),selector).toEqual(values(main));
 }
});
test('the original sixteen TOC entries resolve uniquely and every source ID survives',async()=>{
 const page=await renderedPage();
 expect(canonical(page.querySelector('.sidebar nav')!)).toEqual(canonical(sourceDocument.querySelector('.sidebar nav')!));
 const originalIds=[...sourceDocument.querySelectorAll('[id]')].map(el=>el.id);
 const ids=[...page.querySelectorAll('[id]')].map(el=>el.id);
 expect(new Set(ids).size).toBe(ids.length);expect([...ids].sort()).toEqual([...originalIds].sort());
 expect(page.querySelectorAll('.sidebar nav a')).toHaveLength(16);
 for(const link of page.querySelectorAll('a[href^="#"]'))expect(page.getElementById(link.getAttribute('href')!.slice(1))).not.toBeNull();
});
test('all fourteen rendered diagram hooks carry their exact source definition',async()=>{
 const figures=(await renderedPage()).querySelectorAll('.diagram');expect(figures).toHaveLength(14);
 expect([...sourceDocument.querySelectorAll('.diagram')].map(el=>el.id)).toEqual([...figures].map(el=>el.id));
 for(const figure of figures)expect(figure.getAttribute('data-definition')).toBe(definitions.get(figure.getAttribute('data-diagram')!)!);
});
test('Next metadata and dynamic search preserve every original heading including numbered compound headings',async()=>{
 const metadata=(await evaluatedPage()).metadata as {title:string;description:string};expect(metadata.title).toBe(sourceDocument.querySelector('h1')!.textContent);expect(metadata.description).toContain('AEAD');
 const headings=[...sourceDocument.querySelectorAll('h1,h2,h3,h4,h5,h6')].map(el=>el.textContent!.replace(/\s+/g,' ').trim());
 const index=(await getSearchIndex()).filter(item=>item.href===route);expect(index).toHaveLength(1);expect(index[0].title).toBe(metadata.title);expect(index[0].headings).toEqual(headings);expect(headings).toHaveLength(65);
});
test('registers exactly once in Security Guides and exposes the original title',()=>{
 const group=docsConfig.sidebarNav.find(group=>group.title==='Security Guides')!;expect(group.items).toContainEqual({title:'Applied Cryptography',href:route});expect(docsConfig.sidebarNav.flatMap(g=>g.items).filter(item=>item.href===route)).toHaveLength(1);
});
test('home library and global header navigation both expose the migrated route',()=>{
 const home=render(createElement(HomePage));expect(home.container.querySelectorAll(`#library a[href="${route}"]`)).toHaveLength(1);home.unmount();
 const menu=render(createElement(DocsHeaderNav));fireEvent.click(menu.getByRole('button',{name:/ガイド/}));expect(menu.getByRole('link',{name:'Applied Cryptography'})).toHaveAttribute('href',route);
});
test('static search matches the dynamic index and includes all registered routes',async()=>{
 const index=JSON.parse(readFileSync(new URL('../../../../public/search-index.json',import.meta.url),'utf8'));expect(index).toEqual(await getSearchIndex());expect(index.filter((item:{href:string})=>item.href===route)).toHaveLength(1);expect(index).toHaveLength(docsConfig.sidebarNav.flatMap(g=>g.items).length);
});
test('contains no legacy scripts, executable remote assets, unsafe URLs or inline event attributes',async()=>{
 const page=(await renderedPage()).querySelector('.applied-guide')!;expect(page.querySelector('script,style,iframe,form')).toBeNull();
 for(const el of page.querySelectorAll('*'))for(const attr of [...el.attributes]){expect(attr.name.startsWith('on')).toBe(false);if(['href','src'].includes(attr.name))expect(attr.value).not.toMatch(/^\s*(javascript:|data:text\/html)/i);}
 expect(readFileSync(new URL('./page.mdx',import.meta.url),'utf8')).not.toMatch(/cdn\.jsdelivr\.net|cdnjs\.cloudflare\.com/);
});
