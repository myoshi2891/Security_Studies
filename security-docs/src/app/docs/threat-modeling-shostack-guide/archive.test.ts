import { expect, test } from 'bun:test';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';

const root = resolve(import.meta.dir, '../../../../..');

test('original HTML and Markdown leave the repository root after migration', () => {
  for (const ext of ['html', 'md']) {
    expect(existsSync(resolve(root, 'Threat-modeling-shostack-guide.' + ext))).toBe(false);
  }
});

for (const [ext, digest] of Object.entries({
  html: '4691e6eaab79de3ded984591781fc0e9e9f09a07746231369d248e3ca3ba2d3d',
  md: '9835d54d3ca3f6ab88c6f6693dd3b9198d0d0424eb664bbf2511435acbb26521',
})) {
  const original = resolve(root, 'Threat-modeling-shostack-guide.' + ext);
  const archive = resolve(root, 'archive/security-guides/Threat-modeling-shostack-guide.' + ext);
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
  expect(helper).toContain('archive/security-guides/Threat-modeling-shostack-guide.html');
  expect(helper).not.toContain('rootSourcePath');
  expect(helper).not.toContain('../../../../../Threat-modeling-shostack-guide.html');
  expect(helper).toContain('test.skipIf(!hasSource)');
  expect(helper.indexOf("readFileSync(sourcePath, 'utf8')")).toBeGreaterThan(helper.indexOf('function loadSource()'));
});
