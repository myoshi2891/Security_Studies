import { describe, expect } from 'bun:test';
import { assertSourceHash, canonical, chapterContracts, renderedPage, sourceDocument, sourceTest } from './fidelity-helpers';

describe('CCIE chapters 1–4', () => {
  sourceTest('source inventory is immutable', assertSourceHash);
  sourceTest('preserves title, audience, original date and starting URL', async () => {
    const page = await renderedPage();
    expect(canonical(page.querySelector('.hero')!)).toEqual(canonical(sourceDocument.querySelector('main .hero')!));
  });
  chapterContracts(1, 4);
});
