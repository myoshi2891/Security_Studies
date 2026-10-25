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
if (!playwright) throw new Error('Run with npm exec --package=playwright --call "node src/app/docs/cyberops-associate-guide/hover.browser.mjs", or set PLAYWRIGHT_MODULE_PATH.');
const chrome = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const browser = await playwright.chromium.launch({ headless: true, ...(existsSync(chrome) ? { executablePath: chrome } : {}) });
const failures = [];
try {
  for (const width of [375, 1440]) for (const colorScheme of ['light', 'dark']) {
    const context = await browser.newContext({ colorScheme, javaScriptEnabled: false, viewport: { width, height: 1000 } });
    try {
      const page = await context.newPage();
      await page.goto(new URL('/docs/cyberops-associate-guide', process.env.DOCS_BASE_URL ?? 'http://localhost:3000').href, { waitUntil: 'load', timeout: 50000 });
      assert.equal(await page.locator('.cyberops-associate-guide table').count(), 135);
      const values = () => page.locator('.cyberops-associate-guide th,.cyberops-associate-guide td').evaluateAll(cells => cells.map(e => {
        const s = getComputedStyle(e); return { color: s.color, background: s.backgroundColor, border: s.borderBottomWidth };
      }));
      const before = await values(); assert.equal(before.length, 2706);
      // Force the real :hover pseudo-class in Chromium, including rows inside closed answer details.
      const cdp = await context.newCDPSession(page);
      await cdp.send('DOM.enable'); await cdp.send('CSS.enable');
      const { root } = await cdp.send('DOM.getDocument');
      const { nodeIds } = await cdp.send('DOM.querySelectorAll', { nodeId: root.nodeId, selector: '.cyberops-associate-guide tr' });
      await Promise.all(nodeIds.map(nodeId => cdp.send('CSS.forcePseudoState', { nodeId, forcedPseudoClasses: ['hover'] })));
      const after = await values();
      const differences = after.flatMap((value, cell) => JSON.stringify(value) === JSON.stringify(before[cell]) ? [] : [{ cell, before: before[cell], after: value }]);
      if (differences.length) failures.push({ width, colorScheme, changedCells: differences.length, samples: differences.slice(0, 3) });
      await Promise.all(nodeIds.map(nodeId => cdp.send('CSS.forcePseudoState', { nodeId, forcedPseudoClasses: [] })));
      // Also exercise actual pointer movement over odd/even rows, independently of CDP forcing.
      const cells = page.locator('.cyberops-associate-guide table').first().locator('tbody tr');
      for (let row = 0; row < 3; row++) {
        await page.mouse.move(0, 0); const cell = cells.nth(row).locator('td').first();
        const background = await cell.evaluate(e => getComputedStyle(e).backgroundColor);
        await cell.hover();
        const hovered = await cell.evaluate(e => getComputedStyle(e).backgroundColor);
        if (background !== hovered) failures.push({ width, colorScheme, pointerRow: row + 1, before: background, after: hovered });
      }
      console.log(JSON.stringify({ width, colorScheme, tables: 135, cells: before.length, changedCells: differences.length }));
    } finally { await context.close(); }
  }
} finally { await browser.close(); }
assert.deepEqual(failures, [], JSON.stringify(failures, null, 2));
