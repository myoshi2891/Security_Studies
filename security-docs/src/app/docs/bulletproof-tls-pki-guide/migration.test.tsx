import { expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import postcss from 'postcss';
import { docsConfig } from '../../../config/docs';
import { sectionContracts, sourceTest, sourceDocument, sourceCss, declarations, scope, canonical, renderedPage } from './fidelity-helpers';
sectionContracts(Array.from({length:15},(_,i)=>`s${i}`));
sourceTest('hero and complete numbered navigation retain all original structure',async()=>{
 const page=await renderedPage();
 for(const selector of ['.hero','.sidebar .brand','.sidebar nav']) expect(canonical(page.querySelector(selector)!)).toEqual(canonical(sourceDocument.querySelector(selector)!));
 expect(page.querySelectorAll('.sidebar nav a')).toHaveLength(15);
});
sourceTest('every source CSS rule including bullets, counters, checkbox states and responsive rules survives scoping',()=>{
 const actual=postcss.parse(readFileSync(new URL('./bulletproof-tls-guide.css',import.meta.url),'utf8'));
 // セレクターに加えて @media 等の祖先も一致させ、レスポンシブ規則が別条件の宣言と照合されないようにする
 const ancestry=(node:postcss.Rule)=>{const chain:string[]=[];for(let p=node.parent;p&&p.type==='atrule';p=p.parent){const at=p as postcss.AtRule;chain.unshift(`@${at.name} ${at.params}`);}return chain.join(' > ');};
 const declarationsIn=(css:postcss.Root,selector:string,context:string)=>{const values:string[]=[];css.walkRules(selector,r=>{if(ancestry(r)===context) r.walkDecls(d=>{values.push(`${d.prop}:${d.value}`);});});return values;};
 sourceCss.walkRules(rule=>{const sel=rule.selector.split(',').map(s=>{s=s.trim();return [':root','html','body'].includes(s)?scope:scope+' '+s.replace(/body\.menu-open /g,'').replace(/^main$/,'.guide-content');}).join(', ');
 const context=ancestry(rule);
 for(const declaration of declarations(postcss.root().append(rule.clone()),rule.selector)) expect(declarationsIn(actual,sel,context),`${context} ${rule.selector}`).toContain(declaration);
 });
});
test('route registered once in cloud and cryptography',()=>{
 expect(docsConfig.sidebarNav.flatMap(g=>g.items).filter(i=>i.href==='/docs/bulletproof-tls-pki-guide')).toHaveLength(1);
 expect(docsConfig.sidebarNav.find(g=>g.id==='platform')!.items.some(i=>i.href==='/docs/bulletproof-tls-pki-guide')).toBe(true);
});
test('safe compiled page has all 15 sections, 24 diagrams, 10 checkboxes and unique IDs',async()=>{
 const page=await renderedPage();expect(page.querySelectorAll('section[id]')).toHaveLength(15);expect(page.querySelectorAll('[data-diagram]')).toHaveLength(24);expect(page.querySelectorAll('input[type="checkbox"]')).toHaveLength(10);
 expect(page.querySelector('script,iframe,form,link')).toBeNull();const ids=[...page.querySelectorAll('[id]')].map(e=>e.id);expect(new Set(ids).size).toBe(ids.length);
 for(const el of page.querySelectorAll('*'))for(const a of el.attributes){expect(a.name).not.toMatch(/^on/i);if(['href','src'].includes(a.name))expect(a.value).not.toMatch(/^(javascript:|data:text\/html)/i);}
});
