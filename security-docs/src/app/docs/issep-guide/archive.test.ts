import { expect, test } from 'bun:test';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { createHash } from 'node:crypto';
import inventory from '../../../../../docs/migration-inventory/issep-guide.json';

const root = resolve(import.meta.dir, '../../../../..');
const basename = 'Issep-guide';

test('completed migration leaves neither original in the repository root', () => {
  for (const ext of ['html', 'md']) expect(existsSync(resolve(root, basename + '.' + ext))).toBe(false);
});

for (const [ext, digest] of Object.entries({ html: inventory.htmlSha256, md: inventory.markdownSha256 })) {
  const archived = resolve(root, 'archive/security-certifications', basename + '.' + ext);
  test.skipIf(!existsSync(archived))(
    `archived ${ext} independently preserves the original SHA-256`, () => {
      expect(existsSync(archived)).toBe(true);
      expect(createHash('sha256').update(readFileSync(archived)).digest('hex')).toBe(digest);
    },
  );
}

test.each([true, false])('sourceTest loads lazily and keeps source-free contracts active (archive present: %s)', async present => {
  // Isolate module state and filesystem spies from other fidelity suites without moving the real archive.
  const directory = mkdtempSync(resolve(tmpdir(), 'issep-archive-'));
  const fixture = resolve(directory, 'loading.test.ts');
  writeFileSync(fixture, `
    import { afterAll, expect, mock, test } from 'bun:test';
    import fs from 'node:fs';
    const archived = ${JSON.stringify(resolve(root, 'archive/security-certifications', basename + '.html'))};
    const exists = fs.existsSync, read = fs.readFileSync;
    let executing = false, reads = 0, callbacks = 0;
    mock.module('node:fs', () => ({ ...fs,
      existsSync: path => String(path) === archived ? ${present} : exists(path),
      readFileSync: (path, ...options) => {
      if (String(path) === archived) {
        expect(executing).toBe(true);
        expect(${present}).toBe(true);
        reads++;
        return '<style>.archive { color: red; }</style><p>archive fixture</p>';
      }
      if (String(path).endsWith('/${basename}.html')) throw new Error('Unexpected source path: ' + path);
      return read(path, ...options);
      },
    }));
    const helper = await import(${JSON.stringify(resolve(import.meta.dir, 'fidelity-helpers.ts'))});
    expect(helper.sourcePath).toBe(archived);
    expect(reads).toBe(0);
    helper.sourceTest('archive comparison runs only when the archive exists', () => {
      callbacks++;
      expect(helper.sourceDocument.querySelector('p')?.textContent).toBe('archive fixture');
      expect(helper.sourceCss.first.selector).toBe('.archive');
    });
    expect(reads).toBe(0);
    executing = true;
    test('source-free structure contract still executes', async () => {
      const [selector, digest] = Object.entries(helper.inventory.structures).find(([key]) => key.startsWith('#') && key !== '#top');
      expect(helper.structure((await helper.renderedPage()).getElementById(selector.slice(1)))).toBe(digest);
    });
    afterAll(() => {
      expect(reads).toBe(${present ? 1 : 0});
      expect(callbacks).toBe(${present ? 1 : 0});
    });
  `);
  try {
    const child = Bun.spawn([process.execPath, 'test', '--preload', resolve(root, 'security-docs/test-setup.ts'), fixture], {
      cwd: resolve(root, 'security-docs'), stdout: 'pipe', stderr: 'pipe',
    });
    const [status, stdout, stderr] = await Promise.all([child.exited, new Response(child.stdout).text(), new Response(child.stderr).text()]);
    expect(status, stdout + stderr).toBe(0);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}, 15000);
