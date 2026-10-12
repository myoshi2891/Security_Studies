import { expect, test } from 'bun:test';
import { canonical, renderedPage, sectionContracts, sourceDocument } from './fidelity-helpers';

test('preserves the complete hero, multiline title, lead and information-date metadata', async () => {
  const migrated = (await renderedPage()).querySelector('.hero');
  expect(migrated).not.toBeNull();
  expect(canonical(migrated!)).toEqual(canonical(sourceDocument.querySelector('.hero')!));
});
sectionContracts(1, 4);
