import {expect,test} from 'bun:test';
import {Window} from 'happy-dom';
import {readFileSync} from 'node:fs';
import {diagramConfig} from './MermaidFigure';
test('source sequence and flowchart configuration retains sizing, spacing and dark palette',()=>{
 expect(diagramConfig.theme).toBe('dark');
 expect(diagramConfig.flowchart).toMatchObject({rankSpacing:50,nodeSpacing:45,useMaxWidth:false});
 expect(diagramConfig).toMatchObject({sequence:{useMaxWidth:false,mirrorActors:true,messageFontSize:16,noteFontSize:16,actorFontSize:16}});
});
test('actual cascade preserves decimal numbering, custom bullets, checkbox focus and drawer/diagram layout',async()=>{
 const css=['../../globals.css','../docs-layout.css','./bulletproof-tls-guide.css'].map(f=>readFileSync(new URL(f,import.meta.url),'utf8')).join('\n');
 for(const width of [375,768,1024,1025,1440]){const w=new Window();w.happyDOM.setWindowSize({width,height:900});try{
 w.document.head.innerHTML='<style>'+css+'</style>';
 w.document.body.innerHTML='<main class="docs-main"><article class="prose docs-article"><div class="bulletproof-tls-guide"><aside class="sidebar"></aside><div class="backdrop"></div><div class="guide-content"><section id="s1"><h2>題</h2><ul><li>点</li></ul><ol><li>番号</li></ol><div class="mermaid-box mermaid"><div class="diagram-viewport"><svg style="width:2400px"></svg></div></div></section></div></div></article></main>';
 const style=(q:string)=>w.getComputedStyle(w.document.querySelector(q)!);
 expect(style('ol').listStyleType).toBe('decimal');expect(style('ol').paddingLeft).toBe('28px');expect(style('ul').listStyleType).toBe('none');expect(style('ul li').paddingLeft).toBe('24px');
 expect(style('.guide-content').marginLeft).toBe(width>1024?'300px':'0px');expect(style('.sidebar').top).toBe('64px');expect(style('.sidebar').visibility).toBe(width>1024?'visible':'hidden');expect(style('.backdrop').display).toBe('none');
 expect(style('h2').scrollMarginTop).toBe('88px');expect(style('.diagram-viewport').overflowX).toBe('auto');expect(style('svg').width).toBe('2400px');expect(style('svg').maxWidth).toBe('none');expect(style('svg').marginLeft).toBe('auto');expect(style('svg').marginRight).toBe('auto');
 }finally{await w.happyDOM.close();}}
});
