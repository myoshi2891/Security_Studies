import { expect, test } from 'bun:test';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';

const root = resolve(import.meta.dir, '../../../../..');

test('original HTML and Markdown leave the repository root after migration', () => {
  for (const ext of ['html', 'md']) {
    expect(existsSync(resolve(root, 'Sscp-guide.' + ext))).toBe(false);
  }
});

for (const [ext, digest] of Object.entries({
  html: 'f42abfb4a9f1940f9c4ac7b0cc0bc5712dc2862dc21d91c8fa749d1b1944a22a',
  md: '85beec6c452c961e10fd56441dc752e7dd66b787b3e2d7110352be1dc9271465',
})) {
  const original = resolve(root, 'Sscp-guide.' + ext);
  const archive = resolve(root, 'archive/security-certifications/Sscp-guide.' + ext);
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
  expect(helper).toContain('archive/security-certifications/Sscp-guide.html');
  expect(helper).not.toContain('rootSourcePath');
  expect(helper).not.toContain('../../../../../Sscp-guide.html');
  expect(helper).toContain('test.skipIf(!hasSource)');
  expect(helper.indexOf("readFileSync(sourcePath, 'utf8')")).toBeGreaterThan(helper.indexOf('function loadSource()'));
});
