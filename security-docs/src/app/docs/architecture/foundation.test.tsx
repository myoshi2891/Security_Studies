import {expect,test} from 'bun:test';
import {readFileSync} from 'node:fs';
import postcss from 'postcss';
import {renderedPage, evaluatedPage, sourceTest, sourceDocument, sourceCss, canonical, structure, inventory, scope} from './fidelity-helpers';
for(const selector of ['.hero','.brand','#nav','.footer']){
 test(`${selector}: fixed original structure survives without originals`,async()=>{
  const node=(await renderedPage()).querySelector(selector);expect(node).not.toBeNull();
  expect(structure(node!)).toBe(inventory.structures[selector as keyof typeof inventory.structures]);
 });
 sourceTest(`${selector}: every source node and attribute survives`,async()=>expect(canonical((await renderedPage()).querySelector(selector)!)).toEqual(canonical(sourceDocument.querySelector(selector)!)));
}
test('original title and new migration metadata replace old architecture metadata',async()=>expect((await evaluatedPage()).metadata).toEqual({title:inventory.title,description:inventory.description}));
sourceTest('every original CSS rule, declaration, pseudo selector and media condition survives scoping',()=>{
 const actual=postcss.parse(readFileSync(new URL('./architecture-guide.css',import.meta.url),'utf8'));
 const ancestry=(r:postcss.Rule)=>{const a:string[]=[];for(let p=r.parent;p&&p.type==='atrule';p=p.parent)a.unshift((p as postcss.AtRule).name+' '+(p as postcss.AtRule).params);return a.join('/');};
 sourceCss.walkRules(rule=>{
  const selector=rule.selector.split(',').map(s=>{s=s.trim();return [':root','html','body'].includes(s)?scope:scope+' '+s;}).join(', ');
  const found:string[]=[];actual.walkRules(selector,r=>{if(ancestry(r)===ancestry(rule))r.walkDecls(d=>{found.push(d.prop+':'+d.value);});});
  rule.walkDecls(d=>expect(found,selector).toContain(d.prop+':'+d.value));
 });
});
test('fixed inventory protects every source CSS declaration and media rule even without archived HTML',()=>{
 const tree=postcss.parse(readFileSync(new URL('./architecture-guide.css',import.meta.url),'utf8'));
 for(const rule of inventory.cssRules){
  const selector=rule.selector.split(',').map(s=>{s=s.trim();return [':root','html','body'].includes(s)?scope:scope+' '+s;}).join(', ');
  const found:string[]=[];
  tree.walkRules(selector,r=>{const ancestry:string[]=[];for(let p=r.parent;p&&p.type==='atrule';p=p.parent)ancestry.unshift((p as postcss.AtRule).name+' '+(p as postcss.AtRule).params);if(ancestry.join('/')===rule.ancestry)r.walkDecls(d=>{found.push(d.prop+':'+d.value);});});
  expect(found,selector).toEqual(expect.arrayContaining(rule.declarations));
 }
});
