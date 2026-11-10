/** Chromium source fidelity checks; npm exec with PLAYWRIGHT_MODULE_PATH. No build. */
import fs from 'node:fs';
import {createRequire} from 'node:module';
import {join,resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {randomUUID} from 'node:crypto';
const require=createRequire(import.meta.url);
const dir=import.meta.dirname,root=resolve(dir,'../../../../..');
const archived=resolve(root,'archive/security-certifications/Issmp-guide.html');
const sourceFile=fs.existsSync(archived)?archived:resolve(root,'Issmp-guide.html');
if(!fs.existsSync(sourceFile)){console.log('SKIP: Original HTML is absent; browser source comparison is unavailable.');process.exit(0);}
const resultsPath=process.env.ISSMP_STYLES_RESULTS_PATH??join(tmpdir(),`issmp-browser-results-${randomUUID()}.json`);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE_PATH??'playwright');
let source=fs.readFileSync(sourceFile,'utf8').replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'').replace(/<link\b[^>]*>/g,'');
const html=process.env.DOCS_BASE_URL?'':fs.readFileSync(process.env.ISSMP_RENDERED_HTML??'/private/tmp/issmp-rendered.html','utf8');
const css=['../../globals.css','../docs-layout.css','./guide.css'].map(p=>fs.readFileSync(resolve(dir,p),'utf8')).join('\n').replace(/@import[^;]+;/g,'');
const props=['fontFamily','fontSize','fontWeight','letterSpacing','lineHeight','color','backgroundColor','marginTop','marginBottom','paddingTop','paddingBottom','paddingLeft','paddingRight','borderTopWidth','borderBottomWidth','borderLeftWidth','listStyleType','display','textTransform','fontStyle','counterReset','counterIncrement'];
const selectors=['h1,h2,h3,h4,h5,h6','th,td','.guide-content p','.guide-content ul,.guide-content ol,.guide-content li','em,strong','.hero,.eyebrow','.brand,.brand-name,.brand-sub','.sidebar nav a,.nav-h1','.callout,.callout-title,.callout-body','.qcard,.qtext,.qnum,.opts,.opts li','.chip'];
const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
console.log('Chrome launched');
const failures=[];
try{
 for(const width of [375,768,1024,1025,1440])for(const colorScheme of ['light','dark']){
 const ctx=await browser.newContext({viewport:{width,height:900},colorScheme,javaScriptEnabled:false});
 try{
 console.log('condition',width,colorScheme);
 const original=await ctx.newPage(),actual=await ctx.newPage();
 await original.setContent(source);console.log('source loaded');
 if(process.env.DOCS_BASE_URL) await actual.goto(new URL('/docs/issmp-guide',process.env.DOCS_BASE_URL).href,{waitUntil:'networkidle'});
 else await actual.setContent('<!doctype html><style>'+css+'</style><main class="docs-main"><article class="prose docs-article">'+html+'</article></main>');
 console.log('actual loaded');
 const sample=(page,selector)=>(page===actual?page.locator('.issmp-guide').locator(selector):page.locator(selector)).evaluateAll((els,props)=>els.filter(e=>!e.closest('.mermaid-target')).map(e=>{const s=getComputedStyle(e);return Object.fromEntries(props.map(p=>[p,s[p]]));}),props);
 for(const selector of selectors){const a=await sample(actual,selector),o=await sample(original,selector.replaceAll('.guide-content','main'));
 if(a.length!==o.length)failures.push({width,colorScheme,selector,counts:[a.length,o.length]});
 for(let i=0;i<a.length;i++)for(const prop of props)if(a[i][prop]!==o[i]?.[prop])failures.push({width,colorScheme,selector,i,prop,expected:o[i]?.[prop],actual:a[i][prop]});
 }
 for(const [selector,pseudo] of [['.guide-content ul>li','::before'],['.guide-content ol>li','::before'],['.sidebar nav li','::before'],['.sidebar nav li','::marker'],['.guide-content ol>li','::marker']]){
 const capture=page=>(page===actual?page.locator('.issmp-guide').locator(selector):page.locator(selector.replaceAll('.guide-content','main'))).evaluateAll((els,pseudo)=>els.filter(e=>!e.closest('.mermaid-target')).map(e=>{const s=getComputedStyle(e,pseudo);return ['content','color','backgroundColor','width','height','borderRadius','left','top','position','lineHeight','textAlign','fontWeight','counterReset','counterIncrement'].map(p=>s[p]);}),pseudo);
 const a=await capture(actual),o=await capture(original);if(JSON.stringify(a)!==JSON.stringify(o))failures.push({width,colorScheme,selector,pseudo,expected:o,actual:a});
 }
 for(const page of [actual,original]){const cdp=await ctx.newCDPSession(page);await cdp.send('DOM.enable');await cdp.send('CSS.enable');const {root}=await cdp.send('DOM.getDocument');const {nodeIds}=await cdp.send('DOM.querySelectorAll',{nodeId:root.nodeId,selector:'tr'});await Promise.all(nodeIds.map(nodeId=>cdp.send('CSS.forcePseudoState',{nodeId,forcedPseudoClasses:['hover']})));}
 const a=await sample(actual,'th,td'),o=await sample(original,'th,td');for(let i=0;i<a.length;i++)for(const prop of ['backgroundColor','color','borderBottomWidth'])if(a[i][prop]!==o[i]?.[prop])failures.push({width,colorScheme,hoverCell:i,prop,actual:a[i][prop],expected:o[i]?.[prop]});
 fs.writeFileSync(resultsPath,JSON.stringify(failures,null,2));
 console.log(JSON.stringify({width,colorScheme,cells:a.length,failures:failures.filter(f=>f.width===width&&f.colorScheme===colorScheme).length}));
 }finally{await ctx.close();}
 }
}finally{fs.writeFileSync(resultsPath,JSON.stringify(failures,null,2));await browser.close();}
fs.writeFileSync(resultsPath,JSON.stringify(failures,null,2));
if(failures.length)throw Error(`${failures.length} differences; ${resultsPath}`);
console.log('All typography, cells, lists, pseudo markers and hovered cells match.',resultsPath);
