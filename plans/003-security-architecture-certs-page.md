# Plan 003: CISSP-ISSAP / SABSA アーキテクチャ資格ページを追加する

> **Executor instructions**: 本プランをステップ順に実行し、各検証コマンドの期待結果を
> 確認してから次へ進むこと。「STOP conditions」に該当したら中断して報告する。
> 完了時に `plans/README.md` の本プランのステータス行を更新すること。
>
> **Drift check (run first)**: `git diff --stat 8892abf..HEAD -- security-docs/src/config/docs.ts security-docs/src/app/docs/layout.test.tsx security-docs/src/app/docs/certifications/`
> Plan 002 適用後は docs.ts / layout.test.tsx に差分があるのが正常。
> `Certifications & Exam Prep` セクションが docs.ts に存在することを確認してから進む。

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: LOW
- **Depends on**: plans/002-sidebar-ia-restructure.md
- **Category**: direction
- **Planned at**: commit `8892abf`, 2026-07-07

## Why this matters

CISSP-ISSAP (ISC2 のセキュリティアーキテクチャ上位資格) と SABSA (エンタープライズ
セキュリティアーキテクチャ手法) は、本プラットフォーム運用者の学習対象でありながら
現在まったくカバーされていない (Plan 001 のギャップ G2)。既存 `architecture` ページは
概説にとどまり、試験ドメイン構成に沿った対策ハブが存在しない。本プランで
`/docs/issap-sabsa` ページを新設し、Governance & Architecture セクションをサイドバーに追加する。

## Current state

- `security-docs/src/app/docs/certifications/page.mdx` — 既存の資格ページ (111 行)。
  **本プランのエクセンプラ**。frontmatter とコンポーネント使用の実例:

```mdx
---
title: "AppSec 国際資格完全ガイド 2026"
description: "CSSLP・CASE・GWEBの国際資格を初学者向けにカテゴリーごとにステップバイステップで解説する完全ガイド"
---

<HeroSection
  section="CERT"
  title={<>AppSec 国際資格<br /><span className="...">完全ガイド 2026</span></>}
  description={<>...</>}
  chips={["ISC2 · CSSLP", "EC-Council · CASE", "GIAC · GWEB", "📅 2026-03-26"]}
/>

<SectionCard eyebrow="// Certification 01" title={...} sub="...">
  <Callout type="info" title="...">...</Callout>
  <StepTimeline steps={[{ title: "Domain 1: ...", content: "..." }, ...]} />
  <DataTable headers={[...]} rows={[[<Tag color="blue">CSSLP</Tag>, "ISC2", ...], ...]} />
</SectionCard>
```

- MDX コンポーネントは `security-docs/src/mdx-components.tsx` でグローバル登録済み —
  **page.mdx 内で import 不要**。利用可能: `HeroSection` / `SectionCard` / `Callout` /
  `HighlightBox` / `StepTimeline` / `CompareGrid` / `DataTable` / `Checklist` /
  `SourceReferences` / `Tag` / `DocsSubheading` ほか (ルートの `CLAUDE.md` に一覧)
- `security-docs/src/config/docs.ts` — Plan 002 適用後、`Certifications & Exam Prep`
  セクションが存在する
- `security-docs/src/app/docs/layout.test.tsx` — セクション数・エントリ数 (11 件) を
  ハードコードでアサートしている。ページ追加時に更新必須
- `security-docs/src/lib/search.ts` — `src/app/docs/` 直下のサブディレクトリを自動スキャン。
  ページ追加だけで検索対象になる (変更不要)

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Install | `cd security-docs && bun install` | exit 0 |
| Tests | `cd security-docs && bun test` | all pass |
| Lint | `cd security-docs && bun run lint` | exit 0 |
| Typecheck | `cd security-docs && bun run types:check` | exit 0 |
| Dev server | `cd security-docs && bun run dev` | http://localhost:3000 |

## Suggested executor toolkit

- リポジトリに `mdx-page-adder` スキルがある場合はそれを使う (ページ作成 + docs.ts 登録の
  定型フローを自動化する)
- ドメイン内容の執筆前に ISC2 公式の ISSAP 試験アウトライン (Exam Outline) と
  SABSA Institute の公開資料で最新ドメイン構成を確認する

## Scope

**In scope**:

- `security-docs/src/app/docs/issap-sabsa/page.mdx` (新規作成)
- `security-docs/src/config/docs.ts` (セクション追加 + エントリ追加)
- `security-docs/src/app/docs/layout.test.tsx` (件数アサーション更新)
- `docs/progress.md` (進捗追記)

**Out of scope**:

- 既存 `architecture` ページの改稿 — 概説ページとして残す。リンクで接続するのみ
- `certifications` ページの変更 — Plan 005 の担当
- `search.ts` / `DocsSidebar.tsx` — 自動追従するため変更不要

## Git workflow

- ブランチ: `dev` から `feat/issap-sabsa-page` を切る
- TDD 必須 (`.claude/rules/tdd-mandatory-cycle.md`): test → feat → (refactor) → docs の順にコミット
- push / PR 作成は運用者の指示があるまで行わない

## Steps

