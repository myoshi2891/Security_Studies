import { expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { Window } from 'happy-dom';
import { renderedPage, sourceTest, sourceHtml, sourceDocument } from './fidelity-helpers';

const sharedCss = () =>
  ['../../globals.css', '../docs-layout.css']
    .map(f => readFileSync(new URL(f, import.meta.url), 'utf8'))
    .join('\n')
    .replace(/@import[^;]+;/g, '');

for (const width of [375, 1440]) {
  for (const theme of ['light', 'dark']) {
    test(
      `all 944 cells and inline code retain source dark surfaces and hover color (#0b1a2e) at ${width}px in ${theme}`,
      async () => {
        const w = new Window({ width, height: 1000, settings: { device: { prefersColorScheme: theme } } });
        try {
          const css = (
            sharedCss() +
            '\n' +
            readFileSync(new URL('./threat-modeling-shostack-guide.css', import.meta.url), 'utf8')
          ).replaceAll(':hover', '.fidelity-hover');
          w.document.head.innerHTML = '<style>' + css + '</style>';
          w.document.body.innerHTML = '<article class="prose">' + (await renderedPage()).body.innerHTML + '</article>';
          expect(w.document.querySelectorAll('.shostack-threat-guide table')).toHaveLength(52);
          const ths = [...w.document.querySelectorAll('.shostack-threat-guide th')];
          const tds = [...w.document.querySelectorAll('.shostack-threat-guide td')];
          expect(ths).toHaveLength(152);
          expect(tds).toHaveLength(792);

          for (const th of ths) {
            const s = w.getComputedStyle(th);
            expect(s.backgroundColor).toBe('#10233c');
            expect(s.color).toBe('#f3f5fa');
          }
          for (const td of tds) {
            const s = w.getComputedStyle(td);
            expect(s.backgroundColor || 'transparent').toBe('transparent');
            expect(s.color).toBe('#c6d0e3');
          }

          for (const row of w.document.querySelectorAll('tr')) row.classList.add('fidelity-hover');

          for (const th of ths) {
            const s = w.getComputedStyle(th);
            expect(s.backgroundColor).toBe('#10233c');
            expect(s.color).toBe('#f3f5fa');
          }
          for (const td of tds) {
            const s = w.getComputedStyle(td);
            expect(s.backgroundColor).toBe('#0b1a2e');
            expect(s.color).toBe('#c6d0e3');
          }

          for (const code of w.document.querySelectorAll('.shostack-threat-guide :not(pre) > code')) {
            const s = w.getComputedStyle(code);
            expect(s.color).toBe('#a9c1ff');
            expect(s.backgroundColor).toBe('#10233c');
          }
        } finally {
          await w.happyDOM.close();
        }
      },
      30000,
    );
  }
}

test('the test harness loads the common hover palette in both OS themes', async () => {
  for (const theme of ['light', 'dark']) {
    const w = new Window({ settings: { device: { prefersColorScheme: theme } } });
    try {
      w.document.head.innerHTML = '<style>' + sharedCss().replaceAll(':hover', '.fidelity-hover') + '</style>';
      w.document.body.innerHTML =
        '<article class="prose"><table><tbody><tr class="fidelity-hover"><td>probe</td></tr></tbody></table></article>';
      expect(w.matchMedia('(prefers-color-scheme:dark)').matches).toBe(theme === 'dark');
      expect(w.getComputedStyle(w.document.querySelector('td')!).backgroundColor).toBe(
        theme === 'dark' ? '#18181b' : '#fafafa',
      );
    } finally {
      await w.happyDOM.close();
    }
  }
});

sourceTest('Mermaid settings retain the original dark theme and layout', async () => {
  const { diagramConfig } = await import(new URL('./MermaidFigure.tsx', import.meta.url).href);
  const engine = {
    config: {} as Record<string, unknown>,
    initialize(c: Record<string, unknown>) {
      this.config = c;
    },
  };
  const call = sourceHtml.match(/window\.mermaid\.initialize\([\s\S]*?\);/)![0];
  Function('window', call)({ mermaid: engine });
  delete engine.config.startOnLoad;
  delete engine.config.securityLevel;
  expect(diagramConfig).toEqual(engine.config);
});

sourceTest('all 9 source diagram containers and local icons are retained', async () => {
  const page = await renderedPage();
  expect([...page.querySelectorAll('.mermaid-target[data-diagram]')].map(e => e.getAttribute('data-diagram'))).toEqual(
    [...sourceDocument.querySelectorAll('.mermaid-target[data-diagram]')].map(e => e.getAttribute('data-diagram')),
  );
  for (const icon of page.querySelectorAll('i.ti')) {
    expect(icon.querySelector('svg'), icon.className).not.toBeNull();
  }
});
