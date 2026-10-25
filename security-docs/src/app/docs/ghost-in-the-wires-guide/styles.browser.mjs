/** Chromium source fidelity checks; npm exec with PLAYWRIGHT_MODULE_PATH. No build. */
import fs from 'node:fs';
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE_PATH??'playwright');
const dir=import.meta.dirname,root=resolve(dir,'../../../../..');
const sourceFile=[root+'/archive/security-guides/Ghost-in-the-wires-guide.html',root+'/Ghost-in-the-wires-guide.html'].find(fs.existsSync);
if(!sourceFile)throw Error('Original HTML is required');
const source=fs.readFileSync(sourceFile,'utf8').replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'').replace(/<link\b[^>]*>/g,'');
const html=fs.readFileSync(process.env.GHOST_RENDERED_HTML??'/tmp/ghost-rendered.html','utf8');
const css=['../../globals.css','../docs-layout.css','./ghost-in-the-wires-guide.css'].map(p=>fs.readFileSync(resolve(dir,p),'utf8')).join('\n').replace(/@import[^;]+;/g,'');
const props=['fontFamily','fontSize','fontWeight','letterSpacing','lineHeight','color','backgroundColor','marginTop','marginBottom','paddingTop','paddingBottom','paddingLeft','paddingRight','borderTopWidth','borderBottomWidth','borderLeftWidth','listStyleType','display','textTransform','fontStyle'];
const selectors=['h1,h2,h3,h4','th,td','.guide-content p','.guide-content ul,.guide-content ol,.guide-content li','blockquote,code,em,strong','details.qa,details.qa summary,.qa-body','.hero,.lead','.brand,.brand-title,.brand-sub','.sidebar nav a','.src-list,.src-card,.src-badge,.src-type,.src-desc,.src-url','.life-timeline,.life-timeline figcaption,.timeline-events,.timeline-year','.footer'];
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH??'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
const failures=[];
try{
 for(const width of [375,640,768,1024,1440])for(const colorScheme of ['light','dark']){
 const ctx=await browser.newContext({viewport:{width,height:900},colorScheme,javaScriptEnabled:false});
 try{
 const original=await ctx.newPage(),actual=await ctx.newPage();
 await original.setContent(source);
 if(process.env.DOCS_BASE_URL) await actual.goto(new URL('/docs/ghost-in-the-wires-guide',process.env.DOCS_BASE_URL).href,{waitUntil:'networkidle'});
 else await actual.setContent('<style>'+css+'</style><main class="docs-main"><article class="prose docs-article">'+html+'</article></main>');
 const sample=(page,selector)=>(page===actual?page.locator('.ghost-wires-guide').locator(selector):page.locator(selector)).evaluateAll((els,props)=>els.filter(e=>!e.closest('.mermaid-target')).map(e=>{const s=getComputedStyle(e);return Object.fromEntries(props.map(p=>[p,s[p]]));}),props);
 for(const selector of selectors){const a=await sample(actual,selector),o=await sample(original,selector.replaceAll('.guide-content','main'));
 if(a.length!==o.length)failures.push({width,colorScheme,selector,counts:[a.length,o.length]});
 for(let i=0;i<a.length;i++)for(const prop of props)if(a[i][prop]!==o[i]?.[prop])failures.push({width,colorScheme,selector,i,prop,expected:o[i]?.[prop],actual:a[i][prop]});
 }
 for(const [selector,pseudo] of [['.section ul>li','::before'],['.timeline-events>li','::before'],['.timeline-events>li:not(:last-child)','::after'],['.section ol>li','::marker'],['details.qa summary','::before']]){
 const capture=page=>(page===actual?page.locator('.ghost-wires-guide').locator(selector):page.locator(selector)).evaluateAll((els,pseudo)=>els.map(e=>{const s=getComputedStyle(e,pseudo);return ['content','color','backgroundColor','width','height','borderRadius','left','fontWeight'].map(p=>s[p]);}),pseudo);
 const a=await capture(actual),o=await capture(original);if(JSON.stringify(a)!==JSON.stringify(o))failures.push({width,colorScheme,selector,pseudo,expected:o,actual:a});
 }
 for(const page of [actual,original]){const cdp=await ctx.newCDPSession(page);await cdp.send('DOM.enable');await cdp.send('CSS.enable');const {root}=await cdp.send('DOM.getDocument');const {nodeIds}=await cdp.send('DOM.querySelectorAll',{nodeId:root.nodeId,selector:'tr'});await Promise.all(nodeIds.map(nodeId=>cdp.send('CSS.forcePseudoState',{nodeId,forcedPseudoClasses:['hover']})));}
 const a=await sample(actual,'th,td'),o=await sample(original,'th,td');for(let i=0;i<a.length;i++)for(const prop of ['backgroundColor','color','borderBottomWidth'])if(a[i][prop]!==o[i][prop])failures.push({width,colorScheme,hoverCell:i,prop,actual:a[i][prop],expected:o[i][prop]});
 console.log(JSON.stringify({width,colorScheme,cells:a.length,failures:failures.filter(f=>f.width===width&&f.colorScheme===colorScheme).length}));
 }finally{await ctx.close();}
 }
}finally{await browser.close();}
fs.writeFileSync('/tmp/ghost-browser-results.json',JSON.stringify(failures,null,2));
if(failures.length)throw Error(`${failures.length} differences; /tmp/ghost-browser-results.json`);
console.log('All typography, cells, lists, pseudo markers and hovered cells match.');
