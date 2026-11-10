/** npm exec with PLAYWRIGHT_MODULE_PATH, DOCS_BASE_URL, CHROME_PATH and ISSEP_QUIZ_RESULTS_PATH; automated checks, no build. CHROME_PATH sets the Chrome executable; without it Playwright uses its bundled browser. ISSEP_QUIZ_RESULTS_PATH sets the results file; by default each run writes a unique file in the OS temporary directory. */
import fs from 'node:fs';
import {createRequire} from 'node:module';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE_PATH??'playwright');
const copy=JSON.parse(fs.readFileSync(resolve(import.meta.dirname,'quiz-copy.json'),'utf8'));
const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
const results=[];
const resultsPath=process.env.ISSEP_QUIZ_RESULTS_PATH??join(tmpdir(),`issep-quiz-browser-results-${process.pid}-${Date.now()}.json`);
try {
 for(const width of [375,1440])for(const colorScheme of ['light','dark']){
  const context=await browser.newContext({viewport:{width,height:900},colorScheme});
  await context.addInitScript(()=>localStorage.setItem('security-docs:disclaimer-acknowledged','1'));
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  const response=await page.goto(new URL('/docs/issep-guide',process.env.DOCS_BASE_URL??'http://127.0.0.1:3107').href,{waitUntil:'domcontentloaded',timeout:90000});assert.equal(response.status(),200);
  const cards=await page.locator('.quiz').all();assert.equal(cards.length,10);assert.equal(await page.locator('.quiz-choice').count(),40);
  const snapshot=card=>card.evaluate(q=>({badge:q.querySelector('.q-badge').textContent,question:q.querySelector('.q-text').textContent,emphasis:[...q.querySelectorAll('.q-text strong')].map(e=>e.textContent),options:[...q.querySelectorAll('.q-opts li')].map(e=>e.textContent),summary:q.querySelector('summary').textContent,answer:q.querySelector('.answer').textContent}));
  for(let i=0;i<cards.length;i++){
   const card=cards[i];assert.deepEqual(await snapshot(card),copy[i]);
   await card.locator('.quiz-choice[data-hydrated="true"]').nth(3).waitFor();
   const buttons=await card.locator('.quiz-choice').all();const correct=copy[i].answer.trim()[0];
   for(let j=0;j<4;j++){
    await buttons[j].click();const ok=String.fromCharCode(65+j)===correct;
    assert.equal(await card.locator('[role="status"]').textContent(),ok?'正解':'不正解');
    assert.equal(await buttons[j].getAttribute('aria-pressed'),'true');assert.equal(await buttons[j].getAttribute('data-choice-state'),ok?'correct':'incorrect');
    assert.equal(await card.locator('[aria-pressed="true"]').count(),1);assert.equal(await card.locator('[aria-pressed="false"][aria-describedby]').count(),0);assert.equal(await card.locator('details').getAttribute('open'),'');
    assert.equal(await buttons[j].getAttribute('aria-describedby'),await card.locator('[role="status"]').getAttribute('id'));
    assert.deepEqual(await snapshot(card),copy[i]);
    const correctStyle=await buttons[correct.charCodeAt(0)-65].evaluate(e=>({color:getComputedStyle(e).color,background:getComputedStyle(e).backgroundColor}));
    if(!ok){const wrongStyle=await buttons[j].evaluate(e=>({color:getComputedStyle(e).color,background:getComputedStyle(e).backgroundColor}));assert.notDeepEqual(wrongStyle,correctStyle);}
   }
   const columns=await card.locator('.q-opts').evaluate(e=>getComputedStyle(e).gridTemplateColumns.trim().split(/\s+/).length);assert.equal(columns,width<=640?1:2);
   for(const button of buttons)assert.ok(await button.evaluate(e=>e.getBoundingClientRect().height>=56));
   assert.ok(await card.evaluate(e=>e.scrollWidth<=e.clientWidth+1));
  }
  const ids=await page.locator('.quiz-status').evaluateAll(els=>els.map(e=>e.id));assert.equal(new Set(ids).size,10);
  const first=cards[0],choices=first.locator('.quiz-choice');await choices.nth(0).focus();await page.keyboard.press('Tab');
  assert.equal(await choices.nth(1).evaluate(e=>document.activeElement===e),true);
  assert.equal(await choices.nth(1).evaluate(e=>getComputedStyle(e).outlineWidth),'3px');
  await page.keyboard.press('Enter');assert.equal(await first.locator('[role="status"]').textContent(),'正解');
  await choices.nth(0).focus();await page.keyboard.press('Space');assert.equal(await first.locator('[role="status"]').textContent(),'不正解');
  await first.locator('summary').click();assert.equal(await first.locator('details').getAttribute('open'),null);
  await choices.nth(1).click();assert.equal(await first.locator('details').getAttribute('open'),'');
  await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await choices.first().evaluate(e=>getComputedStyle(e).transitionDuration),'0s');
  assert.deepEqual(errors,[]);results.push({width,colorScheme,questions:10,choices:40,copyUnchanged:true,allChoicesGraded:true,keyboard:true,focus:true,minimumTarget:56,pageErrors:0});console.log(JSON.stringify(results.at(-1)));await context.close();
 }
} finally {
 try {await browser.close();}
 finally {fs.writeFileSync(resultsPath,JSON.stringify(results,null,2));console.log(`results: ${resultsPath}`);}
}
