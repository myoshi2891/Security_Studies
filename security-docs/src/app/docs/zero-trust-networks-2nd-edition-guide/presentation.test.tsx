import {afterEach,expect,test} from 'bun:test';
import {readFileSync} from 'node:fs';
import {Window} from 'happy-dom';
import {createElement} from 'react';
import {cleanup,render,waitFor} from '@testing-library/react';
import {MermaidFigure} from './MermaidFigure';
afterEach(cleanup);
test('the original dark color-scheme metadata remains effective for native controls inside the guide',async()=>{
 const w=new Window();try{w.document.head.innerHTML='<style>'+readFileSync(new URL('./zero-trust-guide.css',import.meta.url),'utf8')+'</style>';w.document.body.innerHTML='<div class="zero-trust-guide"><button>目次</button></div>';
 expect(w.getComputedStyle(w.document.querySelector('.zero-trust-guide')!).getPropertyValue('color-scheme')).toBe('dark');
 }finally{await w.happyDOM.close();}
});
test('oversized diagrams retain the original visible horizontal scroll hint and remove it for narrow diagrams',async()=>{
 const saved=globalThis.IntersectionObserver;globalThis.IntersectionObserver=undefined as unknown as typeof IntersectionObserver;
 const width=Object.getOwnPropertyDescriptor(HTMLElement.prototype,'clientWidth');Object.defineProperty(HTMLElement.prototype,'clientWidth',{configurable:true,get:()=>300});
 try{const renderer=async(_id:string,source:string)=>({svg:`<svg viewBox="0 0 ${source==='wide'?1800:200} 300"></svg>`});
 const view=render(createElement(MermaidFigure,{id:'d1',source:'wide',renderer}));await waitFor(()=>expect(view.container.querySelector('svg')).not.toBeNull());expect(view.container.querySelector('.scroll-hint')).toHaveTextContent('この図は横にスクロールできます');
 view.rerender(createElement(MermaidFigure,{id:'d1',source:'narrow',renderer}));await waitFor(()=>expect(view.container.querySelector('svg')?.style.width).toBe('200px'));expect(view.container.querySelector('.scroll-hint')).toBeNull();
 }finally{globalThis.IntersectionObserver=saved;if(width)Object.defineProperty(HTMLElement.prototype,'clientWidth',width);else Reflect.deleteProperty(HTMLElement.prototype,'clientWidth');}
});
