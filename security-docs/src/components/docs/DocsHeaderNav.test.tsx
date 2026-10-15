import {afterEach,beforeEach,expect,test} from 'bun:test';
import {cleanup,fireEvent,render,screen} from '@testing-library/react';
import {Window} from 'happy-dom';
import {readFileSync} from 'node:fs';
import {DocsHeaderNav} from './DocsHeaderNav';
import {docsConfig} from '@/config/docs';
afterEach(cleanup);
const registeredCount=docsConfig.sidebarNav.flatMap(section=>section.items).length;
const navCss=readFileSync(new URL('./DocsHeaderNav.css',import.meta.url),'utf8');
/** 実CSSと画面幅を適用し、表示中の可視ラベルだけがアクセシブルネームになる状態を再現する */
const viewport=(width:number)=>{(window as unknown as Window).happyDOM.setWindowSize({width,height:900});document.head.innerHTML=`<style>${navCss}</style>`;};
beforeEach(()=>viewport(1440));
afterEach(()=>{document.head.innerHTML='';});
const open=()=>{const button=screen.getByRole('button',{name:'ガイド一覧'});fireEvent.click(button);return button;};
test('toggle uses each visible label as its accessible name instead of a fixed aria-label',()=>{
 for(const [width,label] of [[1440,'ガイド一覧'],[375,'ガイド']] as const){viewport(width);const view=render(<DocsHeaderNav/>);const button=screen.getByRole('button',{name:label});expect(button).not.toHaveAttribute('aria-label');view.unmount();}
});
test('opens a clearly labelled guide menu, focuses its filter and shows all registered links',()=>{
 render(<DocsHeaderNav/>);const button=open();expect(button).toHaveTextContent('ガイド一覧');const input=screen.getByRole('searchbox',{name:'ガイドを絞り込む'});expect(document.activeElement).toBe(input);expect(screen.getByRole('status')).toHaveTextContent(`${registeredCount}件`);
 expect(screen.getAllByRole('link')).toHaveLength(registeredCount);expect(screen.getByRole('link',{name:"Web Application Hacker's Handbook"})).toHaveAttribute('href','/docs/web-application-hackers-handbook');
});
test('filters names without case or full-width differences and clears the query when reopening',()=>{
 render(<DocsHeaderNav/>);const button=open(),input=screen.getByRole('searchbox',{name:'ガイドを絞り込む'});fireEvent.change(input,{target:{value:'ＨＡＣＫＥＲ'}});expect(screen.getAllByRole('link')).toHaveLength(1);expect(screen.getByRole('status')).toHaveTextContent('1件');
 fireEvent.keyDown(document,{key:'Escape'});expect(button).toHaveAttribute('aria-expanded','false');expect(document.activeElement).toBe(button);fireEvent.click(button);expect(screen.getByRole('searchbox')).toHaveValue('');expect(screen.getAllByRole('link')).toHaveLength(registeredCount);
});
test('filters categories and hides empty categories without changing registered routes',()=>{
 render(<DocsHeaderNav/>);open();fireEvent.change(screen.getByRole('searchbox'),{target:{value:'Security Guides'}});expect(screen.getAllByRole('link')).toHaveLength(docsConfig.sidebarNav.find(section=>section.title==='Security Guides')!.items.length);expect(screen.queryByText('Advanced Topics')).toBeNull();expect(screen.getByText('Security Guides')).toBeVisible();
});
test('shows a useful empty state and restores the entire menu after clearing',()=>{
 render(<DocsHeaderNav/>);open();const input=screen.getByRole('searchbox');fireEvent.change(input,{target:{value:'no-such-guide'}});expect(screen.queryAllByRole('link')).toHaveLength(0);expect(screen.getByText('該当するガイドがありません')).toBeVisible();fireEvent.click(screen.getByRole('button',{name:'絞り込みを解除'}));expect(screen.getAllByRole('link')).toHaveLength(registeredCount);expect(document.activeElement).toBe(input);
});
test('new categories and eighty future pages are reflected from configuration without component edits',()=>{
 docsConfig.sidebarNav.push({title:'Future Guides',items:Array.from({length:80},(_,i)=>({title:`Future Guide ${i}`,href:`/docs/future-${i}`}))});
 try{render(<DocsHeaderNav/>);open();expect(screen.getAllByRole('link')).toHaveLength(registeredCount+80);expect(screen.getByRole('status')).toHaveTextContent(`${registeredCount+80}件`);fireEvent.change(screen.getByRole('searchbox'),{target:{value:'Future Guide 79'}});expect(screen.getAllByRole('link')).toHaveLength(1);expect(screen.getByRole('link',{name:'Future Guide 79'})).toHaveAttribute('href','/docs/future-79');fireEvent.change(screen.getByRole('searchbox'),{target:{value:'/docs/future-79'}});expect(screen.queryAllByRole('link')).toHaveLength(0);expect(screen.getByRole('status')).toHaveTextContent('0件');}
 finally{docsConfig.sidebarNav.pop();}
});
test('selection and outside clicks close the shared menu and unmount removes its handlers',()=>{
 const view=render(<DocsHeaderNav/>);const button=open();fireEvent.click(screen.getByRole('link',{name:"Web Application Hacker's Handbook"}));expect(button).toHaveAttribute('aria-expanded','false');fireEvent.click(button);fireEvent.pointerDown(document.body);expect(button).toHaveAttribute('aria-expanded','false');fireEvent.click(button);view.unmount();expect(()=>fireEvent.keyDown(document,{key:'Escape'})).not.toThrow();
});
test('menu filtering controls remain outside the category scroll area and viewport overflow works at phone and desktop widths',async()=>{
 const css=readFileSync(new URL('./DocsHeaderNav.css',import.meta.url),'utf8');
 for(const width of [375,1440]){const w=new Window();try{w.happyDOM.setWindowSize({width,height:900});w.document.head.innerHTML=`<style>${css}</style>`;w.document.body.innerHTML='<div class="docs-header-nav"><button class="docs-nav-toggle"><span class="docs-nav-label-full">ガイド一覧</span><span class="docs-nav-label-short">ガイド</span></button><nav class="docs-global-navigation"><div class="docs-nav-toolbar"></div><div class="docs-nav-groups"></div></nav></div>';
 const style=(s:string)=>w.getComputedStyle(w.document.querySelector(s)!);expect(style('.docs-global-navigation').maxHeight).toContain('100dvh');expect(style('.docs-global-navigation').display).toBe('flex');expect(style('.docs-nav-groups').overflowY).toBe('auto');expect(style('.docs-nav-groups').minHeight).toBe('0px');expect(style('.docs-nav-label-short').display).toBe(width<=640?'inline':'none');expect(style('.docs-nav-label-full').display).toBe(width<=640?'none':'inline');
 }finally{await w.happyDOM.close();}}
});
test('phone header keeps search compact so the labelled guide button remains reachable at 320px and 375px',async()=>{
 const css=['../../app/globals.css','../../app/docs/docs-layout.css','./DocsHeaderNav.css'].map(file=>readFileSync(new URL(file,import.meta.url),'utf8')).join('\n');
 for(const width of [320,375]){const w=new Window();try{w.happyDOM.setWindowSize({width,height:900});w.document.head.innerHTML=`<style>${css}</style>`;w.document.body.innerHTML='<header class="docs-header"><div class="docs-header-inner"><div><a>Security Studies 2026</a></div><div class="docs-header-nav"><button class="docs-nav-toggle">ガイド</button></div><button id="global-search"><svg></svg><span>Search...</span></button></div></header>';
 const button=w.document.querySelector('#global-search')!,label=button.querySelector('span')!;expect(w.getComputedStyle(button).width).toBe('40px');expect(w.getComputedStyle(button).minWidth).toBe('40px');expect(w.getComputedStyle(label).position).toBe('absolute');expect(w.getComputedStyle(label).width).toBe('1px');expect(label.textContent).toBe('Search...');
 }finally{await w.happyDOM.close();}}
});
