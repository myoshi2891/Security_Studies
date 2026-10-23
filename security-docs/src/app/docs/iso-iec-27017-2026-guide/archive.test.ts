import { expect, test } from 'bun:test';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dir, '../../../../..');
const originals = [
  { path: 'archive/standards/Iso-27017-2026-guide.html', sha256: 'febe0dab1f1796d0cd80a7700a0bade732f51266f45262193afcf0934c414c32' },
  { path: 'archive/standards/Iso-27017-2026-guide.md', sha256: '9e02a328e4cd257b6579761ab0d49a21f403ca3c040b1fc97352b7080440bcd6' },
];

for (const original of originals) {
  const path = resolve(root, original.path);
  test.skipIf(!existsSync(path))(`archive retains all source bytes: ${original.path}`, () => {
    expect(createHash('sha256').update(readFileSync(path)).digest('hex')).toBe(original.sha256);
  });
}

test('archival removes both original root paths', () => {
  expect(existsSync(resolve(root, 'Iso-27017-2026-guide.html'))).toBe(false);
  expect(existsSync(resolve(root, 'Iso-27017-2026-guide.md'))).toBe(false);
});

test('fidelity comparisons use only archived HTML and retain source-absent CI support', () => {
  const helper = readFileSync(new URL('./fidelity-helpers.ts', import.meta.url), 'utf8');
  expect(helper).toContain('../../../../../archive/standards/Iso-27017-2026-guide.html');
  expect(helper).not.toContain("'../../../../../Iso-27017-2026-guide.html'");
  expect(helper).toContain('test.skipIf(!hasSource)');
});
