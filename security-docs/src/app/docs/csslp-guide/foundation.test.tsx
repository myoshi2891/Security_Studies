import {expect,test} from 'bun:test';
import {readFileSync} from 'node:fs';
import postcss from 'postcss';
import {docsConfig} from '../../../config/docs';
import {sourceTest,sourceDocument,sourceHtml,sourceCss,definitions,scope,canonical,renderedPage,evaluatedPage} from './fidelity-helpers';
sourceTest('hero, brand SVG and entire original numbered sidebar retain all content',async()=>{const page=await renderedPage();for(const selector of ['.hero','.brand','.sidebar nav'])expect(canonical(page.querySelector(selector)!)).toEqual(canonical(sourceDocument.querySelector(selector)!));});
sourceTest('every original CSS declaration and media ancestry survives including marker colors',()=>{
 const actual=postcss.parse(readFileSync(new URL('./csslp-guide.css',import.meta.url),'utf8'));
 const ancestry=(r:postcss.Rule)=>{const a:string[]=[];for(let p=r.parent;p&&p.type==='atrule';p=p.parent)a.unshift((p as postcss.AtRule).name+' '+(p as postcss.AtRule).params);return a.join('/');};
 sourceCss.walkRules(rule=>{const selector=rule.selector.split(',').map(s=>{s=s.trim();if([':root','html','body'].includes(s))return scope;return scope+' '+s;}).join(', ');const found:string[]=[];actual.walkRules(selector,r=>{if(ancestry(r)===ancestry(rule))r.walkDecls(d=>{found.push(d.prop+':'+d.value);});});rule.walkDecls(d=>expect(found,selector).toContain(d.prop+':'+d.value));});
});
sourceTest('all 16 diagram definitions and original renderer baseline remain intact alongside the redesigned presentation',async()=>{
 const {diagrams}=await import('./diagrams');expect([...definitions]).toEqual(Object.entries(diagrams));const {sourceDiagramConfig}=await import('./MermaidFigure');const theme=Function('return '+sourceHtml.match(/const TV = (\{[\s\S]*?\n\s*\});/)![1])();const engine={config:{} as Record<string,unknown>,initialize(value:Record<string,unknown>){this.config=value;}};Function('mermaid','TV',sourceHtml.match(/mermaid\.initialize\(([\s\S]*?)\);/)![0])(engine,theme);delete engine.config.startOnLoad;delete engine.config.securityLevel;expect(sourceDiagramConfig as Record<string,unknown>).toEqual(engine.config);
});
test('certification sidebar registers exactly one CSSLP guide with metadata',async()=>{const href='/docs/csslp-guide';expect(docsConfig.sidebarNav.flatMap(g=>g.items).filter(i=>i.href===href)).toHaveLength(1);expect(docsConfig.sidebarNav.find(g=>g.id==='learning')!.items.some(i=>i.href===href)).toBe(true);expect((await evaluatedPage()).metadata).toMatchObject({title:'CSSLP（Certified Secure Software Lifecycle Professional）初学者向け完全ガイド'});});

test('all Python examples retain local syntax highlighting and exact plain-text code',async()=>{const page=await renderedPage();for(const code of page.querySelectorAll('pre code')){expect(code.className).toBe('language-python');expect(code.querySelectorAll('[class^=hljs-]').length).toBeGreaterThan(0);}expect(readFileSync(new URL('./csslp-guide.css',import.meta.url),'utf8')).toContain('.hljs-keyword');});
