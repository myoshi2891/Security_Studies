/** Run through npm exec against a running Next.js dev server; no production build. */
import fs from 'node:fs';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE_PATH??'playwright');
const inventory=JSON.parse(fs.readFileSync(resolve(import.meta.dirname,'../../../../../docs/migration-inventory/iso-iec-29100-2024-guide.json'),'utf8'));
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH??'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
const failures=[];
try{
 for(const width of [375,1440]){
 const context=await browser.newContext({viewport:{width,height:900}});
 const page=await context.newPage();page.on('pageerror',error=>failures.push(error.message));
 const response=await page.goto(new URL(inventory.route,process.env.DOCS_BASE_URL??'http://127.0.0.1:3011').href,{waitUntil:'networkidle'});assert.equal(response.status(),200);await page.getByRole("button",{name:"同意して閲覧する"}).click();
 const data=await page.locator('.iso29100-guide').evaluate((guide,inventory)=>{
  guide=guide.cloneNode(true);for(const a of guide.querySelectorAll('nav a.active')){a.classList.remove('active');if(!a.className)a.removeAttribute('class');a.removeAttribute('aria-current');}guide.querySelector('#quizProgressFill')?.removeAttribute('style');for(const d of guide.querySelectorAll('.mermaid-target'))d.replaceChildren();
  function canonical(node){if(node.nodeType===3)return node.textContent.replace(/\s+/g,' ').trim()||null;if(node.nodeType!==1)return null;const el=node;if(el.tagName==='NOSCRIPT')return null;if(el.matches('.mermaid[id],.mermaid-target[data-diagram]'))return ['diagram',el.id];if(el.tagName==='I')return ['icon',el.getAttribute('class')];const attrs=[...el.attributes].filter(a=>a.name!=='style'&&!(a.name==='id'&&el.matches('h2')&&el.parentElement?.id===el.id)).map(a=>[a.name,a.name==='class'?a.value.replace(/\s*hljs\b/g,''):a.value]).sort((a,b)=>a[0].localeCompare(b[0]));const style=(el.getAttribute('style')||'').split(';').map(s=>s.trim().replace(/\s+/g,'')).filter(Boolean).sort();return [el.tagName,attrs,style,el.matches('pre code')?[el.textContent]:[...el.childNodes].map(canonical).filter(v=>v!==null)];}
  return {counts:Object.fromEntries(Object.keys(inventory.counts).map(s=>[s,guide.querySelectorAll(s).length])),structures:Object.fromEntries(Object.keys(inventory.structures).map(s=>[s,JSON.stringify(canonical(guide.querySelector(s)))])),codes:[...guide.querySelectorAll('pre code')].map(el=>el.textContent)};
 },inventory);
 assert.deepEqual(data.counts,inventory.counts);
 for(const [selector,tree] of Object.entries(data.structures))assert.equal(createHash('sha256').update(tree).digest('hex'),inventory.structures[selector],selector);
 assert.deepEqual(data.codes.map(t=>createHash('sha256').update(t).digest('hex')),inventory.codeHashes);
 for(const diagram of await page.locator('.mermaid-target').all()){
  await diagram.scrollIntoViewIfNeeded();await diagram.locator('.diagram-viewport svg').waitFor({timeout:30000});
  const sizes=await diagram.locator('.diagram-viewport').evaluate(el=>{const svg=el.querySelector('svg');const a=el.getBoundingClientRect(),b=svg.getBoundingClientRect();el.scrollLeft=0;const left=svg.getBoundingClientRect().left-a.left;el.scrollLeft=el.scrollWidth;return {svg:b.width,viewport:a.width,left,scroll:el.scrollLeft,max:el.scrollWidth-el.clientWidth};});
  assert.ok(sizes.left>=-1,'left edge remains reachable');assert.ok(sizes.scroll===sizes.max,'right edge remains reachable');
  if(sizes.svg<sizes.viewport)assert.ok(Math.abs(sizes.left-(sizes.viewport-sizes.svg)/2)<2,'small SVG centered');
 }
 for(const answer of await page.locator('.quiz-details').all()){
  await answer.locator('summary').click();await page.waitForTimeout(10);assert.equal(await answer.getAttribute('open'),'');await answer.locator('summary').click();
 }
 await page.locator('#quizExpandAll').click();assert.equal(await page.locator('.quiz-details[open]').count(),10);
 await page.locator('#quizCollapseAll').click();assert.equal(await page.locator('.quiz-details[open]').count(),0);
 for(const label of await page.locator('.quiz-check').all())await label.click();
 assert.equal(await page.locator('#quizProgressText').textContent(),'10 / 10 問（100%）');
 await page.locator('#quizResetChecks').click();assert.equal(await page.locator('.quiz-check-input:checked').count(),0);
 assert.equal(await page.locator('#quizProgressText').textContent(),'0 / 10 問（0%）');
 if(width===375){await page.locator('#menuBtn').click();assert.equal(await page.locator('#menuBtn').getAttribute('aria-expanded'),'true');await page.keyboard.press('Escape');assert.equal(await page.locator('#menuBtn').getAttribute('aria-expanded'),'false');await page.locator('#menuBtn').click();await page.locator('#sidebar a').nth(8).click();assert.equal(await page.locator('#menuBtn').getAttribute('aria-expanded'),'false');assert.ok(await page.locator('section').nth(8).locator('h2').evaluate(el=>el===document.activeElement));}
 await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await page.locator('html').evaluate(el=>getComputedStyle(el).scrollBehavior),'auto');
 console.log(JSON.stringify({width,status:response.status(),structures:Object.keys(data.structures).length,counts:data.counts,diagrams:12,pageErrors:failures.length}));
 await context.close();
 }
 assert.deepEqual(failures,[]);
}finally{await browser.close();}
