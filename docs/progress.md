# Security Studies — Progress Tracker

> **最終更新**: 2026-05-20（Codecov 連携追加）  
> **ブランチ**: `dev` → `main` マージ済み (#34)  
> **デプロイ**: Netlify 自動デプロイ（`main` push トリガー）

---

## カテゴリー別ステータス

### 🧪 テスト

| 指標 | 状態 | 詳細 |
|---|---|---|
| テストケース総数 | **60件** | `bun test` 全 pass |
| テストファイル数 | **20 / 22 ファイル** | 90.9% カバー |
| Strategy Coverage | **7.5%** | 40カテゴリ×ドメインセル中 3セル相当 |
| CI | ✅ **稼働中** | GitHub Actions（lint / types / test --coverage） |
| カバレッジレポート | ✅ **稼働中** | `bun test --coverage` + Codecov (lcov) |

#### ファイル別テスト数（2026-05-20 時点）

| ファイル | テスト数 | 備考 |
|---|---|---|
| `src/components/docs/Callout.test.tsx` | 4 | variant・children 検証あり |
| `src/components/docs/DocsSubheading.test.tsx` | 4 | ✅ 2026-05-20 追加 |
| `src/components/docs/SectionCard.test.tsx` | 3 | |
| `src/components/docs/AttackFlow.test.tsx` | 2 | |
| `src/components/docs/DefenseList.test.tsx` | 2 | |
| `src/components/docs/RiskBadge.test.tsx` | 2 | |
| `src/components/docs/Terminal.test.tsx` | 2 | |
| `src/components/docs/Checklist.test.tsx` | 1 | smoke のみ |
| `src/components/docs/CompareGrid.test.tsx` | 1 | smoke のみ |
| `src/components/docs/DataTable.test.tsx` | 1 | smoke のみ |
| `src/components/docs/HeroSection.test.tsx` | 1 | smoke のみ |
| `src/components/docs/HighlightBox.test.tsx` | 1 | smoke のみ |
| `src/components/docs/SourceReferences.test.tsx` | 1 | smoke のみ |
| `src/components/docs/StepTimeline.test.tsx` | 1 | smoke のみ |
| `src/components/docs/Tag.test.tsx` | 1 | smoke のみ |
| `src/components/docs/ThreatCard.test.tsx` | 1 | smoke のみ |
| `src/components/disclaimer-modal.test.tsx` | 5 | 表示/同意/storage 検証 |
| `src/components/search-modal.test.tsx` | 17 | ✅ 2026-05-20 追加 |
| `src/lib/search.test.ts` | 7 | ✅ 2026-05-20 追加 |
| `src/app/api/search/route.ts` | 3 | ✅ 2026-05-21 追加 |

---

### 🔐 セキュリティ / CSP

| 項目 | 状態 | 詳細 |
|---|---|---|
| CSP 基本構成 | ✅ **完了** | `proxy.ts` で静的 CSP 付与 |
| nonce 問題（Issue #32） | ✅ **解消** | `'unsafe-inline'` ベースへ移行 |
| Netlify CDP スクリプト | ✅ **解消** | nonce 廃止により衝突なし |
| API セキュリティヘッダー | ❌ **未検証** | `GET /api/search` の CSP 応用未テスト |
| 入力サニタイズ | ❌ **未テスト** | SearchModal XSS 耐性テストなし |
| 依存関係監査 | ❌ **未設定** | `bun audit` CI 組み込みなし |

#### CSP 現行構成（2026-05-20）

```
default-src 'self'
script-src  'self' 'unsafe-inline'              # prod
            'self' 'unsafe-inline' 'unsafe-eval' # dev のみ
style-src   'self' 'unsafe-inline'
img-src     'self' data:
font-src    'self'
connect-src 'self'                               # prod
            'self' ws://localhost:* ws://127.0.0.1:* # dev のみ
frame-ancestors 'none'
base-uri    'self'
form-action 'self'
```

> **トレードオフ**: `'unsafe-inline'` により inline script XSS 防御は後退。
> `default-src 'self'` で第三者ドメインからの script ロードは遮断済み。
> 将来 `@netlify/plugin-nextjs` が CSP nonce API を公開した場合、nonce + `'strict-dynamic'` 理想形への復帰を検討。

---

### 🏗️ 実装 / 機能追加

| 項目 | 状態 | 完了日 |
|---|---|---|
| シンタックスハイライト (`shiki` → `highlight.js`) | ✅ 完了 | 2026-05-19 |
| `Terminal` 同期 Server Component 化 | ✅ 完了 | 2026-05-19 |
| 検索インデックス (`src/lib/search.ts`) | ✅ 稼働中 | — |
| 検索 UI (`SearchModal`) | ✅ 稼働中 | — |
| DisclaimerModal | ✅ 稼働中 | — |
| Docs ページ (10ページ) | ✅ 稼働中 | — |
| Standalone Docker モード | ✅ 稼働中 | — |

---

### 📄 仕様書 / ドキュメント更新

| ファイル | 最終更新 | 内容 |
|---|---|---|
| `CLAUDE.md` (ルート) | 2026-05-20 | CSP 静的構成・Terminal 仕様・ESLint v9 反映 |
| `security-docs/CLAUDE.md` | 2026-05-20 | CI 設定・テスト構成・ESLint v9 詳細追記 |
| `docs/test-coverage-dashboard.html` | 2026-05-20 | Codecov 追加・テスト数・CI 更新 |
| `docs/csp-fix-report-2026-05-19.md` | 2026-05-19 | Issue #32 対応記録（7フェーズ） |
| `docs/progress.md` (本ファイル) | 2026-05-20 | Codecov 完了・P-01 クローズ |
| `.claude/skills/test-dashboard-updater/SKILL.md` | 2026-05-20 | ダッシュボード更新スキル 新規作成 |

---

### 🚀 CI / CD・インフラ

| 項目 | 状態 | 詳細 |
|---|---|---|
| GitHub Actions CI | ✅ **稼働中** | lint / types / test（PR・push トリガー） |
| Netlify 自動デプロイ | ✅ **稼働中** | `main` push でビルド・デプロイ |
| Docker 本番ビルド | ✅ **稼働中** | 3ステージ Dockerfile |
| カバレッジ CI 連携 | ✅ **稼働中** | `bun test --coverage` + Codecov (lcov.info) ※CODECOV_TOKEN 要手動追加 |
| `bun audit` CI 組み込み | ❌ **未設定** | 脆弱性チェック自動化なし |
| E2E テスト CI | ❌ **未設定** | Playwright 未導入 |

---

## 次のアクション

### ✅ 完了済み

| # | タスク | 完了日 |
|---|---|---|
| P-01 | **カバレッジレポート追加（bun test --coverage, bunfig.toml, ci.yml and Codecov integration）**<br>CIが整備されたため、`bun test --coverage` で lcov レポートを生成し、Codecov へアップロードしてPRごとのカバレッジ差分を可視化する構成を導入。<br>**タグ**: `bun --coverage` \| **コスト**: 小 \| **効果**: 行カバレッジの数値化 | 2026-05-20 |
| P-02 | **Search API Contract テスト**<br>`GET /api/search` を提供する `route.ts` ハンドラを実装し、戻り値の型（`SearchResult[]`）やキャッシュヘッダー（`Cache-Control: s-maxage=3600`）を HTTP レベルで検証するテスト `route.test.ts` を追加しました。<br>**タグ**: `API Contract` \| **コスト**: 小 \| **効果**: API 契約の回帰防止 | 2026-05-21 |

---

### 🔴 HIGH — 即対応

---

#### 2. DisclaimerModal A11y テスト

既存 5 テストに WCAG 2.1 AA 準拠検証を追加。

- `@testing-library/user-event` で Escape キー・フォーカストラップを検証
- `role=dialog`・`aria-modal` 属性の存在確認

**コスト**: 小 | **効果**: WCAG 2.1 AA 達成

---

#### 3. smoke テストコンポーネントの深化

9 件のコンポーネント（Checklist, DataTable, CompareGrid 等）が smoke test 1件のみ。`Callout.test.tsx`（4件）を参考に prop variation・エラー状態を追加。

**コスト**: 中 | **効果**: リグレッション検出精度向上

---

### 🟡 MEDIUM — 次スプリント

#### 4. Integration: docs layout + MDX

docs layout と MDX ページの組み合わせ動作テスト（サイドバーナビゲーション・アクティブリンク状態）。

#### 5. SearchModal A11y テスト追加

17件の Unit テストに加え、Escape 閉じる・フォーカス管理を WCAG 2.1 観点で検証。

#### 6. CSP ヘッダー検証テスト

`src/proxy.ts` の CSP ヘッダー構成を Unit テストで保護し、意図しない緩和変更を検出する。

#### 7. `bun audit` CI 組み込み

依存関係の脆弱性チェックを CI に追加。

---

### 🟢 LOW — 中長期

#### 8. E2E テスト（Playwright）

ナビゲーション・検索・DisclaimerModal のフルユーザーシナリオ。Netlify Deploy Preview との連携も可能。

#### 9. Visual / Snapshot 回帰テスト

`Callout`・`AttackFlow`・`RiskBadge` の variant 変更を Playwright スクリーンショット比較で検出。

#### 10. Bundle Size モニタリング

`@next/bundle-analyzer` + `size-limit` を CI に追加。

---

## プロンプト集

各アクションをそのまま Claude に貼り付けて使うプロンプト。

---

### P-01: カバレッジレポート追加

```
security-docs/ ディレクトリで bun test のカバレッジレポートを CI に組み込んでください。

やること:
1. bunfig.toml に [test] coverage = true、coverageReporter = ["lcov", "text"] を追加する
2. .github/workflows/ci.yml の Test ステップを bun test --coverage に変更する
3. Codecov の公式 GitHub Action (codecov/codecov-action@v4) を CI に追加し、
   coverage/lcov.info をアップロードする設定を追加する
4. README.md にカバレッジバッジを追加する（Codecov から取得した URL を使う）

注意:
- bun test --coverage の出力先は coverage/lcov.info
- secrets.CODECOV_TOKEN は GitHub リポジトリ Settings → Secrets に手動追加が必要（私が後で追加する）
- 型・lint エラーがないことを確認してから完了報告してください
```

---

### P-02: Search API Contract テスト

```
security-docs/src/app/api/search/ の API ルートに対する Contract テストを追加してください。

対象ファイル: src/app/api/search/route.ts
テストファイル: src/app/api/search/route.test.ts（新規作成）

検証すべき内容:
1. レスポンスが SearchResult[] 型に準拠していること
   - SearchResult 型: { title: string; href: string; description: string; content: string }
2. 各エントリの href が /docs/<slug> 形式であること
3. content フィールドが最大 500 文字であること
4. Cache-Control: s-maxage=3600 ヘッダーが設定されていること
5. クエリパラメータなし（デフォルト）でも正常にレスポンスを返すこと

テストランナー: bun test（happy-dom 環境、@testing-library/jest-dom 使用済み）
AAAパターン（Arrange-Act-Assert）で書いてください。
最後に bun test src/app/api/search/route.test.ts を実行して全件 pass を確認してください。
```

---

### P-03: DisclaimerModal A11y テスト

```
security-docs/src/components/disclaimer-modal.test.tsx に
WCAG 2.1 AA のアクセシビリティテストを追加してください。

既存テスト: 5件（表示/非表示、consent storage、storage sync）
追加するテスト:
1. role="dialog" および aria-modal="true" 属性が存在すること
2. Escape キーでモーダルが閉じること（@testing-library/user-event の userEvent.keyboard を使用）
3. モーダル表示時に「同意する」ボタンにフォーカスが移ること（autoFocus または focus 呼び出し）
4. モーダルが閉じているとき body のスクロールが復元されること

前提: @testing-library/user-event はすでにインストール済みか確認してから使用すること。
未インストールなら bun add -D @testing-library/user-event を実行してください。
最後に bun test src/components/disclaimer-modal.test.tsx を実行して全件 pass を確認。
```

---

### P-04: smoke テストの深化（Checklist / DataTable / CompareGrid）

```
以下の docs コンポーネントの Unit テストを smoke test 1件から深化させてください。

対象コンポーネント（優先順）:
1. src/components/docs/Checklist.tsx
2. src/components/docs/DataTable.tsx
3. src/components/docs/CompareGrid.tsx

各コンポーネントのテストファイルはすでに存在します（*.test.tsx）。
Callout.test.tsx（4件）のスタイルを参考に、各コンポーネントに以下を追加してください:
- 必須 props の正常系レンダリング
- 主要な prop variation（children, 配列要素数、ヘッダー有無など）
- 空データ・最小データでのエッジケース（可能な場合）

コンポーネントの実装を最初に確認してから、実際の props インターフェースに合わせて
テストを書いてください。最後に bun test を実行して全件 pass を確認。
```

---

### P-05: CSP ヘッダー検証テスト

```
security-docs/src/proxy.ts の CSP ヘッダー構成を Unit テストで保護してください。

テストファイル: src/proxy.test.ts（新規作成）

proxy.ts は Next.js Proxy として動作し、全レスポンスに CSP ヘッダーを付与します。
以下の内容を検証するテストを書いてください:

1. 本番環境（NODE_ENV=production）での script-src が
   "'self' 'unsafe-inline'" を含み 'unsafe-eval' を含まないこと
2. 開発環境（NODE_ENV=development）での script-src が
   "'self' 'unsafe-inline' 'unsafe-eval'" を含むこと
3. frame-ancestors が 'none' であること
4. base-uri が 'self' であること
5. form-action が 'self' であること
6. default-src が 'self' であること

proxy.ts の実装を最初に確認してから、テスト方法（middleware テストの慣習）を
判断して実装してください。bun test src/proxy.test.ts で全件 pass を確認。
```

---

### P-06: Integration テスト（docs layout + MDX）

```
security-docs の docs レイアウトと MDX ページの統合テストを追加してください。

テストファイル: src/app/docs/layout.test.tsx（新規作成）

検証すべき内容:
1. src/config/docs.ts の sidebarNav に定義された全エントリが
   サイドバーに描画されること（リンクテキスト・href の一致）
2. 現在のページ（pathname）に対応するサイドバーリンクが
   アクティブスタイル（aria-current または active クラス）になること
3. モバイルビューポート（375px）でサイドバーが折りたたまれること（もし実装済みなら）

レイアウトとサイドバーの実装（src/app/docs/layout.tsx と関連コンポーネント）を
先に確認してから、テスト可能な範囲で実装してください。
bun test src/app/docs/layout.test.tsx で全件 pass を確認。
```

---

### P-07: `bun audit` CI 組み込み

```
security-docs/ の CI に依存関係の脆弱性チェックを追加してください。

やること:
1. .github/workflows/ci.yml に "Security Audit" ステップを追加する
   - コマンド: bun audit
   - 高・重大レベルの脆弱性がある場合のみ CI を失敗させること
   - bun audit が存在しない場合は npm audit --audit-level=high で代替
2. 脆弱性が見つかった場合の対処方針をコメントに記載する

注意: audit ステップは lint/types/test と独立した job にして、
テストの失敗と脆弱性の失敗が別々に確認できるようにする。
.github/workflows/ci.yml の現状を確認してから実装してください。
```

---

### P-08: E2E テスト導入（Playwright）

```
security-docs/ に Playwright E2E テストを導入し、主要ユーザーシナリオを検証してください。

セットアップ:
1. bun add -D @playwright/test を実行
2. playwright.config.ts を作成（baseURL: http://localhost:3000、ブラウザ: chromium のみ）
3. tests/e2e/ ディレクトリに以下のテストファイルを作成:

テストシナリオ:
- tests/e2e/navigation.spec.ts
  → トップページからサイドバー経由で各 docs ページへ遷移できること
  → ページタイトルが frontmatter の title と一致すること

- tests/e2e/search.spec.ts
  → Cmd+K（Mac）/ Ctrl+K（Windows）でSearchModal が開くこと
  → クエリを入力すると結果が表示されること
  → 結果クリックで対応ページへ遷移すること

- tests/e2e/disclaimer.spec.ts
  → 初回訪問時に DisclaimerModal が表示されること
  → 同意ボタンクリックでモーダルが閉じること
  → 2回目訪問（localStorage に consent 済み）でモーダルが表示されないこと

4. package.json の scripts に "test:e2e": "playwright test" を追加
5. .github/workflows/ci.yml に E2E job を追加（bun run dev でサーバー起動後に実行）

実装前に既存の src/components/search-modal.tsx と disclaimer-modal.tsx の実装を確認し、
実際の動作に合わせてセレクターを決定してください。
```

---

*プロンプトは実行前に必要に応じてリポジトリ名・ブランチ名・パスを確認・調整してください。*