### Step 1 (Red): layout.test.tsx の件数アサーションを更新し失敗を確認する

- セクション数アサーション: 現在値 +1 (`Governance & Architecture` 追加分)
- エントリ数アサーション: 現在値 +1 (`ISSAP & SABSA` 追加分)。テスト名の件数表記も更新
- 新テスト: セクション見出しに `Governance & Architecture` が描画される

**Verify**: `cd security-docs && bun test src/app/docs/layout.test.tsx` → 更新分が失敗する

コミット: `test(docs): add failing spec for issap-sabsa page registration`

### Step 2 (Green): page.mdx を作成し docs.ts に登録する

`security-docs/src/app/docs/issap-sabsa/page.mdx` を新規作成する。構成:

1. frontmatter: `title: "セキュリティアーキテクチャ資格ガイド — CISSP-ISSAP & SABSA"`,
   `description` (エクセンプラの形式に従う)
2. `<HeroSection section="ARCH-CERT" ...>` — chips に `ISC2 · ISSAP` / `SABSA Institute` / 作成日
3. `<SectionCard>` × 以下:
   - Introduction: なぜアーキテクチャ資格か (ISSAP と SABSA の位置づけ比較 `DataTable`)
   - ISSAP: 6 ドメインを `StepTimeline` で (ガバナンス・リスク / アーキテクチャモデリング /
     インフラ / IAM / アプリケーションセキュリティ / セキュリティオペレーション)。
     受験要件 (CISSP 保持 + 実務経験) を `Callout type="info"` で明記
   - SABSA: 6 レイヤーモデル (Contextual → Component + Management & Operations) を
     `StepTimeline`、SABSA マトリクス (6x6) の概要を `DataTable`、
     資格パス SCF → SCP → SCM を `Checklist` または `StepTimeline` で
   - 学習ロードマップ: 既存 `/docs/architecture` ページへの内部リンクを含める
4. `<SourceReferences>` — ISC2 公式 ISSAP ページ / SABSA Institute 公式のみを出典とする

`security-docs/src/config/docs.ts`:

- `Certifications & Exam Prep` の items に
  `{ title: "ISSAP & SABSA (Architecture)", href: "/docs/issap-sabsa" }` を追加
- `Governance & Architecture` セクションを `Archive` の前に新設する。初期 items は
  再掲ページへの導線として `{ title: "Security Architecture", href: "/docs/architecture" }`
  を `Getting Started` から**移設**する (重複掲載しない)。
  総エントリ数の変化: 移設は ±0、issap-sabsa 追加で +1 (Step 1 のアサーションと一致する)

**Verify**: `cd security-docs && bun test` → all pass

コミット: `feat(docs): add ISSAP & SABSA architecture certifications page`

### Step 3 (Refactor): lint / typecheck / 表示確認

**Verify**:

- `cd security-docs && bun run lint && bun run types:check` → exit 0
- `cd security-docs && bun run dev` を起動し `http://localhost:3000/docs/issap-sabsa` が
  200 で描画され、サイドバーに新セクションが表示されること (`curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/docs/issap-sabsa` → `200`)

修正が発生した場合のみコミット: `refactor(docs): clean up issap-sabsa page`

### Step 4 (Docs Sync): docs/progress.md を更新する

新ページ追加を `docs/progress.md` に追記する (既存の記載フォーマットに従う)。

コミット: `chore(docs): update docs/progress.md — issap-sabsa page`

## Test plan

- 更新: `security-docs/src/app/docs/layout.test.tsx` (件数 + 新セクション見出し)
- 構造パターン: 同ファイルの既存 `describe('sidebar rendering')` に従う
- **Verify**: `cd security-docs && bun test` → all pass

## Done criteria

- [ ] `cd security-docs && bun test && bun run lint && bun run types:check` すべて exit 0
- [ ] `security-docs/src/app/docs/issap-sabsa/page.mdx` が存在し frontmatter に
      title / description を持つ
- [ ] `grep -n "issap-sabsa" security-docs/src/config/docs.ts` が 1 件ヒット
- [ ] `/docs/issap-sabsa` が dev サーバーで 200
- [ ] In scope 外のファイルに変更がない (`git status`)
- [ ] `plans/README.md` のステータス行を更新済み

## STOP conditions

- docs.ts に `Certifications & Exam Prep` セクションが存在しない (Plan 002 未適用)
- `mdx-components.tsx` に本プランで使うコンポーネントが登録されていない
- layout.test.tsx の件数アサーションが見つからない・形式が変わっている
- Step 2 のテストが 2 回連続で失敗し、原因がページ登録以外にある

## Maintenance notes

- ISC2 は試験アウトラインを定期改定する。改定検知時は本ページの `StepTimeline` を更新し、
  frontmatter や Hero の日付 chip を更新すること (Plan 006 の運用に従う)
- 将来 Governance & Architecture 配下に NIST CSF 2.0 / ISO 27001 / ゼロトラストの
  独立ページを追加する際は、本ページからの内部リンクを張り替える
- レビュー観点: 出典が公式一次ソースのみか、ドメイン名の和訳が公式資料と乖離していないか
