import { describe, expect, test } from 'bun:test';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dir, '../../../../..');
const originals = [
  { path: 'archive/security-guides/Applied-cryptography-guide.html', sha256: '34681c8dc351e2940e337af70e7a4016078f3d0fb2410f557b8087ca351add47' },
  { path: 'archive/security-guides/Applied-cryptography-guide.md', sha256: '78eba4a5300e25287f79b8afc7b43b6a8169d736fba717255474e4f5a75579ad' },
];

describe('Applied Cryptography immutable source archive', () => {
  for (const original of originals) {
    const path = resolve(root, original.path);
    test.skipIf(!existsSync(path))(`preserves every source byte in ${original.path}`, () => {
      expect(createHash('sha256').update(readFileSync(path)).digest('hex')).toBe(original.sha256);
    });
  }

  test('removes both legacy root paths after archival', () => {
    expect(existsSync(resolve(root, 'Applied-cryptography-guide.html'))).toBe(false);
    expect(existsSync(resolve(root, 'Applied-cryptography-guide.md'))).toBe(false);
  });

  test('records both archived originals and their immutable hashes in the inventory', () => {
    const inventory = JSON.parse(readFileSync(resolve(root, 'docs/migration-inventory/applied-cryptography-guide.json'), 'utf8'));
    expect(inventory.source).toBe(originals[0].path);
    expect(inventory.htmlSha256).toBe(originals[0].sha256);
    expect(inventory.markdownSource).toBe(originals[1].path);
    expect(inventory.markdownSha256).toBe(originals[1].sha256);
    expect(inventory.route).toBe('/docs/applied-cryptography-guide');
  });

  test('keeps all original fidelity comparisons bound to the archived HTML without root fallback', () => {
    for (const [name, original, archived] of [
      ['fidelity-helpers.ts', '../../../../../Applied-cryptography-guide.html', '../../../../../archive/security-guides/Applied-cryptography-guide.html'],
      ['integration.test.tsx', '../../../../../Applied-cryptography-guide.md', '../../../../../archive/security-guides/Applied-cryptography-guide.md'],
    ]) {
      const implementation = readFileSync(resolve(import.meta.dir, name), 'utf8');
      expect(implementation).toContain(archived);
      expect(implementation).not.toContain(original);
    }
  });
});
