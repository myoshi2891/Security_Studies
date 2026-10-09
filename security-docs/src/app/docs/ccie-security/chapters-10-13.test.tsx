import { describe, expect, test } from 'bun:test';
import { canonical, chapterContracts, renderedPage, sourceDocument } from './fidelity-helpers';

describe('CCIE chapters 10–13', () => {
  chapterContracts(10, 13);
  test('preserves all 59 reference numbers, titles, URLs and status labels, always visible', async () => {
    const page = await renderedPage();
    const refs = [...page.querySelectorAll('.ref')];
    expect(refs).toHaveLength(59);
    expect(refs.map(canonical)).toEqual([...sourceDocument.querySelectorAll('.ref')].map(canonical));
    for (const ref of refs) expect(ref.closest('details')).toBeNull();
  });
  test('all seven numbered checkboxes toggle independently through their labels', async () => {
    const page = await renderedPage();
    const inputs = [...page.querySelectorAll<HTMLInputElement>('.check input[type="checkbox"]')];
    expect(inputs).toHaveLength(7);
    for (const [index, input] of inputs.entries()) {
      expect(input.checked).toBe(false);
      input.closest('label')!.click();
      expect(inputs.map(el => el.checked)).toEqual(inputs.map((_el, i) => i === index));
      input.closest('label')!.click();
      expect(input.checked).toBe(false);
    }
  });
  test('retains the original footer without dropping its limits and attribution', async () => {
    expect(canonical((await renderedPage()).querySelector('.footer')!)).toEqual(canonical(sourceDocument.querySelector('main .footer')!));
  });
});
