import {expect,test} from 'bun:test';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import HomePage from './page';
import {docsConfig} from '@/config/docs';
const registeredCount=docsConfig.sidebarNav.flatMap(section=>section.items).length;
const page=()=>new DOMParser().parseFromString(renderToStaticMarkup(createElement(HomePage)),'text/html');
test('home Security Guides card links to WAHH exactly once with the global navigation label',()=>{
 const doc=page();const links=doc.querySelectorAll('#library a[href="/docs/web-application-hackers-handbook"]');expect(links).toHaveLength(1);
 expect(links[0].textContent).toBe("Web Application Hacker's Handbook");expect(links[0].closest('article')!.querySelector('h3')!.textContent).toBe('Security Guides');
});
test('home library preserves every registered route in order and reports the registered field guide count',()=>{
 const doc=page();const links=doc.querySelectorAll('#library a');expect(links).toHaveLength(registeredCount);expect([...links].map(a=>a.getAttribute('href'))).toEqual(docsConfig.sidebarNav.flatMap(group=>group.items).map(item=>item.href));
 expect(doc.querySelector('.hero-metrics strong')!.textContent).toBe(String(registeredCount).padStart(2,'0'));
});
test('home header exposes the same complete global guide navigation as documentation pages',()=>{
 const doc=page();const nav=doc.querySelector('header nav[aria-label="グローバルナビゲーション"]');expect(nav).not.toBeNull();expect(nav!.querySelectorAll('a')).toHaveLength(registeredCount);expect(nav!.querySelector('a[href="/docs/web-application-hackers-handbook"]')).not.toBeNull();expect(doc.querySelector('header [aria-label="ガイド"]')).not.toBeNull();
});
