import fs from 'node:fs';
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
import { verifyChapterScroll } from '../../../../scripts/browser-chapter-scroll.mjs';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH ?? 'playwright');
const browser = await chromium.launch({ headless: true, ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) });
const results = [], errors = [];
try {
  for (const width of [375, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
    try {
      await context.addInitScript(() => localStorage.setItem('security-docs:disclaimer-acknowledged', '1'));
      const page = await context.newPage();
      page.on('pageerror', error => errors.push(error.message));
      const response = await page.goto(new URL('/docs/iso-iec-24759-2025-guide', process.env.DOCS_BASE_URL ?? 'http://127.0.0.1:3107').href, { waitUntil: 'networkidle' });
      assert.equal(response.status(), 200);
      const guide = page.locator('.iso24759-guide'), sidebar = guide.locator('.sidebar'), content = guide.locator('.main');
      if (width === 1440) {
        const followed = await verifyChapterScroll(page, '.iso24759-guide');
        assert.equal(followed.length, 4);
        const target = await guide.locator('section[id]').nth(6).getAttribute('id');
        await page.evaluate(id => { history.replaceState(null, '', '#' + encodeURIComponent(id)); window.dispatchEvent(new HashChangeEvent('hashchange')); }, target);
        const current = () => sidebar.locator('[aria-current="location"]').getAttribute('href');
        assert.equal(decodeURIComponent(await current()), '#' + target);
        const scrollTop = await page.evaluate(() => window.scrollY);
        await sidebar.hover(); await page.mouse.wheel(0, 250);
        await page.waitForTimeout(200);
        assert.equal(decodeURIComponent(await current()), '#' + target, 'desktop TOC wheel must preserve the navigation pin');
        assert.equal(await page.evaluate(() => window.scrollY), scrollTop);
        await page.mouse.move(1000, 500); await page.mouse.wheel(0, 250);
        await page.waitForFunction(id => decodeURIComponent(document.querySelector('.sidebar [aria-current="location"]').hash.slice(1)) !== id, target);
      } else {
        const toggle = guide.locator('#menuBtn');
        await toggle.click();
        assert.equal(await sidebar.getAttribute('role'), 'dialog');
        assert.equal(await sidebar.getAttribute('aria-modal'), 'true');
        assert.equal(await content.evaluate(element => element.inert), true);
        const cdp = await context.newCDPSession(page);
        const tree = await cdp.send('Accessibility.getFullAXTree');
        assert.ok(!tree.nodes.some(node => !node.ignored && node.role?.value === 'heading' && node.name?.value.includes('初学者向け')));
        const close = sidebar.getByRole('button', { name: '目次を閉じる' });
        await page.keyboard.press('Shift+Tab'); assert.ok(await close.evaluate(element => element === document.activeElement));
        await close.click(); assert.equal(await content.evaluate(element => element.inert), false);
        for (const modifier of ['Control', 'Meta']) {
          await toggle.click(); await page.keyboard.press(`${modifier}+k`);
          const search = page.getByRole('dialog', { name: 'Search' }); await search.waitFor();
          assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
          assert.ok(await search.getByRole('textbox').evaluate(element => element === document.activeElement));
          await page.keyboard.press('Tab'); assert.ok(await search.evaluate(element => element.contains(document.activeElement)));
          await page.keyboard.press('Escape'); await search.waitFor({ state: 'hidden' });
        }
        await toggle.click();
        const link = sidebar.locator('nav a').nth(3), id = decodeURIComponent((await link.getAttribute('href')).slice(1));
        const originalUrl = page.url(), selected = await sidebar.locator('[aria-current]').getAttribute('href');
        const [popup] = await Promise.all([context.waitForEvent('page'), link.click({ modifiers: ['ControlOrMeta'] })]);
        await popup.waitForURL(url => decodeURIComponent(url.hash.slice(1)) === id);
        assert.equal(page.url(), originalUrl); assert.equal(await toggle.getAttribute('aria-expanded'), 'true');
        assert.equal(await sidebar.locator('[aria-current]').getAttribute('href'), selected);
        await popup.close();
        await link.click();
        assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
        assert.equal(await content.evaluate(element => element.inert), false);
        assert.ok(await page.evaluate(id => document.activeElement === document.getElementById(id).querySelector('h2'), id));
      }
      let drawn = 0;
      for (const figure of await guide.locator('[data-diagram]').all()) {
        await figure.scrollIntoViewIfNeeded();
        await figure.locator('.diagram-viewport svg').waitFor({ timeout: 30000 });
        drawn++;
      }
      assert.equal(drawn, 8);
      if (width === 375) await guide.locator('#menuBtn').click();
      await page.emulateMedia({ media: 'print' });
      for (const control of await guide.locator('.sidebar,.backdrop,.menu-btn').all()) assert.equal(await control.evaluate(element => getComputedStyle(element).display), 'none');
      assert.equal(await content.evaluate(element => getComputedStyle(element).marginLeft), '0px');
      for (const description of await guide.locator('.diagram-print-description').all()) assert.equal(await description.isVisible(), true);
      const colors = await guide.locator('.main,.main h1,.main h2,.main p,.main td,.diagram-print-description').evaluateAll(elements => [...new Set(elements.filter(element => !element.closest('svg')).map(element => getComputedStyle(element).color))]);
      for (const color of colors) {
        const channels = color.match(/[\d.]+/g).slice(0, 3).map(value => { const channel = Number(value) / 255; return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4; });
        const luminance = channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
        assert.ok(1.05 / (luminance + 0.05) >= 4.5, `print text contrasts against white without background graphics: ${color}`);
      }
      results.push({ width, scrollFollowing: width === 1440, modalDrawer: width === 375, diagrams: drawn, print: true });
      console.log(JSON.stringify(results.at(-1)));
    } finally { await context.close(); }
  }
  assert.deepEqual(errors, []);
} finally {
  await browser.close();
  fs.writeFileSync('/tmp/iso24759-runtime-results.json', JSON.stringify(results, null, 2));
}
