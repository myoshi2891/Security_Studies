/** Strict automated Next dev checks; no screenshots, visual review or production build. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
const require=createRequire(import.meta.url),{chromium}=require(process.env.PLAYWRIGHT_MODULE_PATH??'playwright'),postcss=require('postcss'),hljs=require('highlight.js');
const base=process.env.DOCS_BASE_URL??'http://127.0.0.1:3107',route='/docs/scs-evaluation-threat-analysis-guide',root=resolve(import.meta.dirname,'../../../../..');
const inventory=JSON.parse(fs.readFileSync(resolve(root,'docs/migration-inventory/scs-evaluation-threat-analysis-guide.json'),'utf8'));
const sourcePath=[resolve(root,'archive/security-guides/Scs-evaluation-threat-analysis-guide.html'),resolve(root,'Scs-evaluation-threat-analysis-guide.html')].find(p=>fs.existsSync(p));
const theme=fs.readFileSync(require.resolve('highlight.js/styles/github.css'),'utf8');
const sourceHtml=sourcePath?fs.readFileSync(sourcePath,'utf8').replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'').replace(/<link\b[^>]*>/g,'').replace('<style>','<style>'+theme+'</style><style>'):null;
const selectors='h1,h2,h3,th,td,.guide-content p,.guide-content ul,.guide-content ol,.guide-content li,code,strong,pre code span,.hero,.eyebrow,.brand,.brand-name,.brand-sub,#nav a,.callout,.callout-title,.callout-body,.checklist label,.ck-n,.ck-text,.footer,pre,details.qa,details.qa summary,.qa-body';
const properties=['font-family','font-size','font-weight','letter-spacing','line-height','color','background-color','margin-top','margin-bottom','padding-top','padding-left','padding-right','padding-bottom','border-top-width','border-bottom-width','border-left-width','list-style-type','display','text-transform','text-decoration-line','box-shadow'];
const pseudos=['content','width','height','border-radius','color','background-color','font-weight','line-height','left','top'];
const styleFiles=[resolve(import.meta.dirname,'../../globals.css'),resolve(import.meta.dirname,'scs-guide.css')];let hoverRules='';
for(const file of styleFiles)postcss.parse(fs.readFileSync(file,'utf8')).walkRules(r=>{if(!r.selector.includes('tr:hover')&&!r.selector.includes('tr:nth-child(even):hover'))return;let rule=r.toString().replaceAll(':hover','.hover-probe');for(let p=r.parent;p&&p.type==='atrule';p=p.parent)rule=`@${p.name} ${p.params}{${rule}}`;hoverRules+=rule+'\n';});
const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
const errors=[],results=[];
try{
 for(const width of [375,768,1024,1025,1440])for(const colorScheme of ['light','dark']){
  const context=await browser.newContext({viewport:{width,height:900},colorScheme});await context.addInitScript(()=>localStorage.setItem('security-docs:disclaimer-acknowledged','1'));
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));const response=await page.goto(base+route,{waitUntil:'networkidle'});assert.equal(response.status(),200);
  await page.evaluate(()=>document.fonts.ready);assert.ok(await page.evaluate(()=>document.fonts.check('600 16px "Source Serif 4"','SCS')),'the local serif face is loaded');
  const initial=await page.locator('.scs-guide').evaluate((guide,inventory)=>({counts:Object.fromEntries(Object.keys(inventory.counts).map(s=>[s,guide.querySelectorAll(s).length])),headings:[...guide.querySelectorAll('h1,h2,h3')].map(e=>e.textContent.replace(/\s+/g,' ').trim())}),inventory);
  assert.deepEqual(initial.counts,inventory.counts);assert.deepEqual(initial.headings,inventory.headings);
  let compared=0;
  if(sourceHtml){
   const source=await context.newPage();await source.setContent(sourceHtml);const code=await source.locator('pre code').evaluateAll(es=>es.map(e=>({text:e.textContent,language:/language-([\w-]+)/.exec(e.className)?.[1]})));const highlighted=code.map(c=>hljs.highlight(c.text,{language:c.language}).value);await source.locator('pre code').evaluateAll((es,html)=>es.forEach((e,i)=>{e.classList.add('hljs');e.innerHTML=html[i];}),highlighted);
   const styles=async(p,actual)=>p.evaluate(({selectors,properties,pseudos,actual})=>{
    const active=[...document.querySelectorAll('#nav a.active')];active.forEach(e=>e.classList.remove('active'));
    const cssSelectors=selectors.split(',').map(s=>actual?'.scs-guide '+s:s.replaceAll('.guide-content','main')).join(',');
    const rows=[...document.querySelectorAll(cssSelectors)].filter(e=>!e.closest('.diagram')).map(e=>({tag:e.tagName,style:Object.fromEntries(properties.map(p=>[p,getComputedStyle(e).getPropertyValue(p)])),before:e.matches('li,.ck-n')?Object.fromEntries(pseudos.map(p=>[p,getComputedStyle(e,'::before').getPropertyValue(p)])):null}));active.forEach(e=>e.classList.add('active'));return rows;
   },{selectors,properties,pseudos,actual});
   const a=await styles(page,true),o=await styles(source,false);assert.equal(a.length,o.length);compared=a.length;const diffs=[];
   for(let i=0;i<a.length;i++){for(const p of properties)if(a[i].style[p]!==o[i].style[p])diffs.push(`${i} ${a[i].tag} ${p}: ${a[i].style[p]} != ${o[i].style[p]}`);if(JSON.stringify(a[i].before)!==JSON.stringify(o[i].before))diffs.push(`${i} ${a[i].tag} pseudo: ${JSON.stringify(a[i].before)} != ${JSON.stringify(o[i].before)}`);}assert.deepEqual(diffs,[],`${width}/${colorScheme} source cascade differs`);
   const cells=async p=>p.locator('th,td').evaluateAll(es=>es.map(e=>Object.fromEntries(['background-color','color','border-bottom-width'].map(k=>[k,getComputedStyle(e).getPropertyValue(k)]))));
   const expected=await cells(source);const probe=await page.addStyleTag({content:hoverRules});await page.locator('.scs-guide tr').evaluateAll(es=>es.forEach(e=>e.classList.add('hover-probe')));assert.deepEqual(await page.locator('.scs-guide th,.scs-guide td').evaluateAll(es=>es.map(e=>Object.fromEntries(['background-color','color','border-bottom-width'].map(k=>[k,getComputedStyle(e).getPropertyValue(k)])))),expected,`${width}/${colorScheme} all 865 hovered cells retain source colors`);await page.locator('.scs-guide tr').evaluateAll(es=>es.forEach(e=>e.classList.remove('hover-probe')));await probe.evaluate(e=>e.remove());await source.close();
  }
  if(width===375||width===1440){
   for(const target of await page.locator('.scs-guide [data-diagram]').all()){
    await target.scrollIntoViewIfNeeded();await target.locator('svg').waitFor({timeout:60000});const box=await target.evaluate(e=>{const svg=e.querySelector('svg');e.scrollLeft=0;const outer=e.getBoundingClientRect(),inner=svg.getBoundingClientRect(),padding=parseFloat(getComputedStyle(e).paddingLeft);const left=inner.left-outer.left-padding;e.scrollLeft=1e8;return{left,width:inner.width,natural:svg.viewBox.baseVal.width,available:e.clientWidth-padding*2,scroll:e.scrollLeft,max:e.scrollWidth-e.clientWidth};});assert.ok(box.width>=box.natural-1);assert.ok(box.left>=-1,'left edge reachable');assert.equal(box.scroll,box.max,'right edge reachable');if(box.width<box.available)assert.ok(Math.abs(box.left-(box.available-box.width)/2)<3,'small diagram centered');await target.evaluate(e=>{e.scrollLeft=0;});
   }
   for(const label of await page.locator('.checklist label').all()){const input=label.locator('input'),before=await label.evaluate(e=>getComputedStyle(e).backgroundColor);await input.check();assert.equal(await label.locator('.ck-text').evaluate(e=>getComputedStyle(e).textDecorationLine),'line-through');assert.notEqual(await label.evaluate(e=>getComputedStyle(e).backgroundColor),before);await input.uncheck();}
   for(const qa of await page.locator('details.qa').all()){await qa.locator('summary').click();assert.ok(await qa.evaluate(e=>e.open));await qa.locator('summary').click();assert.equal(await qa.evaluate(e=>e.open),false);}
   if(width===375){await page.locator('#menuBtn').click();assert.equal(await page.locator('#menuBtn').getAttribute('aria-expanded'),'true');await page.keyboard.press('Escape');assert.equal(await page.locator('#menuBtn').getAttribute('aria-expanded'),'false');await page.locator('#menuBtn').click();await page.locator('#nav a[href="#s84"]').click();assert.equal(await page.locator('#menuBtn').getAttribute('aria-expanded'),'false');}
   await page.getByRole('button',{name:/ガイド一覧|^ガイド/}).click();assert.equal(await page.locator(`.docs-global-navigation a[href="${route}"]`).count(),1);await page.keyboard.press('Escape');await page.getByRole('button',{name:/Search/}).click();await page.getByPlaceholder('Search documentation...').fill('SCS評価制度');await page.getByRole('button',{name:/最新セキュリティ対策アプローチ/}).waitFor();await page.keyboard.press('Escape');
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'page width stays within viewport');
  }
  await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).scrollBehavior),'auto');await page.emulateMedia({reducedMotion:'no-preference'});assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).scrollBehavior),'smooth');
  results.push({width,colorScheme,compared,originalAvailable:!!sourceHtml});await context.close();
 }
 assert.deepEqual(errors,[]);console.log(JSON.stringify({results,pageErrors:errors},null,2));
}finally{await browser.close();}
