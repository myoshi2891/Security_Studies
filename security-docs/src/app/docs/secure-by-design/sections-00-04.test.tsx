import { expect } from 'bun:test';
import { canonical, renderedPage, sectionContracts, sourceDocument, sourceTest } from './fidelity-helpers';

sourceTest('preserves the complete hero, subtitle and four metadata entries', async () => {
  const migrated = (await renderedPage()).querySelector('.hero');
  expect(migrated).not.toBeNull();
  expect(canonical(migrated!)).toEqual(canonical(sourceDocument.querySelector('.hero')!));
});
sectionContracts(0, 4);
