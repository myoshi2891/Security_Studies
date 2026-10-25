/** Run through npm exec with Playwright available; reads the existing dev server, never builds it. */
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { delimiter, resolve } from 'node:path';
import { existsSync } from 'node:fs';
const require = createRequire(import.meta.url);
const candidates = [process.env.PLAYWRIGHT_MODULE_PATH, 'playwright', ...process.env.PATH.split(delimiter).map(bin => resolve(bin, '../playwright'))].filter(Boolean);
let playwright;
for (const candidate of candidates) {
  try { playwright = require(candidate); break; } catch (error) { if (error.code !== 'MODULE_NOT_FOUND') throw error; }
}
if (!playwright) throw new Error('Run with npm exec --package=playwright --call "node src/app/docs/cyberops-professional-guide/hover.browser.mjs", or set PLAYWRIGHT_MODULE_PATH.');
const chrome = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const browser = await playwright.chromium.launch({ headless: true, ...(existsSync(chrome) ? { executablePath: chrome } : {}) });
const failures = [];
try {
  for (const width of [375, 1440]) for (const colorScheme of ['light', 'dark']) {
    const context = await browser.newContext({ colorScheme, javaScriptEnabled: false, viewport: { width, height: 1000 } });
    try {
      const page = await context.newPage();
      await page.goto(new URL('/docs/cyberops-professional-guide', process.env.DOCS_BASE_URL ?? 'http://localhost:3000').href, { waitUntil: 'domcontentloaded', timeout: 50000 });
      await page.waitForFunction(() => {const root=document.querySelector('.cyberops-professional-guide');return root && getComputedStyle(root).getPropertyValue('--color-ink').trim().toLowerCase()==='#161b26' && getComputedStyle(document.documentElement).getPropertyValue('--zinc-900').trim()==='#18181b';});
      assert.equal(await page.locator('.cyberops-professional-guide table').count(), 122);
      const values = () => page.locator('.cyberops-professional-guide th,.cyberops-professional-guide td').evaluateAll(cells => cells.map(e => {
        const s = getComputedStyle(e); return { color: s.color, background: s.backgroundColor, border: s.borderBottomWidth };
      }));
      const before = await values(); assert.equal(before.length, 2051);
      // Force the real :hover pseudo-class in Chromium, including rows inside closed answer details.
      const cdp = await context.newCDPSession(page);
      await cdp.send('DOM.enable'); await cdp.send('CSS.enable');
      const { root } = await cdp.send('DOM.getDocument');
      const { nodeIds } = await cdp.send('DOM.querySelectorAll', { nodeId: root.nodeId, selector: '.cyberops-professional-guide tr' });
      await Promise.all(nodeIds.map(nodeId => cdp.send('CSS.forcePseudoState', { nodeId, forcedPseudoClasses: ['hover'] })));
      const after = await values();
      const differences = after.flatMap((value, cell) => JSON.stringify(value) === JSON.stringify(before[cell]) ? [] : [{ cell, before: before[cell], after: value }]);
      if (differences.length) failures.push({ width, colorScheme, changedCells: differences.length, samples: differences.slice(0, 3) });
      await Promise.all(nodeIds.map(nodeId => cdp.send('CSS.forcePseudoState', { nodeId, forcedPseudoClasses: [] })));
      // Also exercise actual pointer movement over odd/even rows, independently of CDP forcing.
      const cells = page.locator('.cyberops-professional-guide table').first().locator('tbody tr');
      for (let row = 0; row < 3; row++) {
        await page.mouse.move(0, 0); const cell = cells.nth(row).locator('td').first();
        const background = await cell.evaluate(e => getComputedStyle(e).backgroundColor);
        await cell.hover();
        const hovered = await cell.evaluate(e => getComputedStyle(e).backgroundColor);
        if (background !== hovered) failures.push({ width, colorScheme, pointerRow: row + 1, before: background, after: hovered });
      }
      const markers=await page.locator('.guide-content').evaluate(root=>{
        const props=e=>{const s=getComputedStyle(e,'::before');return {content:s.content,background:s.backgroundColor,color:s.color,width:s.width,height:s.height,radius:s.borderRadius};};
        return {ul:[...root.querySelectorAll('ul>li')].map(props),ol:[...root.querySelectorAll('ol>li')].map(props),resets:[...root.querySelectorAll('ol')].map(e=>getComputedStyle(e).counterReset)};
      });
      assert.equal(markers.ul.length+markers.ol.length,190);
      for(const marker of markers.ul){assert.equal(marker.background,'rgb(184, 128, 42)');assert.equal(marker.width,'6px');assert.equal(marker.height,'6px');assert.equal(marker.radius,'50%');assert.equal(marker.content,'""');}
      for(const marker of markers.ol){assert.equal(marker.background,'rgb(46, 63, 114)');assert.equal(marker.color,'rgb(246, 247, 249)');assert.equal(marker.radius,'50%');assert.equal(marker.content,'counter(n)');}
      assert.equal(markers.resets.length,14);for(const reset of markers.resets)assert.equal(reset,'n 0');
      console.log(JSON.stringify({ width, colorScheme, tables: 122, cells: before.length, changedCells: differences.length }));
    } finally { await context.close(); }
  }
} finally { await browser.close(); }
assert.deepEqual(failures, [], JSON.stringify(failures, null, 2));
