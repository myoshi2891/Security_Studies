import { expect, test } from 'bun:test';
import { spawnSync } from 'node:child_process';

// Use a fresh process: prior imports can already have populated the shared registry.
test('loading SCS syntax highlighting leaves other guides shared language registry unchanged', () => {
  const probe = spawnSync(process.execPath, ['--eval', `
    const shared = (await import('highlight.js/lib/core')).default;
    const before = shared.listLanguages().sort();
    const {GuideCode}=await import('./GuideCode.tsx');
    const {createElement}=await import('react');
    const {renderToStaticMarkup}=await import('react-dom/server');
    const markup=renderToStaticMarkup(createElement(GuideCode,{source:'if true; then echo \"ok\"; fi',className:'language-bash'}));
    console.log(JSON.stringify({ before, after: shared.listLanguages().sort(), markup }));
  `], { cwd: import.meta.dir, encoding: 'utf8', timeout: 10000 });
  expect(probe.error).toBeUndefined();
  expect(probe.status, probe.stderr).toBe(0);
  const { before, after, markup } = JSON.parse(probe.stdout);
  expect(after).toEqual(before);
  const code=new DOMParser().parseFromString(markup,'text/html').querySelector('code')!;
  expect(code.classList.contains('language-bash')).toBe(true);
  expect(code.textContent).toBe('if true; then echo "ok"; fi');
  expect(code.querySelector('span.hljs-keyword')).not.toBeNull();
});
