import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH ?? 'playwright');
const browser = await chromium.launch({ headless: true, ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) });
const route = '/docs/scs-evaluation-threat-analysis-guide', errors = [];
try {
  for (const width of [375, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    try {
      await context.addInitScript(() => localStorage.setItem('security-docs:disclaimer-acknowledged', '1'));
      const page = await context.newPage();
      page.on('pageerror', error => errors.push(error.message));
      const response = await page.goto(new URL(route, process.env.DOCS_BASE_URL ?? 'http://127.0.0.1:3107').href, { waitUntil: 'networkidle' });
      assert.equal(response.status(), 200);
      assert.equal(await page.getByRole('heading', { level: 1 }).count(), 1);
      assert.equal(await page.getByRole('heading', { name: '8. 90日アクションプラン', exact: true }).count(), 1);
      assert.equal(await page.getByRole('heading', { name: /6\. ハンズオン/ }).count(), 1);
      let drawn = 0;
      for (const figure of await page.locator('[data-diagram]').all()) {
        await figure.scrollIntoViewIfNeeded();
        await figure.locator('.diagram-viewport svg').waitFor({ timeout: 30000 });
        const bounds = await figure.locator('.diagram-viewport').evaluate(viewport => {
          const svg = viewport.querySelector('svg'); viewport.scrollLeft = 0;
          const outer = viewport.getBoundingClientRect(), inner = svg.getBoundingClientRect();
          const left = inner.left - outer.left; viewport.scrollLeft = viewport.scrollWidth;
          return { width: inner.width, naturalWidth: svg.viewBox.baseVal.width, viewport: outer.width, left, scroll: viewport.scrollLeft, max: viewport.scrollWidth - viewport.clientWidth, overflowX: getComputedStyle(viewport).overflowX };
        });
        assert.ok(bounds.width >= bounds.naturalWidth - 1, 'diagrams retain their natural width');
        if (bounds.max > 0) assert.ok(['auto', 'scroll'].includes(bounds.overflowX), 'oversized diagrams use scrollable horizontal overflow');
        assert.ok(bounds.left >= -1, 'diagram left edge remains reachable');
        assert.equal(bounds.scroll, bounds.max, 'diagram right edge remains reachable');
        if (bounds.width < bounds.viewport) assert.ok(Math.abs(bounds.left - (bounds.viewport - bounds.width) / 2) < 2, 'small diagrams stay centered');
        drawn++;
      }
      assert.equal(drawn, 14);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), 'wide diagrams and tables must not overflow the page');
      await page.getByRole('button', { name: /ガイド一覧|^ガイド/ }).click();
      assert.equal(await page.locator(`.docs-global-navigation a[href="${route}"]`).count(), 1);
      await page.keyboard.press('Escape');
      await page.getByRole('button', { name: /Search/ }).click();
      await page.getByPlaceholder('Search documentation...').fill('SCS評価制度');
      await page.getByRole('button', { name: /最新セキュリティ対策アプローチ/ }).waitFor();
      await page.keyboard.press('Escape');
      await page.screenshot({ path: join(tmpdir(), `scs-guide-${width}.png`), fullPage: true });
      console.log(JSON.stringify({ width, status: response.status(), diagrams: drawn, navigation: true, search: true }));
    } finally { await context.close(); }
  }
  assert.deepEqual(errors, []);
} finally { await browser.close(); }
