# Plan 005: CSSLP 試験対策を独立ページとして深掘り拡張する

> **Executor instructions**: 本プランをステップ順に実行し、各検証コマンドの期待結果を
> 確認してから次へ進むこと。「STOP conditions」に該当したら中断して報告する。
> 完了時に `plans/README.md` の本プランのステータス行を更新すること。
>
> **Drift check (run first)**: `git diff --stat 8892abf..HEAD -- security-docs/src/app/docs/certifications/ security-docs/src/config/docs.ts security-docs/src/app/docs/layout.test.tsx`
> `certifications/page.mdx` 本体に想定外の差分がある場合は「Current state」の抜粋と
> 比較し、不一致なら STOP condition として扱う。

## Status

- **Priority**: P3
- **Effort**: M
- **Risk**: LOW
- **Depends on**: plans/002-sidebar-ia-restructure.md
- **Category**: direction
- **Planned at**: commit `8892abf`, 2026-07-07

## Why this matters

CSSLP は対象 5 資格のうち唯一すでにページが存在する資格だが、現状の
`certifications/page.mdx` は 8 ドメインの**名称一覧にとどまり** (Plan 001 のギャップ G6)、
「各ドメインで何を問われ、何をどの順で学ぶか」という試験対策の中身がない。
既存ページは CSSLP / CASE / GWEB の比較ガイドとして価値があるため**改稿せず**、
ドメイン別対策に特化した独立ページ `/docs/csslp-prep` を追加してリンクで接続する。

## Current state

- `security-docs/src/app/docs/certifications/page.mdx` (111 行) — 既存の AppSec 資格比較
  ページ。CSSLP セクションの現状 (抜粋):

```mdx
<SectionCard id="csslp" eyebrow="// Certification 01" title={...}>
  <Callout type="info" title="CSSLP の核心">...</Callout>
  <DocsSubheading>8つのドメイン (CBK)</DocsSubheading>
  <StepTimeline
    steps={[
      { title: "Domain 1: Secure Software Concepts", content: "セキュリティの基本原則..." },
      /* ... Domain 8 まで名称 + 1 行説明のみ */
    ]}
  />
</SectionCard>
```

- 本プラットフォームには CSSLP ドメインに対応する既存コンテンツが点在する。
  新ページから内部リンクで再利用する (重複執筆しない):
  - `/docs/secdev-guide` — Domain 1〜7 の実務基礎
  - `/docs/supply-chain` — Domain 8 (Supply Chain)
  - `/docs/owasp` — Domain 4〜5 (Implementation / Testing)
- MDX コンポーネントはグローバル登録済み (import 不要)。エクセンプラは
  `certifications/page.mdx` を直接読むこと
- `security-docs/src/config/docs.ts` — Plan 002 適用後、`Certifications & Exam Prep` あり
- `security-docs/src/app/docs/layout.test.tsx` — 件数アサーションあり。更新必須

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Install | `cd security-docs && bun install` | exit 0 |
| Tests | `cd security-docs && bun test` | all pass |
| Lint | `cd security-docs && bun run lint` | exit 0 |
| Typecheck | `cd security-docs && bun run types:check` | exit 0 |
| Dev server | `cd security-docs && bun run dev` | http://localhost:3000 |

## Suggested executor toolkit

- リポジトリに `mdx-page-adder` スキルがある場合はそれを使う
- 執筆前に ISC2 公式の CSSLP Exam Outline 最新版でドメイン名・出題比率を確認する

## Scope

**In scope**:

- `security-docs/src/app/docs/csslp-prep/page.mdx` (新規作成)
- `security-docs/src/config/docs.ts` (エントリ追加)
- `security-docs/src/app/docs/layout.test.tsx` (件数アサーション更新)
- `docs/progress.md` (進捗追記)

**Out of scope**:

- `certifications/page.mdx` の改稿 — 比較ガイドとして現状維持。
  唯一の例外: CSSLP セクション末尾に新ページへのリンク 1 行を追加してもよいが、
  それ以外の行は変更しない
- CASE / GWEB の対策ページ — 対象 5 資格に含まれないため作らない

## Git workflow

