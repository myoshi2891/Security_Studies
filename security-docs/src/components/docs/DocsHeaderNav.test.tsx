import {afterEach,expect,test} from 'bun:test';
import {cleanup,fireEvent,render,screen} from '@testing-library/react';
import {Window} from 'happy-dom';
import {readFileSync} from 'node:fs';
import {DocsHeaderNav} from './DocsHeaderNav';
import {docsConfig} from '@/config/docs';
afterEach(cleanup);
const open=()=>{const button=screen.getByRole('button',{name:'ドキュメントメニュー'});fireEvent.click(button);return button;};
test('opens a clearly labelled guide menu, focuses its filter and shows all seventeen registered links',()=>{
 render(<DocsHeaderNav/>);const button=open();expect(button).toHaveTextContent('ガイド一覧');const input=screen.getByRole('searchbox',{name:'ガイドを絞り込む'});expect(document.activeElement).toBe(input);expect(screen.getByRole('status')).toHaveTextContent('17件');
 expect(screen.getAllByRole('link')).toHaveLength(17);expect(screen.getByRole('link',{name:"Web Application Hacker's Handbook"})).toHaveAttribute('href','/docs/web-application-hackers-handbook');
});
test('filters names without case or full-width differences and clears the query when reopening',()=>{
 render(<DocsHeaderNav/>);const button=open(),input=screen.getByRole('searchbox',{name:'ガイドを絞り込む'});fireEvent.change(input,{target:{value:'ＨＡＣＫＥＲ'}});expect(screen.getAllByRole('link')).toHaveLength(1);expect(screen.getByRole('status')).toHaveTextContent('1件');
 fireEvent.keyDown(document,{key:'Escape'});expect(button).toHaveAttribute('aria-expanded','false');expect(document.activeElement).toBe(button);fireEvent.click(button);expect(screen.getByRole('searchbox')).toHaveValue('');expect(screen.getAllByRole('link')).toHaveLength(17);
});
test('filters categories and hides empty categories without changing registered routes',()=>{
 render(<DocsHeaderNav/>);open();fireEvent.change(screen.getByRole('searchbox'),{target:{value:'Security Guides'}});expect(screen.getAllByRole('link')).toHaveLength(6);expect(screen.queryByText('Advanced Topics')).toBeNull();expect(screen.getByText('Security Guides')).toBeVisible();
});
test('shows a useful empty state and restores the entire menu after clearing',()=>{
 render(<DocsHeaderNav/>);open();const input=screen.getByRole('searchbox');fireEvent.change(input,{target:{value:'no-such-guide'}});expect(screen.queryAllByRole('link')).toHaveLength(0);expect(screen.getByText('該当するガイドがありません')).toBeVisible();fireEvent.click(screen.getByRole('button',{name:'絞り込みを解除'}));expect(screen.getAllByRole('link')).toHaveLength(17);expect(document.activeElement).toBe(input);
});
test('new categories and eighty future pages are reflected from configuration without component edits',()=>{
 docsConfig.sidebarNav.push({title:'Future Guides',items:Array.from({length:80},(_,i)=>({title:`Future Guide ${i}`,href:`/docs/future-${i}`}))});
 try{render(<DocsHeaderNav/>);open();expect(screen.getAllByRole('link')).toHaveLength(97);expect(screen.getByRole('status')).toHaveTextContent('97件');fireEvent.change(screen.getByRole('searchbox'),{target:{value:'Future Guide 79'}});expect(screen.getAllByRole('link')).toHaveLength(1);expect(screen.getByRole('link',{name:'Future Guide 79'})).toHaveAttribute('href','/docs/future-79');}
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
