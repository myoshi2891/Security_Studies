/** npm exec browser verification against Next dev; no production build. */
import fs from 'node:fs';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE_PATH??'playwright');
const inventory=JSON.parse(fs.readFileSync(resolve(import.meta.dirname,'../../../../../docs/migration-inventory/issep-guide.json'),'utf8'));
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH??'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
const errors=[],results=[];
try{
 for(const width of [375,1440]){
  const context=await browser.newContext({viewport:{width,height:900}}),page=await context.newPage();
  await context.addInitScript(()=>localStorage.setItem('security-docs:disclaimer-acknowledged','1'));
  page.on('pageerror',error=>errors.push(error.message));
  const response=await page.goto(new URL(inventory.route,process.env.DOCS_BASE_URL??'http://127.0.0.1:3107').href,{waitUntil:'networkidle'});assert.equal(response.status(),200);
  const actual=await page.locator('.issep-guide').evaluate((guide,inventory)=>{
   guide=guide.cloneNode(true);
   for(const node of guide.querySelectorAll('nav li.open,nav a.active,nav a.current,nav a[aria-current]')){node.classList.remove('active','current','open');if(!node.className)node.removeAttribute('class');node.removeAttribute('aria-current');}
   function canonical(n){if(n.nodeType===3)return n.textContent.replace(/\s+/g,' ').trim()||null;if(n.nodeType!==1)return null;const e=n;if(e.matches('[data-diagram]'))return ['diagram',e.getAttribute('data-diagram')];if(e.matches('pre code'))return ['CODE',e.textContent];if(e.matches('.quiz-status')&&e.childNodes.length===0)return null;const children=e.matches('.q-opts > li')&&e.childNodes.length===1&&e.firstElementChild?.matches('button.quiz-choice')?e.firstElementChild.childNodes:e.childNodes;return [e.tagName,[...e.attributes].filter(a=>!a.name.startsWith('aria-')&&a.name!=='tabindex'&&!(a.name==='role'&&a.value==='group'&&e.matches('.quiz'))).map(a=>[a.name==='viewbox'?'viewBox':a.name,a.value]).sort((a,b)=>a[0].localeCompare(b[0])),[...children].map(canonical).filter(v=>v!==null)];}
   const native=e=>!e.closest('[data-diagram]')||e.matches('[data-diagram]');
   return {counts:Object.fromEntries(Object.keys(inventory.counts).map(s=>[s,[...guide.querySelectorAll(s)].filter(native).length])),structures:Object.fromEntries(Object.keys(inventory.structures).map(s=>[s,JSON.stringify(canonical(guide.querySelector(s)))])),ids:[...guide.querySelectorAll('[id]:not(.quiz-status)')].filter(native).map(e=>e.id),codes:[...guide.querySelectorAll('pre code')].map(e=>e.textContent)};
  },inventory);
  assert.deepEqual(actual.counts,inventory.counts);assert.deepEqual([...actual.ids].sort(),[...inventory.ids].sort());
  const hash=s=>createHash('sha256').update(s).digest('hex');
  for(const [selector,tree] of Object.entries(actual.structures))assert.equal(hash(tree),inventory.structures[selector],selector);
  assert.deepEqual(actual.codes.map(hash),inventory.codes);
  let drawn=0;
  for(const figure of await page.locator('[data-diagram]').all()){
   const id=await figure.getAttribute('data-diagram');assert.equal(await figure.getAttribute('data-definition'),inventory.diagrams[id]);
   await figure.scrollIntoViewIfNeeded();await figure.locator('.diagram-viewport svg').waitFor({timeout:30000});
   const bounds=await figure.locator('.diagram-viewport').evaluate(viewport=>{const svg=viewport.querySelector('svg');viewport.scrollLeft=0;const outer=viewport.getBoundingClientRect(),inner=svg.getBoundingClientRect(),left=inner.left-outer.left;viewport.scrollLeft=viewport.scrollWidth;return {svg:inner.width,viewport:outer.width,left,scroll:viewport.scrollLeft,max:viewport.scrollWidth-viewport.clientWidth};});
   assert.ok(bounds.left>=-1,'SVG left edge reachable');assert.equal(bounds.scroll,bounds.max,'SVG right edge reachable');if(bounds.svg<bounds.viewport)assert.ok(Math.abs(bounds.left-(bounds.viewport-bounds.svg)/2)<2,'small diagram centered');drawn++;
  }
  assert.equal(drawn,22);
  await page.evaluate(()=>{history.replaceState(null,'','#h3-30');window.dispatchEvent(new HashChangeEvent('hashchange'));});
  assert.equal(await page.locator('nav>ul>li.open>a').getAttribute('href'),'#sec-9');assert.ok((await page.locator('a[href="#h3-30"]').getAttribute('class')).includes('active'));
  if(width===375){
   const button=page.locator('#menuBtn');await button.click();assert.equal(await button.getAttribute('aria-expanded'),'true');await page.keyboard.press('Escape');assert.equal(await button.getAttribute('aria-expanded'),'false');
   await button.click();await page.locator('nav>ul>li>a').first().focus();await page.keyboard.press('Shift+Tab');assert.equal(await page.evaluate(()=>document.activeElement.getAttribute('href')),'#sec-13');
   await page.locator('a[href="#sec-8"]').click();assert.equal(await button.getAttribute('aria-expanded'),'false');assert.ok(await page.locator('#sec-8 h2').evaluate(el=>document.activeElement===el));
   await button.click();await page.locator('a[href="#h3-28"]').click();assert.ok(await page.locator('#h3-28').evaluate(el=>document.activeElement===el));
  }
  const boxes=await page.locator('.checklist input').all();assert.equal(boxes.length,6);
  for(const input of boxes){await input.evaluate(e=>e.scrollIntoView({block:'center'}));await input.check();assert.equal(await input.isChecked(),true);}
  for(const label of await page.locator('.checklist label').all()){await label.evaluate(e=>e.scrollIntoView({block:'center'}));await label.click();}
  assert.equal(await page.locator('.checklist input:checked').count(),0);
  const questions=await page.locator('.quiz details').all();assert.equal(questions.length,10);
  for(const detail of questions){await detail.locator('summary').click();assert.equal(await detail.getAttribute('open'),'');assert.ok(await detail.locator('.answer').isVisible());await detail.locator('summary').click();assert.equal(await detail.getAttribute('open'),null);}
  await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await page.locator('.issep-guide').evaluate(el=>getComputedStyle(el).scrollBehavior),'auto');
  results.push({width,status:response.status(),structures:Object.keys(actual.structures).length,counts:actual.counts,diagrams:drawn,pageErrors:errors.length});console.log(JSON.stringify(results.at(-1)));await context.close();
 }
 assert.deepEqual(errors,[]);
}finally{await browser.close();}
fs.writeFileSync('/tmp/issep-runtime-results.json',JSON.stringify(results,null,2));
