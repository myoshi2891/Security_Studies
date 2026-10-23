import { expect, test } from 'bun:test';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dir, '../../../../..');
const originals = [
  { path: 'archive/standards/Iso-15408-1-2026-guide.html', sha256: 'd8f5e8f9e5dbda86cb87917d9dc3bf1a2c89ec35fcf7567a9f4303fa5cf6a172' },
  { path: 'archive/standards/Iso-15408-1-2026-guide.md', sha256: 'b9a2fd23da47e1f745ab809966cc6d0ce303fb256a0c06c6022dce1f68092bc6' },
];

for (const original of originals) {
  const path = resolve(root, original.path);
  test.skipIf(!existsSync(path))(`archive retains all source bytes: ${original.path}`, () => {
    expect(createHash('sha256').update(readFileSync(path)).digest('hex')).toBe(original.sha256);
  });
}

test('archival removes both original root paths', () => {
  expect(existsSync(resolve(root, 'Iso-15408-1-2026-guide.html'))).toBe(false);
  expect(existsSync(resolve(root, 'Iso-15408-1-2026-guide.md'))).toBe(false);
});

test('fidelity comparisons use only archived HTML and retain source-absent CI support', () => {
  const helper = readFileSync(new URL('./fidelity-helpers.ts', import.meta.url), 'utf8');
  expect(helper).toContain('../../../../../archive/standards/Iso-15408-1-2026-guide.html');
  expect(helper).not.toContain("'../../../../../Iso-15408-1-2026-guide.html'");
  expect(helper).toContain('test.skipIf(!hasSource)');
});
