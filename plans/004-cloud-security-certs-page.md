# Plan 004: クラウドセキュリティ資格ページを追加する (GCP PCSE / AWS SCS)

> **Executor instructions**: 本プランをステップ順に実行し、各検証コマンドの期待結果を
> 確認してから次へ進むこと。「STOP conditions」に該当したら中断して報告する。
> 完了時に `plans/README.md` の本プランのステータス行を更新すること。
>
> **Drift check (run first)**: `git diff --stat 8892abf..HEAD -- security-docs/src/config/docs.ts security-docs/src/app/docs/layout.test.tsx`
> Plan 002 (および 003 が先行実行済みの場合はその分) の差分があるのが正常。
> docs.ts に `Certifications & Exam Prep` セクションが存在することを確認してから進む。

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: LOW
- **Depends on**: plans/002-sidebar-ia-restructure.md
- **Category**: direction
- **Planned at**: commit `8892abf`, 2026-07-07

## Why this matters

クラウドセキュリティは Plan 001 のギャップ分析で**最大の欠落領域 (G1, HIGH)** と判定された。
Google Cloud Professional Cloud Security Engineer (GCP PCSE) と
AWS Certified Security – Specialty (AWS SCS, SCS-C02) は運用者の主要学習対象であり、
両試験のドメインは IAM / データ保護 / ネットワーク防御 / 検知・対応で大きく重なる。
1 ページに両資格を併記し共通ドメインを対比させることで、重複コンテンツを避けつつ
マルチクラウドの試験対策ハブを作る。

## Current state

- `security-docs/src/app/docs/certifications/page.mdx` — エクセンプラ。
  frontmatter / `HeroSection` / `SectionCard` / `StepTimeline` / `DataTable` の使用例は
  plans/003-security-architecture-certs-page.md の「Current state」に抜粋があるが、
  **本プランは単独で実行できる**: エクセンプラの実物を直接読むこと
  (`security-docs/src/app/docs/certifications/page.mdx`、111 行)
- MDX コンポーネントは `security-docs/src/mdx-components.tsx` でグローバル登録済み —
  page.mdx 内で import 不要。`CompareGrid` (比較グリッド) が本ページの主役になる
- `security-docs/src/config/docs.ts` — Plan 002 適用後、`Certifications & Exam Prep` あり。
  `Cloud Security` セクションは**まだ存在しない** (本プランで新設する)
- `security-docs/src/app/docs/layout.test.tsx` — セクション数・エントリ数を
  ハードコードでアサート。ページ追加時に更新必須
- `security-docs/src/lib/search.ts` — docs 配下を自動スキャン。変更不要

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
- 執筆前に必ず公式試験ガイドの最新版を確認する:
  Google Cloud の PCSE Exam Guide、AWS の SCS-C02 Exam Guide (ドメイン比率含む)

## Scope

**In scope**:

- `security-docs/src/app/docs/cloud-security-certs/page.mdx` (新規作成)
- `security-docs/src/config/docs.ts` (`Cloud Security` セクション新設 + エントリ追加)
- `security-docs/src/app/docs/layout.test.tsx` (件数アサーション更新)
- `docs/progress.md` (進捗追記)

**Out of scope**:

- IAM / KMS 等の共通基盤の独立ページ作成 — 本ページ内のセクションで扱い、
  分量が肥大化したら将来プランで `Cloud Security` 配下に切り出す (Plan 001 の設計原則)
- `certifications` / `issap-sabsa` ページの変更
- CCSP / AZ-500 の追加 — Plan 001 で将来候補と定義済み

## Git workflow

- ブランチ: `dev` から `feat/cloud-security-certs-page` を切る
- TDD 必須 (`.claude/rules/tdd-mandatory-cycle.md`): test → feat → (refactor) → docs の順にコミット
- push / PR 作成は運用者の指示があるまで行わない

## Steps

### Step 1 (Red): layout.test.tsx の件数アサーションを更新し失敗を確認する

- セクション数アサーション: 現在値 +1 (`Cloud Security` 新設分)
- エントリ数アサーション: 現在値 +1 (資格ページ 1 件。掲載先は Step 2 参照)
- 新テスト: セクション見出しに `Cloud Security` が描画される

**Verify**: `cd security-docs && bun test src/app/docs/layout.test.tsx` → 更新分が失敗する

コミット: `test(docs): add failing spec for cloud security certs page registration`

### Step 2 (Green): page.mdx を作成し docs.ts に登録する

