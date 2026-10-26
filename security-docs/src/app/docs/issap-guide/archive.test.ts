import { expect, test } from 'bun:test';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';

const root = resolve(import.meta.dir, '../../../../..');

test('original HTML and Markdown leave the repository root after migration', () => {
  for (const ext of ['html', 'md']) {
    expect(existsSync(resolve(root, 'Issap-guide.' + ext))).toBe(false);
  }
});

for (const [ext, digest] of Object.entries({
  html: 'ee67dc0a242136daf628fdcf433d2c20dd9ba326cb05dbbd10d865ac71914921',
  md: '2d9c45cf3705c5a67890814aa7902597d59785f9d6aa4474dbfe83f9a63d8578',
})) {
  const original = resolve(root, 'Issap-guide.' + ext);
  const archive = resolve(root, 'archive/security-certifications/Issap-guide.' + ext);
  test.skipIf(!existsSync(original) && !existsSync(archive))(
    'archive ' + ext + ' independently retains byte-exact SHA-256',
    () => {
      expect(existsSync(archive)).toBe(true);
      expect(createHash('sha256').update(readFileSync(archive)).digest('hex')).toBe(digest);
    },
  );
}

test('source comparison reads only the final archive lazily and skips only source-dependent tests', () => {
  const helper = readFileSync(new URL('./fidelity-helpers.ts', import.meta.url), 'utf8');
  expect(helper).toContain('archive/security-certifications/Issap-guide.html');
  expect(helper).not.toContain('rootSourcePath');
  expect(helper).not.toContain('../../../../../Issap-guide.html');
  expect(helper).toContain('test.skipIf(!hasSource)');
  expect(helper.indexOf("readFileSync(sourcePath, 'utf8')")).toBeGreaterThan(helper.indexOf('function loadSource()'));
});
