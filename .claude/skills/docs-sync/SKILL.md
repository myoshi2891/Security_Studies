---
name: security-docs-sync
description: >
  Ensures all project specification documents (CLAUDE.md, GEMINI.md, README.md,
  docs/progress.md, docs/test-coverage-dashboard.html, security-docs/CLAUDE.md,
  and security-docs/README.md) are kept synchronized and updated
  with the latest project status, test counts, paths, and clear pending migrations.
  Requires updating the "Last Updated" or "Updated YYYY-MM-DD" timestamp in each document
  whenever a change is made.
  Trigger: 仕様書の更新, 更新漏れ確認, ドキュメント同期, 各仕様書を更新,
  各仕様書の更新漏れがないか, docs sync, 仕様書同期, spec sync, test追加,
  テスト追加, 依存関係の更新, CIワークフロー変更, 設定ファイル追加,
  セッション終了, 再開プロンプト, progress.md, CLAUDE.md, GEMINI.md,
  README.md, docs-sync, spec-sync, 最終更新日, Last Updated.
---

# Security_Studies 仕様書同期スキル

## Goal

`CLAUDE.md` / `GEMINI.md` / `README.md` / `docs/progress.md` / `docs/test-coverage-dashboard.html` / `security-docs/CLAUDE.md` / `security-docs/README.md` の全仕様書を、常にプロジェクトの最新状況（実装、テスト、構成）と乖離させず、漏れなく最新に保つ。

---

## 最終更新日（Last Updated）の記載ルール

すべての仕様書および進捗管理ドキュメントには、**更新を行った日付**を必ず明記し、いつ時点の仕様であるかを誰でも判断できるようにしなければなりません。

### 記載フォーマットと場所

各ドキュメントの以下の位置に、最終更新日を記載または更新してください：

| ドキュメント | 最終更新日の記載方法 | 記載・更新場所 |
|---|---|---|
| `CLAUDE.md` (ルート) | `Updated YYYY-MM-DD` | ファイル見出し下、または冒頭付近 |
| `GEMINI.md` (ルート) | `Updated YYYY-MM-DD` | ファイル見出し下、または冒頭付近 |
| `README.md` (ルート) | `最終更新日: YYYY-MM-DD` | ファイル冒頭付近（見出しの直下） |
| `docs/progress.md` | `最終更新: YYYY-MM-DD` | ファイル冒頭付近 |
| `docs/test-coverage-dashboard.html` | `Scanned YYYY-MM-DD` またはメタ情報エリア、フッター | ヘッダーメタ情報エリア（`Scanned`）およびフッター（`Updated`） |
| `security-docs/CLAUDE.md` | `Updated YYYY-MM-DD` または `最終更新日: YYYY-MM-DD` | ファイル内 |
| `security-docs/README.md` | `最終更新日: YYYY-MM-DD` | ファイル内 |

---

## いつ、どのタイミングで、どの仕様書を更新するか

開発中に発生する操作（イベント）と、更新が必要な仕様書の対応関係は以下の通りです。イベント発生後、**直ちに（次のタスクに移る前に）**対象の仕様書をすべて更新しなければなりません。

```text
Event 1: 新規ドキュメント・ページ追加
  ├── CLAUDE.md (ルート) のアーキテクチャ・パス同期
  ├── GEMINI.md の Project Overview/Architecture 整合
  ├── docs/progress.md のカテゴリー・ファイル別ステータス更新
  └── docs/test-coverage-dashboard.html のテスト対象ファイルカウント更新

Event 2: テストの追加・修正
  ├── docs/progress.md のテストケース総数・ファイル別テスト数更新
  └── docs/test-coverage-dashboard.html のテスト件数・パーセンテージ更新

Event 3: 手順・構成の変更 (Docker等)
  ├── README.md のコマンド定義同期
  ├── CLAUDE.md のコマンド・Docker構成同期
  └── security-docs/README.md / CLAUDE.md 同期
```

---

## 監査・確認プロセス（「更新漏れがないか確認して」への対応）

ユーザーまたはシステムから「更新漏れがないか確認」の依頼を受けた際、またはセッション終了時には、以下の監査手順を実行し、すべての不整合を解消してください。

### 1. 現在のステータス情報の収集

以下のコマンドを実行し、プロジェクトの「実装・テストの実態値」を取得します。

```bash
# A. 最新の HEAD コミット値の取得
git rev-parse --short HEAD

# B. 現在の Next.js ルート一覧の取得
ls security-docs/src/app/docs/

# C. テストファイル実数の取得 (Bunユニットテスト)
find security-docs/src/ -name "*.test.ts" -o -name "*.test.tsx" 2>/dev/null | sort

# D. テスト実行結果の取得
cd security-docs
bun test
```

