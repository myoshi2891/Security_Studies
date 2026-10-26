/** Chromium source fidelity checks; npm exec with PLAYWRIGHT_MODULE_PATH. No build. */
import fs from 'node:fs';
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE_PATH??'playwright');
const dir=import.meta.dirname,root=resolve(dir,'../../../../..');
const sourceFile=[root+'/archive/standards/Iso-iec-29100-2024-guide.html',root+'/Iso-iec-29100-2024-guide.html'].find(fs.existsSync);
if(!sourceFile)throw Error('Original HTML is required');
let source=fs.readFileSync(sourceFile,'utf8').replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'').replace(/<link\b[^>]*>/g,'');
const hljs=require('highlight.js');
source=source.replace('<style>', '<style>'+fs.readFileSync(resolve(dir,'../../../../node_modules/highlight.js/styles/atom-one-dark.css'),'utf8')+'\n');
source=source.replace(/<code class="language-(python|json|yaml)">([\s\S]*?)<\/code>/g,(_,lang,code)=>'<code class="language-'+lang+' hljs">'+hljs.highlight(code.replaceAll('&lt;','<').replaceAll('&gt;','>').replaceAll('&amp;','&'),{language:lang}).value+'</code>');
const html=process.env.DOCS_BASE_URL?'':fs.readFileSync(process.env.HACKING_RENDERED_HTML??'/tmp/hacking-rendered.html','utf8');
const css=['../../globals.css','../docs-layout.css','./iso-iec-29100-2024-guide.css'].map(p=>fs.readFileSync(resolve(dir,p),'utf8')).join('\n').replace(/@import[^;]+;/g,'');
const props=['fontFamily','fontSize','fontWeight','letterSpacing','lineHeight','color','backgroundColor','marginTop','marginBottom','paddingTop','paddingBottom','paddingLeft','paddingRight','borderTopWidth','borderBottomWidth','borderLeftWidth','listStyleType','display','textTransform','fontStyle'];
const selectors=['h1,h2,h3,h4','th,td','.guide-content p','.guide-content ul,.guide-content ol,.guide-content li','code,em,strong','.hero,.meta,.meta dt,.meta dd','.brand,.brand-title,.brand-sub','.sidebar nav a','.ref,.ref-badge,.ref-title,.ref-desc,.ref-url','.callout,.quiz-head,.quiz-badge,.quiz-q,.quiz-summary,.quiz-answer,.quiz-ans-badge','.footer'];
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH??'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
console.log('Chrome launched');
const failures=[];
try{
 for(const width of [375,640,768,1024,1440])for(const colorScheme of ['light','dark']){
 const ctx=await browser.newContext({viewport:{width,height:900},colorScheme,javaScriptEnabled:false});
 try{
 console.log('condition',width,colorScheme);
 const original=await ctx.newPage(),actual=await ctx.newPage();
 await original.setContent(source);console.log('source loaded');
 if(process.env.DOCS_BASE_URL) await actual.goto(new URL('/docs/iso-iec-29100-2024-guide',process.env.DOCS_BASE_URL).href,{waitUntil:'networkidle'});
 else await actual.setContent('<style>'+css+'</style><main class="docs-main"><article class="prose docs-article">'+html+'</article></main>');
 console.log('actual loaded');
 const sample=(page,selector)=>(page===actual?page.locator('.iso29100-guide').locator(selector):page.locator(selector)).evaluateAll((els,props)=>els.filter(e=>!e.closest('.mermaid-target')).map(e=>{const s=getComputedStyle(e);return Object.fromEntries(props.map(p=>[p,s[p]]));}),props);
 for(const selector of selectors){const a=await sample(actual,selector),o=await sample(original,selector.replaceAll('.guide-content','main'));
 if(a.length!==o.length)failures.push({width,colorScheme,selector,counts:[a.length,o.length]});
 for(let i=0;i<a.length;i++)for(const prop of props)if(a[i][prop]!==o[i]?.[prop])failures.push({width,colorScheme,selector,i,prop,expected:o[i]?.[prop],actual:a[i][prop]});
 }
 for(const [selector,pseudo] of [['.prose ul>li','::before'],['.prose ol>li','::before'],['.prose ol','::before'],['.sidebar nav li','::before'],['.sidebar nav li','::marker']]){
 const capture=page=>(page===actual?page.locator('.iso29100-guide').locator(selector):page.locator(selector)).evaluateAll((els,pseudo)=>els.map(e=>{const s=getComputedStyle(e,pseudo);return ['content','color','backgroundColor','width','height','borderRadius','left','fontWeight','counterReset','counterIncrement'].map(p=>s[p]);}),pseudo);
 const a=await capture(actual),o=await capture(original);if(JSON.stringify(a)!==JSON.stringify(o))failures.push({width,colorScheme,selector,pseudo,expected:o,actual:a});
 }
 for(const page of [actual,original]){const cdp=await ctx.newCDPSession(page);await cdp.send('DOM.enable');await cdp.send('CSS.enable');const {root}=await cdp.send('DOM.getDocument');const {nodeIds}=await cdp.send('DOM.querySelectorAll',{nodeId:root.nodeId,selector:'tr'});await Promise.all(nodeIds.map(nodeId=>cdp.send('CSS.forcePseudoState',{nodeId,forcedPseudoClasses:['hover']})));}
 const a=await sample(actual,'th,td'),o=await sample(original,'th,td');for(let i=0;i<a.length;i++)for(const prop of ['backgroundColor','color','borderBottomWidth'])if(a[i][prop]!==o[i][prop])failures.push({width,colorScheme,hoverCell:i,prop,actual:a[i][prop],expected:o[i][prop]});
 console.log(JSON.stringify({width,colorScheme,cells:a.length,failures:failures.filter(f=>f.width===width&&f.colorScheme===colorScheme).length}));
 }finally{await ctx.close();}
 }
}finally{await browser.close();}
fs.writeFileSync('/tmp/iso29100-browser-results.json',JSON.stringify(failures,null,2));
if(failures.length)throw Error(`${failures.length} differences; /tmp/iso29100-browser-results.json`);
console.log('All typography, cells, lists, pseudo markers and hovered cells match.');
