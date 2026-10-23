import { describe, expect, test } from 'bun:test';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dir, '../../../../..');
const originals = [
  { path: 'archive/security-guides/Threat-modeling-guide.html', sha256: 'f68d807a87617cfc32db27ff1adfcab63536141f3c45efbac9bbd100c652823c' },
  { path: 'archive/security-guides/Threat-modeling-guide.md', sha256: '8be9ece4e84da057547b6c1f6ab9e800575a41f8b262ee7345d144175d695148' },
];

describe('Threat Modeling immutable source archive', () => {
  for (const original of originals) {
    const path = resolve(root, original.path);
    test.skipIf(!existsSync(path))(`preserves every source byte in ${original.path}`, () => {
      expect(createHash('sha256').update(readFileSync(path)).digest('hex')).toBe(original.sha256);
    });
  }

  test('removes both legacy root paths after archival', () => {
    expect(existsSync(resolve(root, 'Threat-modeling-guide.html'))).toBe(false);
    expect(existsSync(resolve(root, 'Threat-modeling-guide.md'))).toBe(false);
  });

  test('records both archived originals and their immutable hashes in the inventory', () => {
    const inventory = JSON.parse(readFileSync(resolve(root, 'docs/migration-inventory/threat-modeling-guide.json'), 'utf8'));
    expect(inventory.source).toBe(originals[0].path);
    expect(inventory.htmlSha256).toBe(originals[0].sha256);
    expect(inventory.markdownSource).toBe(originals[1].path);
    expect(inventory.markdownSha256).toBe(originals[1].sha256);
    expect(inventory.route).toBe('/docs/threat-modeling-guide');
  });

  test('keeps all original fidelity comparisons bound to the archived HTML without root fallback', () => {
    for (const [name, original, archived] of [
      ['fidelity-helpers.ts', '../../../../../Threat-modeling-guide.html', '../../../../../archive/security-guides/Threat-modeling-guide.html'],
      ['integration.test.tsx', '../../../../../Threat-modeling-guide.md', '../../../../../archive/security-guides/Threat-modeling-guide.md'],
    ]) {
      const implementation = readFileSync(resolve(import.meta.dir, name), 'utf8');
      expect(implementation).toContain(archived);
      expect(implementation).not.toContain(original);
    }
  });
});
