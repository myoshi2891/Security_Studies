# Plan 002: サイドバー情報アーキテクチャを 7 セクション構成に再編する

> **Executor instructions**: 本プランをステップ順に実行し、各検証コマンドの期待結果を
> 確認してから次へ進むこと。「STOP conditions」に該当したら中断して報告する。
> 完了時に `plans/README.md` の本プランのステータス行を更新すること。
>
> **Drift check (run first)**: `git diff --stat 8892abf..HEAD -- security-docs/src/config/docs.ts security-docs/src/app/docs/layout.test.tsx`
> 対象ファイルに差分がある場合、「Current state」の抜粋と実コードを比較し、
> 不一致なら STOP condition として扱う。

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: plans/001-platform-direction-and-gap-analysis.md
- **Category**: direction
- **Planned at**: commit `8892abf`, 2026-07-07

## Why this matters

Plan 001 で確定したカテゴリ体系 (Certifications & Exam Prep 拡張、Cloud Security /
Governance & Architecture 新設) の受け皿をサイドバーに先行して用意する。
これにより後続の資格ページ追加 (Plan 003〜005) は「MDX ページ作成 + 1 行追記」で完結し、
プラン間の構造変更コンフリクトを避けられる。

## Current state

- `security-docs/src/config/docs.ts` — サイドバー定義の唯一のソース。現在 5 セクション:

```ts
// security-docs/src/config/docs.ts (全体は 43 行)
export const docsConfig = {
  sidebarNav: [
    { title: "Getting Started", items: [ /* approach, architecture */ ] },
    { title: "Security Guides", items: [ /* ai-coding-safety, llm-ai-security, secdev-guide */ ] },
    { title: "Advanced Topics", items: [ /* supply-chain, pqc, owasp, threat-landscape */ ] },
    {
      title: "Resources",
      items: [
        { title: "AppSec Certifications", href: "/docs/certifications" },
      ],
    },
    { title: "Archive", items: [ /* archive/approach */ ] },
  ],
};
```

- `security-docs/src/app/docs/layout.test.tsx` — サイドバー描画テスト。
  **件数をハードコードでアサートしている** (追従漏れ検知が目的):
  - 15行目: `import { docsConfig } from '@/config/docs';`
  - 48行目: `test('sidebarNav に定義された全エントリ (11 件) がリンクとして描画される', ...)`
  - 61〜68行目: `test('セクション見出し (5 件) が描画される', ...)` 内で
    `expect(docsConfig.sidebarNav.length).toBe(5);`
- `security-docs/src/components/docs/DocsSidebar.tsx` — `docsConfig` を map して描画。変更不要。
- `security-docs/src/app/page.tsx` (50行目) — トップページも `docsConfig.sidebarNav` を map。変更不要
  (データ駆動のため自動追従する)。

リポジトリ規約 (必ず従う):

- TDD 必須 (`.claude/rules/tdd-mandatory-cycle.md`): 失敗するテスト更新を先にコミット
  (`test(<scope>): ...`) → 実装 (`feat(<scope>): ...`) の順
- コミット形式: `<type>(<scope>): <subject>`

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Install | `cd security-docs && bun install` | exit 0 |
| Tests | `cd security-docs && bun test` | all pass |
| Single test | `cd security-docs && bun test src/app/docs/layout.test.tsx` | all pass |
| Lint | `cd security-docs && bun run lint` | exit 0 |
| Typecheck | `cd security-docs && bun run types:check` | exit 0 |

## Scope

**In scope** (変更してよいファイルはこれだけ):

- `security-docs/src/config/docs.ts`
- `security-docs/src/app/docs/layout.test.tsx`

**Out of scope** (関連して見えても触らない):

- `security-docs/src/components/docs/DocsSidebar.tsx` — データ駆動のため変更不要
- `security-docs/src/app/page.tsx` — 同上
- `security-docs/src/app/docs/` 配下の MDX ページ新規作成 — Plan 003〜005 の担当。
  本プランでは**既存ページの href のみ**を再配置し、存在しないページへのリンクは追加しない

## Git workflow

- ブランチ: `dev` から `feat/sidebar-ia-restructure` を切る (リポジトリは dev → main の PR 運用)
- push / PR 作成は運用者の指示があるまで行わない

## Steps

### Step 1 (Red): layout.test.tsx にセクション名変更の失敗テストを追加する

本プラン単体ではセクション数は 5 のまま (Resources → Certifications & Exam Prep への
リネームと既存項目の移設のみ。空セクションは作らないため。詳細は Step 2 の注記参照)。

`security-docs/src/app/docs/layout.test.tsx` を以下のとおり更新する:

