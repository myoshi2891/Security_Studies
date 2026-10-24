import {afterEach,expect,test} from 'bun:test';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {Window} from 'happy-dom';
import postcss from 'postcss';
import {createElement} from 'react';
import {act,cleanup,fireEvent,render} from '@testing-library/react';
import {renderedPage} from './fidelity-helpers';
afterEach(cleanup);
const questionHashes=["4868115fbfbf7e41c4e6e7b71fc78e50a9296f16ed41165d00e95960e66bdf48","a079d7b815bb85052006ffff9b6cac222ce575c533ead30409058b01be7a7572","fa9d5080a6f23d4b388684755c23f36aafff8d232a93eabfca610331b06fe707","3304de6907c7a9f82a46ef3affb9493623a6e816ef9e868391a2fbd40df27ca8","41d451f3f44d6f2f542c30e02295fe182d70867d22cfb628ab7510e66f39da56","bb19abd0af24c8af46c4249e9c8454825f680d195b8179ea6f70dddc874ce24f","00df7771339bd47d70f77a544bed6a5c6be73e1d8af699ac94b50e13c4e3c493","735fb3f87aaebcde80d4061a5d13c5c1be165c2675ccc821b90ac9668fbf8608","8543e2830add7f695af23e2731ff6fa12b94297102407cf7a0ecec76d2b818dd","bc2bb358bb6a5b8f76d756abb9a499200a19b3ddb23e905cded3d837053a37de"];
const sheet=()=>{const tree=postcss.parse(['../../globals.css','../docs-layout.css','./csslp-guide.css'].map(f=>readFileSync(new URL(f,import.meta.url),'utf8')).join('\n'));tree.walkAtRules('import',r=>{r.remove();});return tree.toString();};
test('all 10 question cards separate complete original stems and all 40 lettered choices without changing text',async()=>{
 const page=await renderedPage();const cards=[...page.querySelectorAll('#s13 > p')];expect(cards).toHaveLength(10);
 for(const [i,card] of cards.entries()){expect(card.querySelector(':scope > strong')!.textContent).toBe('Q'+(i+1)+'.');expect(card.querySelectorAll(':scope > .practice-stem')).toHaveLength(1);expect(card.querySelectorAll(':scope > .practice-options')).toHaveLength(1);expect([...card.querySelectorAll('.practice-option-label')].map(e=>e.textContent)).toEqual(['A.','B.','C.','D.']);expect(card.querySelectorAll('.practice-option')).toHaveLength(4);expect(createHash('sha256').update(card.textContent!.replace(/\s+/g,' ').trim()).digest('hex')).toBe(questionHashes[i]);}
 expect([...page.querySelectorAll('#s13 details tbody tr td:nth-child(2)')].map(e=>e.textContent)).toEqual(['B','B','B','C','B','C','B','B','B','C']);
});
for(const width of [375,768,1440])test('question cards and all 16 diagram frames have deliberate responsive styling at '+width+'px',async()=>{
 const w=new Window({width,height:900});try{w.document.head.innerHTML='<style>'+sheet()+'</style>';w.document.body.innerHTML='<main class="docs-main"><article class="prose docs-article">'+(await renderedPage()).body.innerHTML+'</article></main>';// SSR intentionally shows loading text. Add the same drawing surface the renderer creates after loading.
 for(const figure of w.document.querySelectorAll('.mmd')){const viewport=w.document.createElement('div');viewport.className='diagram-viewport';figure.append(viewport);}
 const style=(s:string)=>w.getComputedStyle(w.document.querySelector(s)!);
 expect(style('#s13 > p').display).toBe('grid');expect(style('#s13 > p').borderRadius).toBe('16px');expect(style('#s13 > p').backgroundColor).toBe('#ffffff');expect(style('#s13 .practice-options').display).toBe('grid');expect(style('#s13 .practice-options').gridTemplateColumns).toBe(width>=768?'repeat(2, minmax(0, 1fr))':'minmax(0, 1fr)');expect(style('#s13 .practice-option').borderRadius).toBe('10px');expect(style('#s13 > p > strong').backgroundColor).toBe('#2e3f72');expect(style('#s13 details summary').minHeight).toBe('56px');
 expect(style('.mmd').borderRadius).toBe('18px');expect(style('.diagram-heading').display).toBe('flex');expect(style('.diagram-viewport').overflowX).toBe('auto');expect(style('.diagram-viewport').paddingTop).toBe(width<768?'16px':'24px');
 }finally{await w.happyDOM.close();}
});
test('every original diagram gets its own visible number and descriptive title without changing the definitions',async()=>{
 const page=await renderedPage();const figures=[...page.querySelectorAll('.mmd')];expect(figures).toHaveLength(16);const titles:string[]=[];
 for(const [i,figure] of figures.entries()){expect(figure.querySelector('.diagram-kicker')).toHaveTextContent('FIGURE '+String(i+1).padStart(2,'0'));const title=figure.querySelector('.diagram-title');expect(title).not.toBeNull();expect(title!.textContent!.length).toBeGreaterThan(5);titles.push(title!.textContent!);expect(figure.getAttribute('data-definition')).toBeTruthy();}expect(new Set(titles).size).toBe(16);
});
test('the new diagram theme uses readable local typography, softer edges and generous spacing per render',async()=>{
 const {diagramConfig}=await import('./MermaidFigure');expect(diagramConfig.themeVariables.primaryColor).toBe('#ffffff');expect(diagramConfig.themeVariables.fontFamily).toContain('Hiragino Sans');expect(diagramConfig.flowchart.curve).toBe('basis');expect(diagramConfig.flowchart.padding).toBe(18);expect(diagramConfig.flowchart.rankSpacing).toBe(56);expect(diagramConfig.themeCSS).toContain('rx: 12px');expect(diagramConfig.flowchart.useMaxWidth).toBe(false);
});
test('rendered small and wide diagrams keep intrinsic width and keyboard access inside the new frame',async()=>{
 const {MermaidFigure}=await import('./MermaidFigure');const saved=globalThis.IntersectionObserver;globalThis.IntersectionObserver=undefined as unknown as typeof IntersectionObserver;
 try{for(const width of [240,2400]){const view=render(createElement(MermaidFigure,{id:'d1',source:'flowchart LR\nA-->B',renderer:async()=>({svg:'<svg viewBox="0 0 '+width+' 160"></svg>'})}));await act(async()=>{});const svg=view.container.querySelector('svg')!;expect(svg).not.toBeNull();expect(svg.style.width).toBe(width+'px');expect(svg.style.maxWidth).toBe('none');expect(view.container.querySelector('.diagram-title')).toHaveTextContent('SDLC');expect(view.container.querySelector('.diagram-viewport')).toHaveAttribute('tabindex','0');view.unmount();}}
 finally{globalThis.IntersectionObserver=saved;}
});
test('the restyled answer disclosure remains native, keyboard-focusable and opens without losing any answers',async()=>{
 const {evaluatedPage}=await import('./fidelity-helpers');const saved=globalThis.IntersectionObserver;globalThis.IntersectionObserver=class{observe(){}disconnect(){}} as unknown as typeof IntersectionObserver;
 try{const {default:Page}=await evaluatedPage();const view=render(createElement(Page,{}));const disclosure=view.container.querySelector<HTMLDetailsElement>('#s13 details')!;expect(disclosure.open).toBe(false);const summary=disclosure.querySelector('summary')!;summary.focus();expect(document.activeElement).toBe(summary);fireEvent.click(summary);expect(disclosure.open).toBe(true);expect(disclosure.querySelectorAll('tbody tr')).toHaveLength(10);fireEvent.click(summary);expect(disclosure.open).toBe(false);}
 finally{globalThis.IntersectionObserver=saved;}
});