- ブランチ: `dev` から `feat/csslp-prep-page` を切る
- TDD 必須 (`.claude/rules/tdd-mandatory-cycle.md`): test → feat → (refactor) → docs の順にコミット
- push / PR 作成は運用者の指示があるまで行わない

## Steps

### Step 1 (Red): layout.test.tsx の件数アサーションを更新し失敗を確認する

- エントリ数アサーション: 現在値 +1 (csslp-prep 追加分)。セクション数は変わらない

**Verify**: `cd security-docs && bun test src/app/docs/layout.test.tsx` → 更新分が失敗する

コミット: `test(docs): add failing spec for csslp-prep page registration`

### Step 2 (Green): page.mdx を作成し docs.ts に登録する

`security-docs/src/app/docs/csslp-prep/page.mdx` を新規作成する。構成:

1. frontmatter: `title: "CSSLP ドメイン別試験対策ガイド"` + `description`
2. `<HeroSection section="CSSLP" ...>` — chips: `ISC2 · CSSLP` / `8 Domains` / 作成日
3. `<SectionCard>` × 以下:
   - 試験概要: 受験要件 (4 年の実務経験等)・試験形式・出題比率を `DataTable` で
     (比率は ISC2 公式 Exam Outline 確認のうえ記載)
   - Domain 1〜8: **各ドメインを個別の `SectionCard`** とし、それぞれに
     「問われること (`HighlightBox`)」「重点学習項目 (`Checklist`)」
     「本サイト内の関連ページへのリンク (secdev-guide / supply-chain / owasp)」を持たせる
   - 学習ロードマップ: 推奨学習順序を `StepTimeline` で
4. `<SourceReferences>` — ISC2 公式 CSSLP ページ / Exam Outline のみを出典とする

`security-docs/src/config/docs.ts`:

- `Certifications & Exam Prep` の items に
  `{ title: "CSSLP Exam Prep", href: "/docs/csslp-prep" }` を
  `AppSec Certifications` の直後に追加

**Verify**: `cd security-docs && bun test` → all pass

コミット: `feat(docs): add CSSLP domain-by-domain exam prep page`

### Step 3 (Refactor): lint / typecheck / 表示確認

**Verify**:

- `cd security-docs && bun run lint && bun run types:check` → exit 0
- `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/docs/csslp-prep` → `200`

修正が発生した場合のみコミット: `refactor(docs): clean up csslp-prep page`

### Step 4 (Docs Sync): docs/progress.md を更新する

コミット: `chore(docs): update docs/progress.md — csslp-prep page`

## Test plan

- 更新: `security-docs/src/app/docs/layout.test.tsx` (エントリ数 +1)
- 構造パターン: 同ファイルの既存 `describe('sidebar rendering')` に従う
- **Verify**: `cd security-docs && bun test` → all pass

## Done criteria

- [ ] `cd security-docs && bun test && bun run lint && bun run types:check` すべて exit 0
- [ ] `security-docs/src/app/docs/csslp-prep/page.mdx` が存在し、Domain 1〜8 の
      `SectionCard` を持つ
- [ ] `grep -n "csslp-prep" security-docs/src/config/docs.ts` が 1 件ヒット
- [ ] `/docs/csslp-prep` が dev サーバーで 200
- [ ] `certifications/page.mdx` の差分がリンク追加 1 行以内 (`git diff --stat`)
- [ ] `plans/README.md` のステータス行を更新済み

## STOP conditions

- docs.ts に `Certifications & Exam Prep` セクションが存在しない (Plan 002 未適用)
- `certifications/page.mdx` の CSSLP セクションが「Current state」の抜粋と大きく異なる
- layout.test.tsx の件数アサーションが見つからない・形式が変わっている
- Step 2 のテストが 2 回連続で失敗し、原因がページ登録以外にある

## Maintenance notes

- ISC2 の CSSLP Exam Outline 改定時 (Plan 006 の運用で検知) は、ドメイン名・出題比率・
  `Checklist` の学習項目を更新する
- 将来 CASE / GWEB の対策ページを作る場合は本ページの構成をテンプレートとして流用できる
- レビュー観点: 内部リンク先 (secdev-guide 等) の実在、出題比率の出典明示
