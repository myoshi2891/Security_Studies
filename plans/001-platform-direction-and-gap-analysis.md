# Plan 001: プラットフォーム方向性とギャップ分析 — 試験対策カテゴリ体系を確定する

> **Executor instructions**: 本プランは「方向性ドキュメント」であり、コード変更を伴わない。
> 後続プラン (002〜006) の判断基準として参照される。実行者が行うのは本ドキュメントの
> 内容承認と、変更が生じた場合の追記のみ。コード変更はすべて後続プランで行う。

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: LOW
- **Depends on**: none
- **Category**: direction
- **Planned at**: commit `8892abf`, 2026-07-07

## Why this matters

本プラットフォーム (`security-docs/`) は AppSec 中心のドキュメントサイトとして成長してきたが、
運用者の学習目標である主要セキュリティ資格 — CISSP-ISSAP / SABSA / CSSLP /
Google Cloud Professional Cloud Security Engineer (以下 GCP PCSE) /
AWS Certified Security – Specialty (以下 AWS SCS) — に対して、
**クラウドセキュリティ・セキュリティアーキテクチャ・ガバナンスの 3 領域がまるごと欠落**している。
本ドキュメントはその欠落を資格ドメイン単位で特定し、プラットフォームが扱うべき
カテゴリ体系 (情報アーキテクチャ) と拡張ロードマップを確定する。

## Current state — コンテンツ棚卸し

`security-docs/src/app/docs/` 配下の既存ページ (2026-07-07 時点):

| slug | 内容 | カバーする資格ドメイン |
|---|---|---|
| `approach` | セキュリティ取り組み方針 2026 | 横断 (導入) |
| `architecture` | セキュリティアーキテクチャ概説 | ISSAP の入口になるが試験対応ではない |
| `ai-coding-safety` | AI コーディング安全ガイド | 資格対応なし (独自価値) |
| `llm-ai-security` | LLM / AI セキュリティ | 資格対応なし (独自価値) |
| `secdev-guide` | Secure SDLC ガイド | CSSLP D1〜D7 の基礎 |
| `supply-chain` | ソフトウェアサプライチェーン | CSSLP D8 |
| `pqc` | ポスト量子暗号 | ISSAP D3 / クラウド資格のデータ保護に関連 |
| `owasp` | OWASP Top 10 (2025/2026) | CSSLP D4〜D5, AWS SCS D3 の一部 |
| `threat-landscape` | 脅威ランドスケープ 2026 | AWS SCS D1 の背景知識 |
| `certifications` | AppSec 資格ガイド (CSSLP/CASE/GWEB) | CSSLP のドメイン**一覧のみ** (対策なし) |
| `archive/approach` | 旧版アーカイブ | — |

サイドバー (`security-docs/src/config/docs.ts`) は Getting Started / Security Guides /
Advanced Topics / Resources / Archive の 5 セクション構成。

## 対象 5 資格のドメインマップ

> 注: 試験アウトラインは改定されるため、各ページ執筆時に必ず公式 (ISC2 / SABSA Institute /
> Google Cloud / AWS) の最新版を確認すること (Plan 006 の運用ルール参照)。

### CISSP-ISSAP (ISC2, セキュリティアーキテクチャ上位資格) — 6 ドメイン

1. ガバナンス・コンプライアンス・リスク管理のためのアーキテクチャ
2. セキュリティアーキテクチャのモデリング
3. インフラストラクチャセキュリティアーキテクチャ
4. ID・アクセス管理 (IAM) アーキテクチャ
5. アプリケーションセキュリティのアーキテクチャ
6. セキュリティオペレーションアーキテクチャ

### SABSA (エンタープライズセキュリティアーキテクチャ手法)

- 6 レイヤーモデル: Contextual / Conceptual / Logical / Physical / Component + 横断の Management & Operations
- SABSA マトリクス (6x6: What / Why / How / Who / Where / When)
- ビジネス属性プロファイリング (Business Attributes Profiling)
- 資格: SABSA Chartered Foundation (SCF) → Practitioner (SCP) → Master (SCM)

### CSSLP (ISC2, セキュア SDLC) — 8 ドメイン

既存 `certifications` ページに一覧あり (Secure Software Concepts / Requirements /
Architecture and Design / Implementation / Testing / Lifecycle Management /
Deployment, Operations, Maintenance / Supply Chain)。**ドメイン別の試験対策・学習リソースが未整備** (Plan 005)。

### GCP Professional Cloud Security Engineer — 主要セクション

1. アクセス構成 (Cloud Identity, IAM, サービスアカウント管理)
2. 通信の保護と境界防御 (VPC, ファイアウォール, Cloud Armor, ゼロトラスト/BeyondCorp)
3. データ保護 (Cloud KMS, CMEK, DLP, Secret Manager)
4. オペレーション管理 (Cloud Logging/Monitoring, SCC, インシデント対応)
5. コンプライアンス対応 (Assured Workloads, 規制要件)

### AWS Certified Security – Specialty (SCS-C02) — 6 ドメイン

