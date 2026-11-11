/** Automated Next dev verification. npm exec; no production build or screenshots. */
import fs from 'node:fs';
import {createRequire} from 'node:module';
import {createHash,randomUUID} from 'node:crypto';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE_PATH??'playwright');
const inventory=JSON.parse(fs.readFileSync(resolve(import.meta.dirname,'../../../../../docs/migration-inventory/issmp-guide.json'),'utf8'));
const resultsPath=process.env.ISSMP_RUNTIME_RESULTS_PATH??join(tmpdir(),`issmp-runtime-${randomUUID()}.json`);
const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
const results=[],errors=[];
const hash=s=>createHash('sha256').update(s).digest('hex');
try{
 for(const width of [375,1440]){
  const context=await browser.newContext({viewport:{width,height:900}}),page=await context.newPage();
  await context.addInitScript(()=>localStorage.setItem('security-docs:disclaimer-acknowledged','1'));
  page.on('pageerror',error=>errors.push(error.message));
  const response=await page.goto(new URL(inventory.route,process.env.DOCS_BASE_URL??'http://localhost:3111').href,{waitUntil:'networkidle'});
  assert.equal(response.status(),200);
  await page.locator('#menuBtn').evaluate(e=>e.click());
  await page.waitForFunction(()=>document.querySelector('#menuBtn').getAttribute('aria-expanded')==='true');
  await page.locator('#menuBtn').evaluate(e=>e.click());
  await page.waitForFunction(()=>document.querySelector('#menuBtn').getAttribute('aria-expanded')==='false');
  const actual=await page.locator('.issmp-guide').evaluate((guide,inventory)=>{
   guide=guide.cloneNode(true);
   for(const e of guide.querySelectorAll('.nav-group.open,nav a.active,nav a[aria-current]')){e.classList.remove('active','open');if(!e.className)e.removeAttribute('class');e.removeAttribute('aria-current');}
   function canonical(n){
    if(n.nodeType===3)return n.textContent.replace(/\s+/g,' ').trim()||null;
    if(n.nodeType!==1)return null;
    const e=n;
    if(e.matches('[data-diagram]'))return ['diagram',e.getAttribute('class')?.split(/\s+/).filter(c=>c!=='mermaid-target').join(' '),e.getAttribute('data-diagram')];
    if(e.matches('i.ti'))return ['icon',e.getAttribute('class')];
    return [e.tagName,[...e.attributes].map(a=>[a.name==='viewbox'?'viewBox':a.name,a.value]).sort((a,b)=>a[0].localeCompare(b[0])),[...e.childNodes].map(canonical).filter(v=>v!==null)];
   }
   const native=e=>!e.closest('[data-diagram]')||e.matches('[data-diagram]');
   return {counts:Object.fromEntries(Object.keys(inventory.counts).map(s=>[s,[...guide.querySelectorAll(s)].filter(native).length])),ids:[...guide.querySelectorAll('[id]')].filter(native).map(e=>e.id),structures:Object.fromEntries(Object.keys(inventory.structures).map(s=>[s,JSON.stringify(canonical(guide.querySelector(s)))]))};
  },inventory);
  assert.deepEqual(actual.counts,inventory.counts);
  assert.deepEqual(actual.ids.sort(),[...inventory.ids].sort());
  for(const [selector,tree] of Object.entries(actual.structures))assert.equal(hash(tree),inventory.structures[selector],selector);
  let drawn=0;
  for(const figure of await page.locator('.issmp-guide [data-diagram]').all()){
   const id=await figure.getAttribute('data-diagram');assert.equal(await figure.getAttribute('data-definition'),inventory.diagrams[id]);
   await figure.scrollIntoViewIfNeeded();await figure.locator('.diagram-viewport svg').waitFor({timeout:30000});
   const bounds=await figure.locator('.diagram-viewport').evaluate(viewport=>{
    const svg=viewport.querySelector('svg');viewport.scrollLeft=0;const outer=viewport.getBoundingClientRect(),inner=svg.getBoundingClientRect();const left=inner.left-outer.left;viewport.scrollLeft=viewport.scrollWidth;
    return {svg:inner.width,natural:svg.viewBox.baseVal.width,viewport:outer.width,left,scroll:viewport.scrollLeft,max:viewport.scrollWidth-viewport.clientWidth};
   });
   assert.ok(bounds.svg>=bounds.natural-1,`${id}: natural SVG width`);assert.ok(bounds.left>=-1,`${id}: left edge reachable`);assert.equal(bounds.scroll,bounds.max,`${id}: right edge reachable`);
   if(bounds.svg<bounds.viewport)assert.ok(Math.abs(bounds.left-(bounds.viewport-bounds.svg)/2)<2,`${id}: centered`);
   drawn++;
  }
  assert.equal(drawn,34);
  // Both narrow and oversized SVGs must be measured at phone AND desktop widths.
  const geometry=await page.locator('.issmp-guide .diagram').first().evaluate(frame=>{
   const samples=[];
   for(const width of [120,2400]){
    const viewport=document.createElement('div');viewport.className='diagram-viewport';viewport.innerHTML=`<svg viewBox="0 0 ${width} 80" style="width:${width}px"></svg>`;frame.appendChild(viewport);
    const svg=viewport.firstElementChild;viewport.scrollLeft=0;const outer=viewport.getBoundingClientRect(),inner=svg.getBoundingClientRect();const left=inner.left-outer.left;viewport.scrollLeft=viewport.scrollWidth;
    samples.push({width,svg:inner.width,viewport:outer.width,left,scroll:viewport.scrollLeft,max:viewport.scrollWidth-viewport.clientWidth});viewport.remove();
   }return samples;
  });
  for(const bounds of geometry){assert.equal(bounds.svg,bounds.width);assert.ok(bounds.left>=-1);assert.equal(bounds.scroll,bounds.max);if(bounds.svg<bounds.viewport)assert.ok(Math.abs(bounds.left-(bounds.viewport-bounds.svg)/2)<2);else assert.ok(bounds.max>0);}
  if(width<=1024){
   const button=page.locator('#menuBtn');await button.click();assert.equal(await button.getAttribute('aria-expanded'),'true');
   assert.equal(await page.locator('.guide-content').evaluate(e=>e.inert),true);
   await page.keyboard.press('Escape');assert.equal(await button.getAttribute('aria-expanded'),'false');assert.ok(await button.evaluate(e=>e===document.activeElement));
   await button.click();await page.locator('.sidebar nav a').last().focus();await page.keyboard.press('Tab');assert.ok(await button.evaluate(e=>e===document.activeElement));
   await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.getAttribute('href')),'#s1');
   await page.keyboard.press('Shift+Tab');assert.ok(await button.evaluate(e=>e===document.activeElement));
   await page.keyboard.press('Shift+Tab');assert.equal(await page.evaluate(()=>document.activeElement.getAttribute('href')),'#s50');
   await page.locator('.sidebar a[href="#s47"]').click();assert.equal(await button.getAttribute('aria-expanded'),'false');assert.ok(await page.locator('#s47 h1').evaluate(e=>e===document.activeElement));
   assert.equal(await page.locator('.guide-content').evaluate(e=>e.inert),false);
  }
  for(const target of ['s1','s15','s26','s47','s50']){
   await page.evaluate(id=>{history.replaceState(null,'','#'+id);dispatchEvent(new HashChangeEvent('hashchange'));document.getElementById(id).scrollIntoView({behavior:'instant'});},target);
   await page.waitForTimeout(200);
   assert.equal(await page.locator('.sidebar nav [aria-current="location"]').getAttribute('href'),'#'+target);
   const position=await page.locator('#'+target).evaluate(e=>({top:e.getBoundingClientRect().top,scroll:scrollY,max:document.documentElement.scrollHeight-innerHeight}));
   if(position.scroll<position.max-2)assert.ok(position.top>=64&&position.top<=90,`${target}: below application header`);
  }
  await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await page.locator('.issmp-guide').evaluate(e=>getComputedStyle(e).scrollBehavior),'auto');
  assert.equal(await page.locator('#s47 .qcard').count(),15);assert.equal(await page.locator('#s47 .opts>li').count(),60);assert.equal(await page.locator('#s47 tbody tr').count(),15);
  assert.deepEqual(errors,[]);
  const result={width,status:response.status(),structures:Object.keys(actual.structures).length,diagrams:drawn,counts:actual.counts,geometry,pageErrors:errors.length};results.push(result);console.log(JSON.stringify(result));
  await context.close();
 }
}finally{fs.writeFileSync(resultsPath,JSON.stringify({results,errors},null,2));await browser.close();}
console.log('ISSMP runtime verification passed:',resultsPath);
