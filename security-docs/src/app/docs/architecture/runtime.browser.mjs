/** Automated checks only. npm exec; Next dev; no screenshots or production build. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
const require=createRequire(import.meta.url),{chromium}=require('playwright');
const base=process.env.DOCS_BASE_URL??'http://127.0.0.1:3112';
const root=resolve(import.meta.dirname,'../../../../..');
const originalPath=[resolve(root,'archive/security-guides/Security-architecture-implementation-guide.html'),resolve(root,'Security-architecture-implementation-guide.html')].find(p=>fs.existsSync(p));
const html=fs.readFileSync(originalPath,'utf8').replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'').replace(/<link\b[^>]*>/g,'');
const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
const errors=[],results=[];
const selectors='h1,h2,h3,h4,h5,h6,th,td,.layout p,.layout ul,.layout ol,.layout li,code,em,strong,.hero,.eyebrow,.lead,.brand,.brand-mark,.brand-title,.brand-sub,#nav a,.ref-card,.ref-num,.ref-title,.ref-url,.callout,.tag,.glossary,.term,.legend,.ck-item,.ck-box,.ck-num,.ck-step,.ck-text,.footer,pre,.code-head,.lang,.copy-btn';
const props=['font-family','font-size','font-weight','letter-spacing','line-height','color','background-color','margin-top','margin-bottom','padding-top','padding-left','padding-right','padding-bottom','border-top-width','border-bottom-width','border-left-width','list-style-type','display','text-transform','text-decoration-line','box-shadow'];
try{
 for(const width of [375,768,1024,1025,1440])for(const theme of ['light','dark']){
  const context=await browser.newContext({viewport:{width,height:900},colorScheme:theme,permissions:['clipboard-read','clipboard-write']});
  await context.addInitScript(()=>localStorage.setItem('security-docs:disclaimer-acknowledged','1'));
  const page=await context.newPage(),source=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  const response=await page.goto(base+'/docs/architecture',{waitUntil:'networkidle'});assert.equal(response.status(),200);
  await source.setContent(html);
  const styles=async(p,scope)=>p.evaluate(({selectors,props,scope})=>[...document.querySelectorAll((scope?'.architecture-guide ':'')+selectors.split(',').join(scope?',.architecture-guide ':','))].filter(e=>!e.closest('.mermaid-target')).map(e=>({tag:e.tagName,cls:e.className,style:Object.fromEntries(props.map(p=>[p,getComputedStyle(e).getPropertyValue(p)])),marker:e.matches('li')?Object.fromEntries(['content','color','font-weight'].map(p=>[p,getComputedStyle(e,'::marker').getPropertyValue(p)])):null})),{selectors,props,scope});
  const a=await styles(page,true),o=await styles(source,false);assert.equal(a.length,o.length);
  const diffs=[];for(let i=0;i<a.length;i++){for(const p of props)if(a[i].style[p]!==o[i].style[p])diffs.push(`${i} ${a[i].tag}.${a[i].cls} ${p}: ${a[i].style[p]} != ${o[i].style[p]}`);if(JSON.stringify(a[i].marker)!==JSON.stringify(o[i].marker))diffs.push(`${i} marker differs`);}
  assert.deepEqual(diffs,[],`${width}/${theme} CSS differs`);
  // Native list styles and exact cell hovers are checked in the real browser cascade.
  const hover=await page.locator('.architecture-guide tbody tr').first().locator('td').first();await hover.hover();const hoverColor=await hover.evaluate(e=>getComputedStyle(e).backgroundColor);assert.equal(hoverColor,'rgb(10, 24, 41)');
  if(width===375||width===1440){
   const targets=page.locator('.architecture-guide .mermaid-target');assert.equal(await targets.count(),11);
   for(let i=0;i<11;i++){await targets.nth(i).scrollIntoViewIfNeeded();await targets.nth(i).locator('svg').waitFor({timeout:60000});const bounds=await targets.nth(i).evaluate(e=>{const svg=e.querySelector('svg');e.scrollLeft=1e8;return{container:e.clientWidth,width:svg.getBoundingClientRect().width,max:getComputedStyle(svg).maxWidth,reached:e.scrollLeft};});assert.equal(bounds.max,'none');if(bounds.width>bounds.container)assert.ok(bounds.reached>0);await targets.nth(i).evaluate(e=>{e.scrollLeft=0;});}
   const checks=page.locator('.ck-item input');for(let i=0;i<18;i++)await checks.nth(i).check({force:true});assert.equal(await page.locator('#ckDone').textContent(),'18');assert.equal(await page.locator('#ckBar').evaluate(e=>e.style.width),'100%');
   for(let i=0;i<18;i++)await checks.nth(i).uncheck({force:true});
   const copy=page.locator('.copy-btn');for(let i=0;i<10;i++){await copy.nth(i).click();await page.waitForFunction(i=>document.querySelectorAll('.copy-btn')[i].textContent.includes('コピーしました'),i);const text=await page.evaluate(()=>navigator.clipboard.readText());assert.equal(text,await copy.nth(i).evaluate(e=>e.closest('.code-block').querySelector('code').textContent));}
   if(width===375){await page.locator('#navToggle').click();assert.equal(await page.locator('#navToggle').getAttribute('aria-expanded'),'true');await page.keyboard.press('Escape');assert.equal(await page.locator('#navToggle').getAttribute('aria-expanded'),'false');}
  }
  results.push({width,theme,compared:a.length});await context.close();
 }
 assert.deepEqual(errors,[]);console.log(JSON.stringify({results,pageErrors:errors},null,2));
}finally{await browser.close();}
