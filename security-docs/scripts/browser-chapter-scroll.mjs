import assert from 'node:assert/strict';

/** Exercise native intersection tracking against actual chapter geometry, without link navigation. */
export async function verifyChapterScroll(page, guide) {
  const originalUrl = page.url();
  const ids = await page.locator(`${guide} section[id]`).evaluateAll(sections => sections.map(section => section.id));
  const followed = [];
  for (const index of [1, 3, 6, 2]) {
    const id = ids[index];
    await page.evaluate(id => {
      const section = document.getElementById(id);
      window.scrollTo({ top: window.scrollY + section.getBoundingClientRect().top - 120, behavior: 'instant' });
    }, id);
    await page.waitForFunction(({ guide, id }) => {
      const section = document.getElementById(id), bounds = section.getBoundingClientRect();
      const selected = document.querySelector(`${guide} .sidebar nav [aria-current="location"]`);
      const target = selected && document.getElementById(decodeURIComponent(selected.hash.slice(1)));
      return bounds.top <= 200 && bounds.bottom > 200 && target?.closest('section[id]')?.id === id;
    }, { guide, id });
    assert.equal(page.url(), originalUrl, 'scroll tracking must not change the URL fragment');
    followed.push(id);
  }
  return followed;
}
