import { describe, expect, test } from 'bun:test';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dir, '../../../../..');
const originals = [
  { path: 'archive/security-guides/Web-application-hackers-handbook-guide.html', sha256: '7dae405ae0f8c7dee69bed94938246d549164fa250fd03665255360321992c16' },
  { path: 'archive/security-guides/Web-application-hackers-handbook-guide.md', sha256: '9db5c33ec671c2f04fc12d070a3d7751902d53ccabe44ac4fa848e3462e459f6' },
];

describe('WAHH immutable source archive', () => {
  for (const original of originals) {
    // 原本ごとの存在で判定する（HTML だけある環境で MD 側が失敗しないように）
    const path = resolve(root, original.path);
    test.skipIf(!existsSync(path))(`preserves every source byte in ${original.path}`, () => {
      expect(existsSync(path)).toBe(true);
      expect(createHash('sha256').update(readFileSync(path)).digest('hex')).toBe(original.sha256);
    });
  }

  test('removes both legacy root paths after archival', () => {
    expect(existsSync(resolve(root, 'Web-application-hackers-handbook-guide.html'))).toBe(false);
    expect(existsSync(resolve(root, 'Web-application-hackers-handbook-guide.md'))).toBe(false);
  });

  test('records both archived originals and their immutable hashes in the inventory', () => {
    const inventory = JSON.parse(readFileSync(resolve(root, 'docs/migration-inventory/web-application-hackers-handbook.json'), 'utf8'));
    expect(inventory.source).toBe(originals[0].path);
    expect(inventory.sha256).toBe(originals[0].sha256);
    expect(inventory.markdownSource).toBe(originals[1].path);
    expect(inventory.markdownSha256).toBe(originals[1].sha256);
    expect(inventory.route).toBe('/docs/web-application-hackers-handbook');
  });

  test('keeps all original fidelity comparisons bound to the archived HTML without root fallback', () => {
    for (const [name, original, archived] of [
      ['fidelity-helpers.ts', '../../../../../Web-application-hackers-handbook-guide.html', '../../../../../archive/security-guides/Web-application-hackers-handbook-guide.html'],
      ['integration.test.tsx', '../../../../../Web-application-hackers-handbook-guide.md', '../../../../../archive/security-guides/Web-application-hackers-handbook-guide.md'],
    ]) {
      const implementation = readFileSync(resolve(import.meta.dir, name), 'utf8');
      expect(implementation).toContain(archived);
      expect(implementation).not.toContain(original);
    }
  });
});
