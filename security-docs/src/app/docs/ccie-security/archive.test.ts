import { describe, expect, test } from 'bun:test';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dir, '../../../../..');
const originals = [
  { path: 'archive/html/Ccie-security-guide.html', sha256: '807782fea60dfd5e0707868448e25809a932ceea36c205d7289264f13825c26b' },
  { path: 'archive/md/Ccie-security-guide.md', sha256: 'dc0930effc4e32cd8af34b2d439b37949f9fd35a1d25e70e42f177886d6d8036' },
];

describe('CCIE immutable source archive', () => {
  for (const original of originals) {
    test(`preserves every source byte in ${original.path}`, () => {
      const path = resolve(root, original.path);
      expect(existsSync(path)).toBe(true);
      expect(createHash('sha256').update(readFileSync(path)).digest('hex')).toBe(original.sha256);
    });
  }

  test('removes both legacy root paths after archival', () => {
    expect(existsSync(resolve(root, 'Ccie-security-guide.html'))).toBe(false);
    expect(existsSync(resolve(root, 'Ccie-security-guide.md'))).toBe(false);
  });

  test('records both archived originals and their immutable hashes in the inventory', () => {
    const inventory = JSON.parse(readFileSync(resolve(root, 'docs/migration-inventory/ccie-security.json'), 'utf8'));
    expect(inventory.source).toBe(originals[0].path);
    expect(inventory.sha256).toBe(originals[0].sha256);
    expect(inventory.markdownSource).toBe(originals[1].path);
    expect(inventory.markdownSha256).toBe(originals[1].sha256);
    expect(inventory.route).toBe('/docs/ccie-security');
  });

  test('keeps all original fidelity comparisons bound to the archived HTML without root fallback', () => {
    for (const name of ['fidelity-helpers.ts', 'foundation.test.tsx']) {
      const implementation = readFileSync(resolve(import.meta.dir, name), 'utf8');
      expect(implementation).toContain('../../../../../archive/html/Ccie-security-guide.html');
      expect(implementation).not.toContain("'../../../../../Ccie-security-guide.html'");
    }
  });
});
