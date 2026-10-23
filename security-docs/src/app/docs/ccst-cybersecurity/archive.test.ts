import { describe, expect, test } from 'bun:test';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dir, '../../../../..');
const originals = [
  { path: 'archive/security-certifications/Ccst-cybersecurity-guide.html', sha256: 'cc8abf8ebc61e443018ce43196b93e55a3f20cfbb4791333cd34c4ab67d8ac4e' },
  { path: 'archive/security-certifications/Ccst-cybersecurity-guide.md', sha256: 'c407e02339596075ba888292cfec00028c197e482cc4ceae66296b651d832502' },
];

describe('CCST immutable source archive', () => {
  for (const original of originals) {
    // 原本ごとの存在で判定する（HTML だけある環境で MD 側が失敗しないように）
    const path = resolve(root, original.path);
    test.skipIf(!existsSync(path))(`preserves every source byte in ${original.path}`, () => {
      expect(existsSync(path)).toBe(true);
      expect(createHash('sha256').update(readFileSync(path)).digest('hex')).toBe(original.sha256);
    });
  }

  test('removes both legacy root paths after archival', () => {
    expect(existsSync(resolve(root, 'Ccst-cybersecurity-guide.html'))).toBe(false);
    expect(existsSync(resolve(root, 'Ccst-cybersecurity-guide.md'))).toBe(false);
  });

  test('records both archived originals and their immutable hashes in the inventory', () => {
    const inventory = JSON.parse(readFileSync(resolve(root, 'docs/migration-inventory/ccst-cybersecurity.json'), 'utf8'));
    expect(inventory.source).toBe(originals[0].path);
    expect(inventory.sha256).toBe(originals[0].sha256);
    expect(inventory.markdownSource).toBe(originals[1].path);
    expect(inventory.markdownSha256).toBe(originals[1].sha256);
    expect(inventory.route).toBe('/docs/ccst-cybersecurity');
  });

  test('keeps all original fidelity comparisons bound to the archived HTML without root fallback', () => {
    for (const name of ['fidelity-helpers.ts']) {
      const implementation = readFileSync(resolve(import.meta.dir, name), 'utf8');
      expect(implementation).toContain('../../../../../archive/security-certifications/Ccst-cybersecurity-guide.html');
      expect(implementation).not.toContain("'../../../../../Ccst-cybersecurity-guide.html'");
    }
  });
});
