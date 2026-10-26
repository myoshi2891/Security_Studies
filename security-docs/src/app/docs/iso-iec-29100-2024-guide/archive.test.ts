import { expect, test } from 'bun:test';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';

const root = resolve(import.meta.dir, '../../../../..');

test('original HTML and Markdown leave the repository root after migration', () => {
  for (const ext of ['html', 'md']) {
    expect(existsSync(resolve(root, 'Iso-iec-29100-2024-guide.' + ext))).toBe(false);
  }
});

for (const [ext, digest] of Object.entries({
  html: 'f6abf40ecddd9b0aa75641705ab943d544d1958f738db197101f9bf6a5007419',
  md: '159aec044626554dceda0164e87732a00961ccd30364af4afbe835666fd96bf6',
})) {
  const original = resolve(root, 'Iso-iec-29100-2024-guide.' + ext);
  const archive = resolve(root, 'archive/standards/Iso-iec-29100-2024-guide.' + ext);
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
  expect(helper).toContain('archive/standards/Iso-iec-29100-2024-guide.html');
  expect(helper).not.toContain('rootSourcePath');
  expect(helper).not.toContain('../../../../../Iso-iec-29100-2024-guide.html');
  expect(helper).toContain('test.skipIf(!hasSource)');
  expect(helper.indexOf("readFileSync(sourcePath, 'utf8')")).toBeGreaterThan(helper.indexOf('function loadSource()'));
});
