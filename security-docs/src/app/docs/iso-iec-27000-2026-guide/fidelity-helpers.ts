import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { test } from "bun:test";

// 起動ディレクトリに依存しないよう、本モジュールの位置からリポジトリ直下の archive/ を解決する
export const SOURCE_PATH = fileURLToPath(new URL("../../../../../archive/standards/Iso-iec-27000-2026-guide.md", import.meta.url));
// 原本(archive/)は意図的に未追跡でCIには存在しない。原本の読み込みは各テスト本体で行う
export const hasSource = existsSync(SOURCE_PATH);

/** 原本に依存するテスト。原本がない環境（CI）ではスキップし、原本非依存のテストは常に実行する */
export function sourceTest(name: string, fn: () => void | Promise<unknown>, timeout?: number): void {
  test.skipIf(!hasSource)(name, fn, timeout);
}
