import {expect,test} from 'bun:test';
import {readFileSync} from 'node:fs';
import postcss from 'postcss';
import {canonical,renderedPage,sourceTest,sourceDocument,sourceCss,scope,declarations} from './fidelity-helpers';
sourceTest('hero, grouped 25-link TOC and complete footer preserve original structure and text',async()=>{
 const page=await renderedPage();for(const selector of ['.hero','.sidebar .brand','.sidebar nav','.footer'])expect(canonical(page.querySelector(selector)!)).toEqual(canonical(sourceDocument.querySelector(selector)!));
 expect(page.querySelectorAll('.sidebar nav a')).toHaveLength(25);expect(page.querySelectorAll('.nav-group')).toHaveLength(4);
});
sourceTest('all original CSS declarations and media contexts survive scoping including markers, badges and Q&A states',()=>{
 const actual=postcss.parse(readFileSync(new URL('./zero-trust-guide.css',import.meta.url),'utf8'));
 sourceCss.walkRules(rule=>{
 const selector=rule.selector.split(',').map(s=>{s=s.trim();return [':root','html','body'].includes(s)?scope:scope+' '+s.replace(/^main$/,'.guide-content');}).join(', ');
 const found:string[]=[];actual.walkRules(selector,r=>{if(r.parent?.type===rule.parent?.type && (r.parent?.type!=='atrule'||(r.parent as postcss.AtRule).params===(rule.parent as postcss.AtRule).params))r.walkDecls(d=>{found.push(`${d.prop}:${d.value}`);});});
 for(const decl of declarations(postcss.root().append(rule.clone()),rule.selector))expect(found,selector).toContain(decl);
 });
});
test('diagram theme preserves all source flowchart and sequence spacing without shared-engine mutation',async()=>{
 const {diagramConfig}=await import('./MermaidFigure');expect(diagramConfig).toMatchObject({theme:'dark',securityLevel:'strict',flowchart:{useMaxWidth:false,htmlLabels:true,nodeSpacing:70,rankSpacing:75,padding:12},sequence:{useMaxWidth:false,width:130,actorMargin:30,messageMargin:32,boxMargin:6,noteMargin:6},themeVariables:{primaryColor:'#16294a',noteBkgColor:'#2a2150',lineColor:'#8fa6d6',fontSize:'16px'}});
});
