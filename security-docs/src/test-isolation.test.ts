import { expect, test } from 'bun:test';

/** happy-dom のウィンドウ寸法 API（global-registrator が公開する happyDOM を型付けする） */
type HappyWindow = Window & { happyDOM: { setWindowSize: (size: { width: number; height: number }) => void } };

// bun test は全ファイルで同じグローバル window を共有する。あるテストが変更した画面幅が
// 後続ファイルへ漏れると、画面幅で分岐する目次（>1024px でデスクトップ動作）の検証が
// 実行順依存で失敗し、巨大DOMの差分整形でCIランナーがメモリ枯渇した（ISSMP sidebar）。
test('a test may change the happy-dom viewport', () => {
  (window as unknown as HappyWindow).happyDOM.setWindowSize({ width: 1440, height: 900 });
  expect(window.innerWidth).toBe(1440);
});

test('the next test starts from the happy-dom default viewport again', () => {
  expect(window.innerWidth).toBe(1024);
  expect(window.innerHeight).toBe(768);
});
