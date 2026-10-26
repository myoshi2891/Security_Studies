import { expect, test } from 'bun:test';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';

const root = resolve(import.meta.dir, '../../../../..');

test('original HTML and Markdown leave the repository root after migration', () => {
  for (const ext of ['html', 'md']) {
    expect(existsSync(resolve(root, 'Cgrc-guide.' + ext))).toBe(false);
  }
});

for (const [ext, digest] of Object.entries({
  html: '2af45734a7b13f21ac9bc2b8f987ae7151ade73d22a641014fa9a064136f8cfd',
  md: 'b659ad8f3f0647c4a1241c6408f765a1719a555591a678e737483e0728652e12',
})) {
  const original = resolve(root, 'Cgrc-guide.' + ext);
  const archive = resolve(root, 'archive/security-certifications/Cgrc-guide.' + ext);
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
  expect(helper).toContain('archive/security-certifications/Cgrc-guide.html');
  expect(helper).not.toContain('rootSourcePath');
  expect(helper).not.toContain('../../../../../Cgrc-guide.html');
  expect(helper).toContain('test.skipIf(!hasSource)');
  expect(helper.indexOf("readFileSync(sourcePath, 'utf8')")).toBeGreaterThan(helper.indexOf('function loadSource()'));
});
