# Plan 006: 試験改定・脅威動向のキャッチアップ運用を確立する

> **Executor instructions**: 本プランは運用ルールの文書化が主体で、コード変更は伴わない。
> 成果物は `docs/content-freshness.md` (新規) と `docs/progress.md` への追記のみ。
> 「STOP conditions」に該当したら中断して報告する。
> 完了時に `plans/README.md` の本プランのステータス行を更新すること。

## Status

- **Priority**: P3
- **Effort**: S
- **Risk**: LOW
- **Depends on**: plans/001-platform-direction-and-gap-analysis.md
- **Category**: direction
- **Planned at**: commit `8892abf`, 2026-07-07

## Why this matters

試験対策プラットフォームの価値は鮮度で決まる。ISC2 / AWS / Google Cloud は試験アウトラインを
定期改定し、OWASP Top 10 や脅威ランドスケープも年次で動く。現在は静的ページのみで
「いつ・何を・どう更新するか」のルールが存在しない (Plan 001 のギャップ G7)。
更新運用を文書化し、既存の `SourceReferences` コンポーネントと Archive セクションを
鮮度管理の仕組みとして位置づける。

## Current state

- 全 docs ページの frontmatter に `title` / `description` はあるが、**更新日の管理規約がない**
  (Hero の chips に日付を入れているページと入れていないページが混在)
- `<SourceReferences>` コンポーネント (`security-docs/src/components/docs/` 配下、
  グローバル登録済み) — 出典一覧の表示に使われているが、
  「公式一次ソースに限定する」等のルールは暗黙
- サイドバーに `Archive` セクションがあり、旧版ページを `docs/archive/<slug>` に退避する
  運用実績が 1 件ある (`archive/approach`)
- リポジトリには `docs-sync` スキル (仕様書同期) と `docs/progress.md` (進捗管理) が存在する

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Markdown lint 目視確認 | (markdownlint 設定 `.markdownlint.json` に従う) | MD031/MD022/MD032/MD047 違反なし |
| PII チェック | `git diff --cached \| grep -E '(/Users/\|/home/)'` | 出力なし |

## Scope

**In scope**:

- `docs/content-freshness.md` (新規作成 — 運用ルール本体)
- `docs/progress.md` (追記)

**Out of scope**:

- MDX ページ・コンポーネント・設定のコード変更 — 運用ルールの適用は各ページの
  次回更新時に行う (一斉改修はしない)
- RSS 取得や更新チェックの自動化実装 — 将来候補として文書内に記載するにとどめる

## Git workflow

- ブランチ: `dev` で直接作業してよい (docs-only、コード変更なし)
- コミット形式: `docs(<scope>): <subject>`
- push / PR 作成は運用者の指示があるまで行わない

## Steps

### Step 1: docs/content-freshness.md を作成する

以下の内容を含む運用ルールを書く:

1. **監視対象の一次ソース一覧** (資格別):

   | 対象 | 一次ソース | 確認頻度 |
   |---|---|---|
   | CISSP-ISSAP / CSSLP | ISC2 公式 Exam Outline ページ | 四半期 |
   | SABSA | SABSA Institute 公式 | 半期 |
   | GCP PCSE | Google Cloud 認定資格ページ (Exam Guide) | 四半期 |
   | AWS SCS | AWS Certification ページ (Exam Guide, バージョン番号) | 四半期 |
   | OWASP Top 10 | OWASP 公式 | 年次 |
   | 脅威動向 | NIST / CISA / JPCERT 等の公開情報 | 月次 (threat-landscape 更新時) |

2. **更新トリガーと対応**: 試験アウトライン改定を検知したら
   (a) `plans/001` のドメインマップを更新、(b) 影響ページを改稿、
   (c) 大改稿の場合は旧版を `security-docs/src/app/docs/archive/<slug>/` に退避し
   サイドバーの `Archive` に登録する (既存の `archive/approach` の前例に従う)
3. **鮮度表示の規約**: 全 docs ページの Hero chips に `📅 YYYY-MM-DD` (最終確認日) を
   含める。frontmatter の `description` には日付を入れない (検索結果の劣化を避ける)
4. **出典規約**: `<SourceReferences>` には公式一次ソースのみを載せる。
   ブログ・まとめ記事は載せない。リンク切れは更新トリガーとして扱う
5. **将来の自動化候補** (実装しない、記載のみ): 一次ソース URL の定期チェック、
   Hero chips 日付の stale 検出スクリプト

**Verify**: ファイルが存在し、上記 5 項目の見出しを含む
(`grep -c "^## " docs/content-freshness.md` → 5 以上)

コミット: `docs(ops): add content freshness operations guide`

### Step 2: docs/progress.md に運用開始を追記する

既存フォーマットに従い、content-freshness 運用の開始を 1 行追記する。

**Verify**: `git diff --stat` が `docs/progress.md` のみを示す

コミット: `chore(docs): update docs/progress.md — content freshness ops`

## Test plan

コード変更がないため自動テストは対象外。`cd security-docs && bun test` が
本プラン前後で同結果であることを確認する (無変更の確認)。

## Done criteria

- [ ] `docs/content-freshness.md` が存在し、監視ソース表・更新トリガー・鮮度表示規約・
      出典規約・自動化候補の 5 セクションを持つ
- [ ] `docs/progress.md` に追記済み
- [ ] `security-docs/` 配下に変更がない (`git status`)
- [ ] ドキュメント内に絶対パス・ユーザー名が含まれない
- [ ] `plans/README.md` のステータス行を更新済み

## STOP conditions

- `docs/` ディレクトリが存在しない、または `docs/progress.md` のフォーマットが
  想定と大きく異なる
- `content-freshness.md` が既に存在する (別経路で作成済み — 重複作成せず整合を確認して報告)

## Maintenance notes

- 本運用ルール自体の見直しは半期ごと。新資格 (CCSP / AZ-500 等) を追加したら監視対象表に
  行を足す
- Plan 003〜005 のページは作成時点から本規約 (Hero chips 日付 / 一次ソース限定) に従うこと
- レビュー観点: 確認頻度が現実的か (運用者は個人。過剰な頻度は形骸化する)
