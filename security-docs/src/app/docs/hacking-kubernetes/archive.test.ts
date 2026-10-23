import { describe, expect, test } from 'bun:test';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dir, '../../../../..');
const originals = [
  { path: 'archive/security-guides/Hacking-kubernetes-guide.html', sha256: '29d514f6228d43b9cde506f066c8109a9e1fc004efce7dbc5dfc0bc9410a8e6c' },
  { path: 'archive/security-guides/Hacking-kubernetes-guide.md', sha256: '25c0808439fb346fdf3d08d594df1c93e2881e98998ee8aaa72cd7efe9f4284f' },
];

describe('Hacking Kubernetes immutable source archive', () => {
  for (const original of originals) {
    // 原本ごとの存在で判定する（HTML だけある環境で MD 側が失敗しないように）
    const path = resolve(root, original.path);
    test.skipIf(!existsSync(path))(`preserves every source byte in ${original.path}`, () => {
      expect(existsSync(path)).toBe(true);
      expect(createHash('sha256').update(readFileSync(path)).digest('hex')).toBe(original.sha256);
    });
  }

  test('removes both legacy root paths after archival', () => {
    expect(existsSync(resolve(root, 'Hacking-kubernetes-guide.html'))).toBe(false);
    expect(existsSync(resolve(root, 'Hacking-kubernetes-guide.md'))).toBe(false);
  });

  test('records both archived originals and their immutable hashes in the inventory', () => {
    const inventory = JSON.parse(readFileSync(resolve(root, 'docs/migration-inventory/hacking-kubernetes.json'), 'utf8'));
    expect(inventory.source).toBe(originals[0].path);
    expect(inventory.sha256).toBe(originals[0].sha256);
    expect(inventory.markdownSource).toBe(originals[1].path);
    expect(inventory.markdownSha256).toBe(originals[1].sha256);
    expect(inventory.route).toBe('/docs/hacking-kubernetes');
  });

  test('keeps all original fidelity comparisons bound to the archived HTML without root fallback', () => {
    for (const [name, original, archived] of [
      ['fidelity-helpers.ts', '../../../../../Hacking-kubernetes-guide.html', '../../../../../archive/security-guides/Hacking-kubernetes-guide.html'],
      ['integration.test.tsx', '../../../../../Hacking-kubernetes-guide.md', '../../../../../archive/security-guides/Hacking-kubernetes-guide.md'],
    ]) {
      const implementation = readFileSync(resolve(import.meta.dir, name), 'utf8');
      expect(implementation).toContain(archived);
      expect(implementation).not.toContain(original);
    }
  });
});
