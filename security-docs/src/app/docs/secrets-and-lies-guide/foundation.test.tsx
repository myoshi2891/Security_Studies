import {expect,test} from 'bun:test';
import {readFileSync} from 'node:fs';
import postcss from 'postcss';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {canonical,renderedPage,sourceTest,sourceDocument,sourceCss,scope,declarations} from './fidelity-helpers';
sourceTest('hero, all eleven TOC links, source date and footer retain source text and structure',async()=>{
 const page=await renderedPage();for(const selector of ['.hero','.sidebar .brand','.sidebar nav','.side-foot','.footer'])expect(canonical(page.querySelector(selector)!)).toEqual(canonical(sourceDocument.querySelector(selector)!));expect(page.querySelectorAll('.sidebar nav a')).toHaveLength(11);
});
sourceTest('every source CSS declaration and media condition survives including round bullets, exercise counters and checkbox states',()=>{
 const actual=postcss.parse(readFileSync(new URL('./secrets-lies-guide.css',import.meta.url),'utf8'));
 sourceCss.walkRules(rule=>{const sel=rule.selector.split(',').map(s=>{s=s.trim();return [':root','html','body'].includes(s)?scope:scope+' '+s;}).join(', ');const found:string[]=[];
 actual.walkRules(sel,r=>{if(r.parent?.type===rule.parent?.type&&(r.parent?.type!=='atrule'||(r.parent as postcss.AtRule).params===(rule.parent as postcss.AtRule).params))r.walkDecls(d=>{found.push(`${d.prop}:${d.value}`);});});
 for(const decl of declarations(postcss.root().append(rule.clone()),rule.selector))expect(found,sel).toContain(decl);
 });
});
test('diagram configuration retains original dark theme, flow spacing and attack-tree gate palette',async()=>{
 const {diagramConfig}=await import('./MermaidFigure');const {diagrams}=await import('./diagrams');expect(diagramConfig).toMatchObject({theme:'dark',securityLevel:'strict',flowchart:{useMaxWidth:false,htmlLabels:true,nodeSpacing:44,rankSpacing:48,curve:'basis'},themeVariables:{background:'#07111e',primaryColor:'#1c2f55',lineColor:'#9fb4e6',fontSize:'16px'}});expect(Object.keys(diagrams)).toHaveLength(12);expect(diagrams.d7).toContain('class A1,B1,O1 gate');
});
test('zero-based source diagram IDs retain one-based accessible figure labels',async()=>{
 const {MermaidFigure}=await import('./MermaidFigure');const {diagrams}=await import('./diagrams');for(const [index,id] of Object.keys(diagrams).entries()){const html=renderToStaticMarkup(createElement(MermaidFigure,{id,source:diagrams[id as keyof typeof diagrams]}));expect(html).toContain(`図 ${index+1}`);expect(html).toContain(`data-id="${id}"`);}
});
