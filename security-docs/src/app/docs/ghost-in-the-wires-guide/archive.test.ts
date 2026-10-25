import { expect, test } from 'bun:test';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';

const root = resolve(import.meta.dir, '../../../../..');

test('original HTML and Markdown leave the repository root after migration', () => {
  for (const ext of ['html', 'md']) {
    expect(existsSync(resolve(root, 'Ghost-in-the-wires-guide.' + ext))).toBe(false);
  }
});

for (const [ext, digest] of Object.entries({
  html: '01ce63567c3b5c5f370fde8a759afc673ba3b042c201d33c875abf60cb0873ce',
  md: '4c28f69e3ed519a409a5b3f95f3cef15e3e2f4fdd8f1c0865cd791f81320d408',
})) {
  const original = resolve(root, 'Ghost-in-the-wires-guide.' + ext);
  const archive = resolve(root, 'archive/security-guides/Ghost-in-the-wires-guide.' + ext);
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
  expect(helper).toContain('archive/security-guides/Ghost-in-the-wires-guide.html');
  expect(helper).not.toContain('rootSourcePath');
  expect(helper).not.toContain('../../../../../Ghost-in-the-wires-guide.html');
  expect(helper).toContain('test.skipIf(!hasSource)');
  expect(helper.indexOf("readFileSync(sourcePath, 'utf8')")).toBeGreaterThan(helper.indexOf('function loadSource()'));
});
