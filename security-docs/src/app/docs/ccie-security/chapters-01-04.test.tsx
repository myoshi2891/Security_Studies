import { describe, expect, test } from 'bun:test';
import { assertSourceHash, canonical, chapterContracts, renderedPage, sourceDocument } from './fidelity-helpers';

describe('CCIE chapters 1–4', () => {
  test('source inventory is immutable', assertSourceHash);
  test('preserves title, audience, original date and starting URL', async () => {
    const page = await renderedPage();
    expect(canonical(page.querySelector('.hero')!)).toEqual(canonical(sourceDocument.querySelector('main .hero')!));
  });
  chapterContracts(1, 4);
});
