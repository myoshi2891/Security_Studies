import { expect, test } from 'bun:test';
import { canonical, renderedPage, sectionContracts, sourceDocument } from './fidelity-helpers';
sectionContracts(['ch6', 's6-1', 's6-2', 's6-3', 's6-4', 's6-5', 's6-6', 'refs', 'ref-a', 'ref-b', 'ref-c', 'ref-d', 'ref-e', 'ref-f']);

test('preserves all 25 questions and all 100 answer options in their original order', async () => {
  const page = await renderedPage();
  expect(page.querySelectorAll('.qa')).toHaveLength(25);
  expect(page.querySelectorAll('.opt')).toHaveLength(100);
  expect([...page.querySelectorAll('.qa')].map(canonical)).toEqual([...sourceDocument.querySelectorAll('.qa')].map(canonical));
});
test('preserves all 60 numbered reference titles, URLs and source-status badges visibly', async () => {
  const refs = [...(await renderedPage()).querySelectorAll('.ref')];
  expect(refs).toHaveLength(60);
  expect(refs.map(canonical)).toEqual([...sourceDocument.querySelectorAll('.ref')].map(canonical));
  expect(refs.map(el => el.querySelector('.ref-n')!.textContent)).toEqual(Array.from({ length: 60 }, (_, i) => String(i + 1)));
  for (const ref of refs) expect(ref.closest('details')).toBeNull();
});
test('all 25 source checkboxes remain independently operable through their labels', async () => {
  const inputs = [...(await renderedPage()).querySelectorAll<HTMLInputElement>('.check input[type="checkbox"]')];
  expect(inputs).toHaveLength(25);
  for (const [index, input] of inputs.entries()) {
    input.closest('label')!.click();
    expect(inputs.map(el => el.checked)).toEqual(inputs.map((_el, i) => i === index));
    input.closest('label')!.click(); expect(input.checked).toBe(false);
  }
});
