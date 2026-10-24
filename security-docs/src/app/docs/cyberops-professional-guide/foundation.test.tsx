import {expect,test} from 'bun:test';
import {readFileSync} from 'node:fs';
import postcss from 'postcss';
import {docsConfig} from '../../../config/docs';
import {sourceTest,sourceDocument,sourceCss,definitions,scope,canonical,renderedPage,evaluatedPage} from './fidelity-helpers';
sourceTest('hero, brand SVG and entire original numbered sidebar retain all content',async()=>{const page=await renderedPage();for(const selector of ['.hero','.brand','.sidebar nav'])expect(canonical(page.querySelector(selector)!)).toEqual(canonical(sourceDocument.querySelector(selector)!));});
sourceTest('every original CSS declaration and media ancestry survives including marker colors',()=>{
 const actual=postcss.parse(readFileSync(new URL('./cyberops-professional-guide.css',import.meta.url),'utf8'));
 const ancestry=(r:postcss.Rule)=>{const a:string[]=[];for(let p=r.parent;p&&p.type==='atrule';p=p.parent)a.unshift((p as postcss.AtRule).name+' '+(p as postcss.AtRule).params);return a.join('/');};
 sourceCss.walkRules(rule=>{const selector=rule.selector.split(',').map(s=>{s=s.trim();if([':root','html','body'].includes(s))return scope;return scope+' '+s.replace(/\bmain\b/g,'.guide-content');}).join(', ');const found:string[]=[];actual.walkRules(selector,r=>{if(ancestry(r)===ancestry(rule))r.walkDecls(d=>{found.push(d.prop+':'+d.value);});});rule.walkDecls(d=>expect(found,selector).toContain(d.prop+':'+d.value));});
});
test('metadata and certification navigation register CyberOps exactly once',async()=>{const page=await evaluatedPage();expect(page.metadata).toMatchObject({title:'Cisco Certified CyberOps Professional 初学者向けステップバイステップ完全ガイド'});const items=docsConfig.sidebarNav.find(g=>g.id==='learning')!.items;expect(items.filter(i=>i.href==='/docs/cyberops-professional-guide')).toHaveLength(1);});
sourceTest('all 42 Mermaid definitions remain verbatim',async()=>{const {diagrams}=await import(new URL('./diagrams.ts',import.meta.url).href);expect(Object.entries(diagrams)).toEqual([...definitions]);});
