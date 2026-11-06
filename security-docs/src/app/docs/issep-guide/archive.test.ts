import { expect, test } from 'bun:test';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import inventory from '../../../../../docs/migration-inventory/issep-guide.json';

const root = resolve(import.meta.dir, '../../../../..');
const basename = 'Issep-guide';

test('completed migration leaves neither original in the repository root', () => {
  for (const ext of ['html', 'md']) expect(existsSync(resolve(root, basename + '.' + ext))).toBe(false);
});

for (const [ext, digest] of Object.entries({ html: inventory.htmlSha256, md: inventory.markdownSha256 })) {
  const original = resolve(root, basename + '.' + ext);
  const archived = resolve(root, 'archive/security-certifications', basename + '.' + ext);
  test.skipIf(!existsSync(original) && !existsSync(archived))(
    `archived ${ext} independently preserves the original SHA-256`, () => {
      expect(existsSync(archived)).toBe(true);
      expect(createHash('sha256').update(readFileSync(archived)).digest('hex')).toBe(digest);
    },
  );
}

test('source comparisons load only the certification archive lazily and keep source-free contracts active', () => {
  const helper = readFileSync(new URL('./fidelity-helpers.ts', import.meta.url), 'utf8');
  expect(helper).toContain('archive/security-certifications/Issep-guide.html');
  expect(helper).not.toContain('../../../../../Issep-guide.html');
  expect(helper).toContain('test.skipIf(!existsSync(sourcePath))');
  expect(helper.indexOf("readFileSync(sourcePath, 'utf8')")).toBeGreaterThan(helper.indexOf('export function sourceTest('));
});
