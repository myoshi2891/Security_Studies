/** Automated Chromium checks against Next dev. Build and visual review are separate. */
import fs from 'node:fs';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE_PATH??'playwright');
const inventory=JSON.parse(fs.readFileSync(resolve(import.meta.dirname,'../../../../../docs/migration-inventory/cgrc-guide.json'),'utf8'));
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH??'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
const errors=[];
try{
 for(const width of [375,1440]){
  const context=await browser.newContext({viewport:{width,height:900}}),page=await context.newPage();
  page.on('pageerror',error=>errors.push(error.message));
  const response=await page.goto(new URL(inventory.route,process.env.DOCS_BASE_URL??'http://127.0.0.1:3013').href,{waitUntil:'networkidle'});assert.equal(response.status(),200);
  await page.getByRole('button',{name:'同意して閲覧する'}).click();
  const actual=await page.locator('.cgrc-guide').evaluate((guide,inventory)=>{
   guide=guide.cloneNode(true);
   for(const node of guide.querySelectorAll('nav li.open,nav a.active,nav a[aria-current]')){node.classList.remove('active','open');if(!node.className)node.removeAttribute('class');node.removeAttribute('aria-current');}
   for(const node of guide.querySelectorAll('.mermaid-target,.cl-progress,.q-score'))node.replaceChildren();
   function canonical(node){if(node.nodeType===3)return node.textContent.replace(/\s+/g,' ').trim()||null;if(node.nodeType!==1)return null;const el=node;if(el.tagName==='NOSCRIPT')return null;if(el.matches('.mermaid-target'))return ['diagram',el.getAttribute('data-key')];if(el.tagName==='I')return ['icon',el.getAttribute('class')];const attrs=[...el.attributes].filter(a=>a.name!=='style').map(a=>[a.name,a.name==='class'?a.value.replace(/\s*hljs\b/g,''):a.value]).sort((a,b)=>a[0].localeCompare(b[0]));const style=(el.getAttribute('style')||'').split(';').map(s=>s.trim().replace(/\s+/g,'')).filter(Boolean).sort();return [el.tagName,attrs,style,el.matches('pre code')?[el.textContent]:[...el.childNodes].map(canonical).filter(v=>v!==null)];}
   return {counts:Object.fromEntries(Object.keys(inventory.counts).map(s=>[s,[...guide.querySelectorAll(s)].filter(e=>s!=='svg'||!e.closest('i')).length])),structures:Object.fromEntries(Object.keys(inventory.structures).map(s=>[s,JSON.stringify(canonical(guide.querySelector(s)))])),ids:[...guide.querySelectorAll('[id]')].map(e=>e.id)};
  },inventory);
  assert.deepEqual(actual.counts,inventory.counts);assert.deepEqual([...actual.ids].sort(),[...inventory.ids].sort());
  for(const [selector,tree] of Object.entries(actual.structures))assert.equal(createHash('sha256').update(tree).digest('hex'),inventory.structures[selector],selector);
  let drawn=0;
  for(const figure of await page.locator('.mermaid-target').all()){
   await figure.scrollIntoViewIfNeeded();await figure.locator('.diagram-viewport svg').waitFor({timeout:30000});
   const bounds=await figure.locator('.diagram-viewport').evaluate(viewport=>{const svg=viewport.querySelector('svg');viewport.scrollLeft=0;const outer=viewport.getBoundingClientRect(),inner=svg.getBoundingClientRect(),left=inner.left-outer.left;viewport.scrollLeft=viewport.scrollWidth;return {svg:inner.width,viewport:outer.width,left,scroll:viewport.scrollLeft,max:viewport.scrollWidth-viewport.clientWidth};});
   assert.ok(bounds.left>=-1,'SVG left edge reachable');assert.equal(bounds.scroll,bounds.max,'SVG right edge reachable');if(bounds.svg<bounds.viewport)assert.ok(Math.abs(bounds.left-(bounds.viewport-bounds.svg)/2)<2,'small diagram centered');drawn++;
  }
  assert.equal(drawn,17);
  await page.evaluate(()=>{history.replaceState(null,'','#sec-7-3');window.dispatchEvent(new HashChangeEvent('hashchange'));});
  assert.equal(await page.locator('nav>ul>li.open>a').getAttribute('href'),'#ch7');assert.ok((await page.locator('a[href="#sec-7-3"]').getAttribute('class')).includes('active'));
  if(width===375){
   const button=page.locator('#navToggle');await button.click();assert.equal(await button.getAttribute('aria-expanded'),'true');await page.keyboard.press('Escape');assert.equal(await button.getAttribute('aria-expanded'),'false');
   await button.click();await page.locator('.brand').focus();await page.keyboard.press('Shift+Tab');assert.equal(await page.evaluate(()=>document.activeElement.getAttribute('href')),'#ch9');
   await page.locator('a[href="#ch8"]').click();assert.equal(await button.getAttribute('aria-expanded'),'false');assert.ok(await page.locator('#ch8 h2').evaluate(el=>document.activeElement===el));
   await button.click();await page.locator('a[href="#sec-8-2"]').click();assert.ok(await page.locator('#sec-8-2 h3').evaluate(el=>document.activeElement===el));
  }
  for(const [n,answer] of Object.entries(inventory.answers)){
   const card=page.locator('.q-card[data-q="'+n+'"]');await card.locator('[data-opt="'+answer.a+'"]').click();await page.locator('.q-score').getByText(n+' 問回答 / 正解 '+n+' / 10',{exact:true}).waitFor();assert.equal(await card.locator('.q-fb').textContent(),'正解です。 '+answer.e);
  }
  await page.locator('.q-reset').click();assert.equal(await page.locator('.q-score').textContent(),'0 問回答 / 正解 0 / 10');assert.equal(await page.locator('.q-fb:not([hidden])').count(),0);
  let checked=0;for(const list of await page.locator('.checklist').all()){const boxes=await list.locator('input').all();for(let i=0;i<boxes.length;i++){await boxes[i].check();assert.equal(await list.locator('.cl-progress').textContent(),(i+1)+' / '+boxes.length);checked++;}}assert.equal(checked,60);
  await page.locator('details.answers summary').click();assert.equal(await page.locator('details.answers').getAttribute('open'),'');
  await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await page.locator('html').evaluate(el=>getComputedStyle(el).scrollBehavior),'auto');
  console.log(JSON.stringify({width,status:response.status(),structures:Object.keys(actual.structures).length,counts:actual.counts,diagrams:drawn,pageErrors:errors.length}));await context.close();
 }
 assert.deepEqual(errors,[]);
}finally{await browser.close();}
