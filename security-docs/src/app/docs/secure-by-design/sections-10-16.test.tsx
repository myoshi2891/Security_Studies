import { expect } from 'bun:test';
import { canonical, renderedPage, sectionContracts, sourceDocument, sourceTest } from './fidelity-helpers';

sectionContracts(10, 16);
sourceTest('preserves the complete footer and information-date disclaimer', async () => {
  const migrated = (await renderedPage()).querySelector('.footer');
  expect(migrated).not.toBeNull();
  expect(canonical(migrated!)).toEqual(canonical(sourceDocument.querySelector('.footer')!));
});