### 2. 監査チェックリスト

収集した実態値と、各仕様書の記述に乖離がないか検証します。

- [ ] **`CLAUDE.md` (ルート) 監査**
  - [ ] `security-docs/src/app/docs/` の全配置パスが `CLAUDE.md` の「アーキテクチャ」セクションに正しく記載されているか。
  - [ ] コマンドや起動手順に変更はないか。
  - [ ] 最終更新日のタイムスタンプが最新化されているか。
- [ ] **`GEMINI.md` 監査**
  - [ ] プロジェクト概要や使用テクノロジー、開発規約に変更はないか。
  - [ ] 最終更新日のタイムスタンプが最新化されているか。
- [ ] **`README.md` (ルート) 監査**
  - [ ] 起動手順や Docker コマンド定義に変更はないか。
  - [ ] 最終更新日のタイムスタンプが最新化されているか。
- [ ] **`docs/progress.md` 監査**
  - [ ] `テストケース総数` が `bun test` の実測値と一致しているか。
  - [ ] ファイル別テスト数が現在の実測値と一致しているか。
  - [ ] 最終更新（タイムスタンプ）が更新されているか。
- [ ] **`docs/test-coverage-dashboard.html` 監査**
  - [ ] ヘッダーメタ情報エリア（`Scanned YYYY-MM-DD`）およびフッターの日付（`Updated YYYY-MM-DD`）が更新されているか。
  - [ ] テストケース総数が `bun test` の実測値（現在は 118件）と一致しているか。
- [ ] **`security-docs/CLAUDE.md` 監査**
  - [ ] ローカル起動やデプロイに関する定義、技術スタックに変更はないか。
  - [ ] 最終更新日のタイムスタンプが最新化されているか。
- [ ] **`security-docs/README.md` 監査**
  - [ ] 開発の開始手順やビルドコマンドに変更はないか。
  - [ ] 最終更新日のタイムスタンプが最新化されているか。

---

## 修正とコミット規約

監査の結果、1つでも乖離が検出された場合は**直ちに修正**し、以下の規約に従ってコミットしてください。

### コミットの自動化

自動コミットスクリプトが用意されています。これを使用すると、関連するすべての仕様書・スキルファイルをステージングし、テスト結果から最新のテスト数を抽出して、自動的にコミットメッセージを作成しコミットします。

```bash
# プロジェクトルートで実行
sh scripts/docs-sync-commit.sh
```

### 手動でのコミット（コミットメッセージ規約）

仕様書のみの同期更新のコミットには**ソースコードの変更を一切含めない**でください（TDD コミット分割ルール）。

```bash
git add CLAUDE.md GEMINI.md README.md docs/progress.md docs/test-coverage-dashboard.html security-docs/CLAUDE.md security-docs/README.md .claude/skills/ .gemini/skills/
git commit -m "chore(docs): sync spec files — <具体的な更新理由や同期内容>"
```

---

## 自己監査・強制発火ルール (Enforcement & Gate Conditions)

エージェントは、以下のイベントが発生した際、ユーザーからの指示を待たずに**自律的かつ自動的**に本スキルを読み込み、同期・監査を実行しなければなりません。

### 1. 強制発火のトリガー条件

- **テストの追加・変更時**:
  - テストを修正した直後、直ちに `docs/progress.md` および `test-coverage-dashboard.html` を同期・更新すること。
- **新規規約・トラブルシューティングの発生時**:
  - Netlify CSP nonce 競合問題のような再利用可能な不具合回避策や制約が発生した場合は、速やかに `GEMINI.md` または `CLAUDE.md` に反映すること。
- **セッション開始・再開時**:
  - セッションが開始された場合、最初のコミットを行う前に必ず現行コードと仕様書の乖離（テスト数、ルートなど）を自動検知して修正すること。

### 2. ゲート条件としてのドキュメント同期

- ドキュメント同期および自己監査は、ソースコードのビルド成功と全く同等の **「完了判定ゲート（Gate Condition）」** です。
- 仕様書・進捗管理ドキュメントに実態との不整合（テスト数の記述ミス、未更新の日付、ダッシュボードの更新漏れ）が1点でもある状態でのタスク完了報告は、**プロトコール違反（FAILED）** とみなされます。

> [!NOTE]
> プロジェクトの規約により、`.claude/skills/` および `.gemini/skills/` の配下にある `SKILL.md` ファイルでは、ローカライズされたキーではなく、英語のフロントマターキー `description` を必ず使用する必要があります。
