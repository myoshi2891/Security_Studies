import { expect, test } from 'bun:test';
import { canonical, renderedPage, sectionContracts, sourceDocument } from './fidelity-helpers';

sectionContracts(10, 16);
test('preserves the complete footer and information-date disclaimer', async () => {
  const migrated = (await renderedPage()).querySelector('.footer');
  expect(migrated).not.toBeNull();
  expect(canonical(migrated!)).toEqual(canonical(sourceDocument.querySelector('.footer')!));
});
