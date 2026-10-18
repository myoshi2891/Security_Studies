import { existsSync } from "node:fs";
import path from "node:path";
import { test } from "bun:test";

export const SOURCE_PATH = path.join(process.cwd(), "..", "archive", "standards", "Iso-27001-2022-beginner-guide.md");
// 原本(archive/)は意図的に未追跡でCIには存在しない。原本の読み込みは各テスト本体で行う
export const hasSource = existsSync(SOURCE_PATH);

/** 原本に依存するテスト。原本がない環境（CI）ではスキップし、原本非依存のテストは常に実行する */
export function sourceTest(name: string, fn: () => void | Promise<unknown>, timeout?: number): void {
  test.skipIf(!hasSource)(name, fn, timeout);
}
