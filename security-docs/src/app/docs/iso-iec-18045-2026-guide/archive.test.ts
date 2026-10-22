import { expect, test } from 'bun:test';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dir, '../../../../..');
const originals = [
  { path: 'archive/html/Iso-iec-18045-2026-guide.html', sha256: '1ea7a3a4aac88d5bc70e5f568385ce1ee7967095655c91c43f2c282b622b4062' },
  { path: 'archive/md/Iso-iec-18045-2026-guide.md', sha256: 'e06ac5e84a7bcd889a13d28d54bf2e04de4e428fdb11a315db3397808713f269' },
];

for (const original of originals) {
  const path = resolve(root, original.path);
  test.skipIf(!existsSync(path))(`archive retains all source bytes: ${original.path}`, () => {
    expect(createHash('sha256').update(readFileSync(path)).digest('hex')).toBe(original.sha256);
  });
}

test('archival removes both original root paths', () => {
  expect(existsSync(resolve(root, 'Iso-iec-18045-2026-guide.html'))).toBe(false);
  expect(existsSync(resolve(root, 'Iso-iec-18045-2026-guide.md'))).toBe(false);
});

test('fidelity comparisons use only archived HTML and retain source-absent CI support', () => {
  const helper = readFileSync(new URL('./fidelity-helpers.ts', import.meta.url), 'utf8');
  expect(helper).toContain('../../../../../archive/html/Iso-iec-18045-2026-guide.html');
  expect(helper).not.toContain("'../../../../../Iso-iec-18045-2026-guide.html'");
  expect(helper).toContain('test.skipIf(!hasSource)');
});