1. 脅威検知とインシデント対応 (GuardDuty, Detective, Security Hub)
2. セキュリティのロギングとモニタリング (CloudTrail, CloudWatch, Config)
3. インフラストラクチャセキュリティ (VPC, WAF, Network Firewall)
4. ID とアクセス管理 (IAM, Organizations, Identity Center)
5. データ保護 (KMS, Secrets Manager, ACM, Macie)
6. 管理とセキュリティガバナンス (Control Tower, ポリシー管理)

## ギャップ分析

| # | ギャップ領域 | 影響する資格 | 現状 | 深刻度 |
|---|---|---|---|---|
| G1 | クラウドセキュリティ全般 (IAM / データ保護 / ネットワーク / 検知) | GCP PCSE 全域, AWS SCS 全域 | **セクションごと欠落** | HIGH |
| G2 | セキュリティアーキテクチャ方法論 (ISSAP 6 ドメイン, SABSA) | ISSAP, SABSA | `architecture` ページは概説のみ | HIGH |
| G3 | ガバナンス・コンプライアンス (NIST CSF 2.0, ISO 27001, ゼロトラスト SP 800-207) | ISSAP D1, GCP PCSE S5, AWS SCS D6 | 欠落 | MED |
| G4 | ID・アクセス管理の体系的整理 | 全 5 資格に横断 | 欠落 (各資格ページ内で扱う方針とする) | MED |
| G5 | インシデント対応・検知運用 | AWS SCS D1〜D2, GCP PCSE S4, ISSAP D6 | `threat-landscape` の背景知識のみ | MED |
| G6 | CSSLP ドメイン別試験対策 | CSSLP | ドメイン名の一覧のみ | MED |
| G7 | 試験改定・脅威動向のキャッチアップ運用 | 全資格 | 更新フロー未定義 (静的ページのみ) | MED |

## 提案するカテゴリ体系 (新 IA)

サイドバーを以下の 7 セクションに再編する (実装手順は Plan 002):

1. **Getting Started** — 現状維持 (approach / architecture)
2. **Security Guides** — 現状維持 (ai-coding-safety / llm-ai-security / secdev-guide)
3. **Advanced Topics** — 現状維持 (supply-chain / pqc / owasp / threat-landscape)
4. **Certifications & Exam Prep** (拡張) — AppSec 資格 (既存) / ISSAP・SABSA (Plan 003) /
   クラウド資格 GCP PCSE・AWS SCS (Plan 004) / CSSLP 対策深掘り (Plan 005)
5. **Cloud Security** (新設) — IAM 基礎 / データ保護・KMS / ネットワーク防御 /
   ログ・検知・対応 (資格ページから昇格させる共通基盤知識の受け皿。初期は空でもよい)
6. **Governance & Architecture** (新設) — NIST CSF 2.0 / ISO 27001 / ゼロトラスト /
   SABSA・エンタープライズアーキテクチャ
7. **Resources / Archive** — 現状維持

設計原則:

- **資格ページ = 試験ドメイン構成に沿った対策ハブ**。共通知識 (IAM の一般論など) が
  複数資格で重複し始めたら Cloud Security / Governance 配下の独立ページに切り出し、
  資格ページからリンクする (重複コンテンツを作らない)
- 各ページは既存 MDX コンポーネント (`HeroSection` / `SectionCard` / `StepTimeline` /
  `DataTable` / `SourceReferences` 等) を使い、frontmatter に `title` / `description` を必須とする
- 全ページに `SourceReferences` で公式一次ソースを明記し、Plan 006 の更新運用に接続する

## 追加検討カテゴリ (今回はスコープ外、将来候補)

- コンテナ / Kubernetes セキュリティ (CKS 対応) — クラウド資格 2 つの学習が進んだ後
- DFIR (デジタルフォレンジック・インシデント対応) — AWS SCS D1 深掘りの派生として
- プライバシー・法規制 (GDPR / 改正個人情報保護法) — Governance セクションの拡張として
- 追加資格: CCSP (ISC2 クラウド) / Azure AZ-500 / CISM — 対象 5 資格の後
- 演習・模擬問題機能 (インタラクティブコンポーネント) — コンテンツ充実後の機能拡張

## ロードマップ (推奨実行順)

| フェーズ | プラン | 狙い |
|---|---|---|
| Phase 1 | 002 (サイドバー IA 再編) | 受け皿を先に作る (小さく低リスク) |
| Phase 2 | 003 (ISSAP/SABSA) + 004 (クラウド資格) | 最大ギャップ G1/G2 を埋める。並行実行可 |
| Phase 3 | 005 (CSSLP 深掘り) + 006 (キャッチアップ運用) | 既存資産の強化と鮮度維持の仕組み化 |

## Done criteria

- [ ] 本ドキュメントの IA 案が Plan 002 の実装内容と一致している
- [ ] ギャップ G1〜G7 のそれぞれが後続プラン (002〜006) のいずれかに対応付いている
- [ ] 追加検討カテゴリが「スコープ外」と明記されている

## Maintenance notes

- 試験アウトライン改定 (特に ISC2 と AWS は定期改定がある) を検知したら、本ドキュメントの
  ドメインマップを更新し、影響する後続プランに STOP 注記を追加すること
- 新カテゴリ追加の議論はまず本ドキュメントの「追加検討カテゴリ」を更新してから行う
