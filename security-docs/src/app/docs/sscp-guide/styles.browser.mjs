/** Chromium source fidelity checks; npm exec with PLAYWRIGHT_MODULE_PATH. No build. */
import fs from 'node:fs';
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE_PATH??'playwright');
const dir=import.meta.dirname,root=resolve(dir,'../../../../..');
const sourceFile=[root+'/archive/security-certifications/Sscp-guide.html',root+'/Sscp-guide.html'].find(fs.existsSync);
if(!sourceFile)throw Error('Original HTML is required');
let source=fs.readFileSync(sourceFile,'utf8').replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'').replace(/<link\b[^>]*>/g,'');
const html=process.env.DOCS_BASE_URL?'':fs.readFileSync(process.env.SSCP_RENDERED_HTML??'/tmp/sscp-rendered.html','utf8');
const css=['../../globals.css','../docs-layout.css','./sscp-guide.css'].map(p=>fs.readFileSync(resolve(dir,p),'utf8')).join('\n').replace(/@import[^;]+;/g,'');
const props=['fontFamily','fontSize','fontWeight','letterSpacing','lineHeight','color','backgroundColor','marginTop','marginBottom','paddingTop','paddingBottom','paddingLeft','paddingRight','borderTopWidth','borderBottomWidth','borderLeftWidth','listStyleType','display','textTransform','fontStyle','counterReset','counterIncrement'];
const selectors=['h1,h2,h3,h4,h5,h6','th,td','.guide-content p','.guide-content ul,.guide-content ol,.guide-content li','code,em,strong','.hero,.eyebrow,.meta,.meta dt,.meta dd','.brand,.brand-title,.brand-sub','.sidebar nav a','.ref,.ref-num,.ref-title,.ref-url,.ref-mark','.callout,.callout-head,.callout-body,.sub-label,.chk,.chk-num,.chk-text,.chk input','.footer'];
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
 if(process.env.DOCS_BASE_URL) await actual.goto(new URL('/docs/sscp-guide',process.env.DOCS_BASE_URL).href,{waitUntil:'networkidle'});
 else await actual.setContent('<style>'+css+'</style><main class="docs-main"><article class="prose docs-article">'+html+'</article></main>');
 console.log('actual loaded');
 const sample=(page,selector)=>(page===actual?page.locator('.sscp-guide').locator(selector):page.locator(selector)).evaluateAll((els,props)=>els.filter(e=>!e.closest('.mermaid-target')).map(e=>{const s=getComputedStyle(e);return Object.fromEntries(props.map(p=>[p,s[p]]));}),props);
 for(const selector of selectors){const a=await sample(actual,selector),o=await sample(original,selector.replaceAll('.guide-content','main'));
 if(a.length!==o.length)failures.push({width,colorScheme,selector,counts:[a.length,o.length]});
 for(let i=0;i<a.length;i++)for(const prop of props)if(a[i][prop]!==o[i]?.[prop])failures.push({width,colorScheme,selector,i,prop,expected:o[i]?.[prop],actual:a[i][prop]});
 }
 for(const [selector,pseudo] of [['.guide-content ul>li','::before'],['.guide-content ol>li','::marker'],['.sidebar nav li','::before'],['.sidebar nav li','::marker'],['.chk-num','::before'],['h4','::before']]){
 const capture=page=>(page===actual?page.locator('.sscp-guide').locator(selector):page.locator(selector.replaceAll('.guide-content','main'))).evaluateAll((els,pseudo)=>els.map(e=>{const s=getComputedStyle(e,pseudo);return ['content','color','backgroundColor','width','height','borderRadius','left','fontWeight','counterReset','counterIncrement'].map(p=>s[p]);}),pseudo);
 const a=await capture(actual),o=await capture(original);if(JSON.stringify(a)!==JSON.stringify(o))failures.push({width,colorScheme,selector,pseudo,expected:o,actual:a});
 }
 for(const page of [actual,original]){const cdp=await ctx.newCDPSession(page);await cdp.send('DOM.enable');await cdp.send('CSS.enable');const {root}=await cdp.send('DOM.getDocument');const {nodeIds}=await cdp.send('DOM.querySelectorAll',{nodeId:root.nodeId,selector:'tr'});await Promise.all(nodeIds.map(nodeId=>cdp.send('CSS.forcePseudoState',{nodeId,forcedPseudoClasses:['hover']})));}
 const a=await sample(actual,'th,td'),o=await sample(original,'th,td');for(let i=0;i<a.length;i++)for(const prop of ['backgroundColor','color','borderBottomWidth'])if(a[i][prop]!==o[i][prop])failures.push({width,colorScheme,hoverCell:i,prop,actual:a[i][prop],expected:o[i][prop]});
 for(const page of [actual,original])for(const input of await page.locator('.checklist input').all())await input.check();
 const ac=await sample(actual,'.chk,.chk-num,.chk-text,.chk input'),oc=await sample(original,'.chk,.chk-num,.chk-text,.chk input');for(let i=0;i<ac.length;i++)for(const prop of props)if(ac[i][prop]!==oc[i]?.[prop])failures.push({width,colorScheme,checked:i,prop,actual:ac[i][prop],expected:oc[i]?.[prop]});
 console.log(JSON.stringify({width,colorScheme,cells:a.length,failures:failures.filter(f=>f.width===width&&f.colorScheme===colorScheme).length}));
 }finally{await ctx.close();}
 }
}finally{await browser.close();}
fs.writeFileSync('/tmp/sscp-browser-results.json',JSON.stringify(failures,null,2));
if(failures.length)throw Error(`${failures.length} differences; /tmp/sscp-browser-results.json`);
console.log('All typography, cells, lists, pseudo markers and hovered cells match.');