- 件数アサーションは**変更しない** (セクション `toBe(5)` / エントリ 11 件のまま)
- `describe('sidebar rendering')` 内に新テストを 2 件追加する:
  - セクション見出しに `Certifications & Exam Prep` が描画される
  - セクション見出しに `Resources` が描画されない
- 既存テストの構造 (65 行目付近の `for (const section of docsConfig.sidebarNav)` パターン) に従う

**Verify**: `cd security-docs && bun test src/app/docs/layout.test.tsx` → 追加した 2 件が
**失敗する** こと (既存テストはパスのまま)

コミット: `test(docs): add failing spec for sidebar section rename`

### Step 2 (Green): docs.ts を 7 セクション構成に再編する

`security-docs/src/config/docs.ts` の `sidebarNav` を以下の構成に変更する
(既存の `{ title, href }` オブジェクトは文言を変えず移動のみ):

1. `Getting Started` — approach, architecture (現状維持)
2. `Security Guides` — ai-coding-safety, llm-ai-security, secdev-guide (現状維持)
3. `Advanced Topics` — supply-chain, pqc, owasp, threat-landscape (現状維持)
4. `Certifications & Exam Prep` — `{ title: "AppSec Certifications", href: "/docs/certifications" }`
   (Resources から移設。Plan 003〜005 のページはここに追加される)
5. `Cloud Security` — `items: []` は不可 (空セクションを描画しない保証がないため)。
   **このセクションは Plan 004 で最初のページと同時に追加する**。本プランでは追加しない
6. `Governance & Architecture` — 同上、**Plan 003 で最初のページと同時に追加する**。本プランでは追加しない
7. `Resources` — AppSec Certifications 移設後、Resources セクション自体は削除せず残したいが
   items が空になる。→ **Resources セクションは削除する** (再掲: 空セクションは作らない)
8. `Archive` — archive/approach (現状維持)

つまり本プラン完了時点のセクションは:
Getting Started / Security Guides / Advanced Topics / **Certifications & Exam Prep** /
Archive の **5 セクション**のまま名称変更・移設のみとなる。

> **注意**: 空セクションを作らない方針のため、本プラン単体ではセクション数は 5 のまま。
> 「7 セクション」(タイトルの最終形) は Plan 003 が Governance & Architecture を、
> Plan 004 が Cloud Security を、それぞれ最初のページと同時に追加した時点で到達する。

**Verify**: `cd security-docs && bun test` → all pass

コミット: `feat(docs): restructure sidebar — rename Resources to Certifications & Exam Prep`

### Step 3 (Refactor): lint / typecheck

**Verify**: `cd security-docs && bun run lint && bun run types:check` → ともに exit 0

修正が発生した場合のみコミット: `refactor(docs): lint fixes for sidebar config`

## Test plan

- 更新するテスト: `security-docs/src/app/docs/layout.test.tsx`
  - セクション見出しに `Certifications & Exam Prep` が含まれる
  - セクション見出しに `Resources` が含まれない
  - 全 11 エントリのリンク描画 (既存アサーションを維持)
- 構造パターンは同ファイルの既存 `describe('sidebar rendering')` に従う
- **Verify**: `cd security-docs && bun test` → all pass

## Done criteria

- [ ] `cd security-docs && bun test` exit 0
- [ ] `cd security-docs && bun run lint && bun run types:check` exit 0
- [ ] `grep -n "Certifications & Exam Prep" security-docs/src/config/docs.ts` が 1 件ヒット
- [ ] `grep -n '"Resources"' security-docs/src/config/docs.ts` が 0 件
- [ ] In scope 外のファイルに変更がない (`git status`)
- [ ] `plans/README.md` のステータス行を更新済み

## STOP conditions

以下の場合は中断して報告する (改変で乗り切らない):

- `docs.ts` の現状が「Current state」の抜粋と一致しない (先行変更が入っている)
- `layout.test.tsx` の件数アサーション行 (48 / 61〜68 行付近) が見つからない
- `DocsSidebar.tsx` が空 items のセクションで描画エラーを起こすなど、
  スコープ外ファイルの変更が必要になった
- Step 2 の後にテストが 2 回連続で失敗し、原因がサイドバー構成以外にある

## Maintenance notes

- Plan 003 実行時: `Governance & Architecture` セクションを新設し ISSAP/SABSA ページを追加、
  `layout.test.tsx` のセクション数・エントリ数アサーションを +1 ずつ更新する
- Plan 004 実行時: `Cloud Security` セクション新設 (共通基盤ページを置く場合) と
  `Certifications & Exam Prep` へのクラウド資格ページ追加。同様にテスト件数を更新する
- レビュー観点: サイドバーの並び順はユーザーの学習動線 (入門 → ガイド → 発展 → 試験対策) を
  意図している。アルファベット順等への並べ替えはしない
