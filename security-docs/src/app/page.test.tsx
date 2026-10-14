import {expect,test} from 'bun:test';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import HomePage from './page';
import {docsConfig} from '@/config/docs';
const page=()=>new DOMParser().parseFromString(renderToStaticMarkup(createElement(HomePage)),'text/html');
test('home Security Guides card links to WAHH exactly once with the global navigation label',()=>{
 const doc=page();const links=doc.querySelectorAll('#library a[href="/docs/web-application-hackers-handbook"]');expect(links).toHaveLength(1);
 expect(links[0].textContent).toBe("Web Application Hacker's Handbook");expect(links[0].closest('article')!.querySelector('h3')!.textContent).toBe('Security Guides');
});
test('home library preserves every registered route in order and reports seventeen field guides',()=>{
 const doc=page();const links=doc.querySelectorAll('#library a');expect(links).toHaveLength(17);expect([...links].map(a=>a.getAttribute('href'))).toEqual(docsConfig.sidebarNav.flatMap(group=>group.items).map(item=>item.href));
 expect(doc.querySelector('.hero-metrics strong')!.textContent).toBe('17');
});