`security-docs/src/app/docs/cloud-security-certs/page.mdx` を新規作成する。構成:

1. frontmatter: `title: "クラウドセキュリティ資格ガイド — GCP PCSE & AWS Security Specialty"` +
   `description`
2. `<HeroSection section="CLOUD-CERT" ...>` — chips: `Google Cloud · PCSE` /
   `AWS · SCS-C02` / 作成日
3. `<SectionCard>` × 以下:
   - Introduction: 両資格の位置づけ比較 (`DataTable`: 主催 / 前提知識 / 試験形式 / 有効期限)
   - 共通ドメインマップ: `CompareGrid` で GCP ↔ AWS のドメイン対応を対比
     (IAM ⇔ Cloud Identity・IAM / 検知 ⇔ GuardDuty・SCC / データ保護 ⇔ KMS・CMEK など)
   - GCP PCSE: 試験セクションを `StepTimeline` で (アクセス構成 / 境界防御 /
     データ保護 / オペレーション / コンプライアンス)
   - AWS SCS-C02: 6 ドメインを `StepTimeline` で (脅威検知 / ロギング・モニタリング /
     インフラ / IAM / データ保護 / ガバナンス)。ドメイン比率は公式ガイド確認のうえ記載
   - 学習戦略: どちらから受けるか・共通学習項目を `Checklist` で
4. `<SourceReferences>` — Google Cloud / AWS の公式試験ガイドのみを出典とする

`security-docs/src/config/docs.ts`:

- `Cloud Security` セクションを `Certifications & Exam Prep` の直後に新設し、エントリ
  `{ title: "Cloud Security Certs (GCP/AWS)", href: "/docs/cloud-security-certs" }` を置く
- **同一 href を複数セクションに重複掲載しない** (検索・アクティブリンク挙動が混乱するため)。
  したがって `Certifications & Exam Prep` 側には追加しない
- 既存エントリ (`threat-landscape` 等) の移設は行わない
- 総エントリ数の変化は +1 (Step 1 のエントリ数アサーションと一致する)

**Verify**: `cd security-docs && bun test` → all pass

コミット: `feat(docs): add cloud security certifications page (GCP PCSE / AWS SCS)`

### Step 3 (Refactor): lint / typecheck / 表示確認

**Verify**:

- `cd security-docs && bun run lint && bun run types:check` → exit 0
- `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/docs/cloud-security-certs`
  → `200` (dev サーバー起動中に実行)

修正が発生した場合のみコミット: `refactor(docs): clean up cloud security certs page`

### Step 4 (Docs Sync): docs/progress.md を更新する

コミット: `chore(docs): update docs/progress.md — cloud-security-certs page`

## Test plan

- 更新: `security-docs/src/app/docs/layout.test.tsx`
  (セクション数 +1 / エントリ数 +1 / `Cloud Security` 見出しの描画)
- 構造パターン: 同ファイルの既存 `describe('sidebar rendering')` に従う
- **Verify**: `cd security-docs && bun test` → all pass

## Done criteria

- [ ] `cd security-docs && bun test && bun run lint && bun run types:check` すべて exit 0
- [ ] `security-docs/src/app/docs/cloud-security-certs/page.mdx` が存在し frontmatter に
      title / description を持つ
- [ ] `grep -n "cloud-security-certs" security-docs/src/config/docs.ts` が 1 件ヒット
      (重複掲載なし)
- [ ] `/docs/cloud-security-certs` が dev サーバーで 200
- [ ] In scope 外のファイルに変更がない (`git status`)
- [ ] `plans/README.md` のステータス行を更新済み

## STOP conditions

- docs.ts に `Certifications & Exam Prep` セクションが存在しない (Plan 002 未適用)
- docs.ts に既に `Cloud Security` セクションが存在する (別プランが先行、要整合確認)
- layout.test.tsx の件数アサーションが見つからない・形式が変わっている
- Step 2 のテストが 2 回連続で失敗し、原因がページ登録以外にある

## Maintenance notes

- AWS は試験バージョンを改定する (SCS-C02 → 次版)。バージョン表記を本ページに残しているため、
  改定検知時 (Plan 006 の運用) は slug は変えずに本文と chips を更新する
- 本ページの IAM / KMS セクションが他資格ページと重複し始めたら、`Cloud Security` 配下の
  独立ページへ切り出す (Plan 001 の設計原則)。その際サイドバーとテスト件数の更新を忘れない
- レビュー観点: GCP と AWS のサービス名対応 (`CompareGrid`) が公式名称と一致しているか
