import { afterEach, expect } from 'bun:test';
import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';

// @testing-library/jest-dom@6.10.0+ eagerly requires @testing-library/dom at
// import time, which computes its `screen` singleton from `document` on first
// load. A static import here would be hoisted ahead of GlobalRegistrator.register()
// below, so document wouldn't exist yet and `screen` would be poisoned for the
// whole test run. Dynamic imports are not hoisted, so this ordering is explicit.
const { GlobalRegistrator } = await import('@happy-dom/global-registrator');
GlobalRegistrator.register();

// 全テストファイルが同じ window を共有するため、画面幅の変更を後続テストへ漏らさない。
// 幅で分岐する目次（>1024px でデスクトップ動作）の検証が実行順依存にならないよう、
// 各テスト後に happy-dom の既定寸法へ戻す（preload の afterEach は全ファイルに適用される）。
// window.innerWidth = 1200 のような直接代入は happy-dom 内部の上書き値として残り、
// setWindowSize では戻らない。happy-dom は上書き値が null のときビューポート寸法を返すため、
// null を代入して上書きを解除してから既定寸法へ戻す。
type ViewportWindow = Record<'innerWidth' | 'innerHeight' | 'outerWidth' | 'outerHeight', number | null> & {
  happyDOM: { setWindowSize: (size: { width: number; height: number }) => void };
};
const viewportWindow = window as unknown as ViewportWindow;
const DEFAULT_VIEWPORT = { width: window.innerWidth, height: window.innerHeight };
afterEach(() => {
  viewportWindow.innerWidth = null;
  viewportWindow.innerHeight = null;
  viewportWindow.outerWidth = null;
  viewportWindow.outerHeight = null;
  if (window.innerWidth === DEFAULT_VIEWPORT.width && window.innerHeight === DEFAULT_VIEWPORT.height) return;
  viewportWindow.happyDOM.setWindowSize(DEFAULT_VIEWPORT);
});

const matchers: typeof import('@testing-library/jest-dom/matchers') = await import(
  '@testing-library/jest-dom/matchers'
);
expect.extend(matchers);

declare module "bun:test" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface Matchers<T = unknown>
    extends TestingLibraryMatchers<typeof expect.stringContaining, T> {}
}
