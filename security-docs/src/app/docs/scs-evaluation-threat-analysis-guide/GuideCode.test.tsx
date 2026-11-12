import { expect, test } from 'bun:test';
import { spawnSync } from 'node:child_process';

// Use a fresh process: prior imports can already have populated the shared registry.
test('loading SCS syntax highlighting leaves other guides shared language registry unchanged', () => {
  const probe = spawnSync(process.execPath, ['--eval', `
    const shared = (await import('highlight.js/lib/core')).default;
    const before = shared.listLanguages().sort();
    await import('./GuideCode.tsx');
    console.log(JSON.stringify({ before, after: shared.listLanguages().sort() }));
  `], { cwd: import.meta.dir, encoding: 'utf8', timeout: 10000 });
  expect(probe.error).toBeUndefined();
  expect(probe.status, probe.stderr).toBe(0);
  const { before, after } = JSON.parse(probe.stdout);
  expect(after).toEqual(before);
});
