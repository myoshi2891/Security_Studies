# Security Studies — Progress Tracker

> **最終更新**: 2026-05-23（P-07 `bun audit` CI 組み込み完了・脆弱性チェック自動化）  
> **ブランチ**: `dev` → `main` マージ済み (#34)  
> **デプロイ**: Netlify 自動デプロイ（`main` push トリガー）

---

## カテゴリー別ステータス

### 🧪 テスト

| 指標 | 状態 | 詳細 |
|---|---|---|
| テストケース総数 | **114件** | `bun test` 全 pass |
| テストファイル数 | **22 / 22 ファイル** | 100% カバー |
| Strategy Coverage | **12.5%** | 40カテゴリ×ドメインセル中 5セル相当 |
| CI | ✅ **稼働中** | GitHub Actions（lint / types / test --coverage） |
| カバレッジレポート | ✅ **稼働中** | `bun test --coverage` + Codecov (lcov) |

#### ファイル別テスト数（2026-05-23 時点）

| ファイル | テスト数 | 備考 |
|---|---|---|
| `src/components/docs/Callout.test.tsx` | 4 | variant・children 検証あり |
| `src/components/docs/DocsSubheading.test.tsx` | 4 | ✅ 2026-05-20 追加 |
| `src/components/docs/SectionCard.test.tsx` | 3 | |
| `src/components/docs/AttackFlow.test.tsx` | 2 | |
| `src/components/docs/DefenseList.test.tsx` | 2 | |
| `src/components/docs/RiskBadge.test.tsx` | 2 | |
| `src/components/docs/Terminal.test.tsx` | 2 | |
| `src/components/docs/Checklist.test.tsx` | 5 | ✅ 2026-05-21 拡張 (prop variation, 空データなど) |
| `src/components/docs/CompareGrid.test.tsx` | 4 | ✅ 2026-05-21 拡張 (ReactNode, classNameなど) |
| `src/components/docs/DataTable.test.tsx` | 4 | ✅ 2026-05-21 拡張 (ReactNode, classNameなど) |
| `src/components/docs/HeroSection.test.tsx` | 3 | ✅ 2026-05-21 拡張 (ReactNode, オプショナル非表示) |
| `src/components/docs/HighlightBox.test.tsx` | 7 | ✅ 2026-05-21 拡張 (各colorバリアント, classNameなど) |
| `src/components/docs/SourceReferences.test.tsx` | 4 | ✅ 2026-05-21 拡張 (description有無, classNameなど) |
| `src/components/docs/StepTimeline.test.tsx` | 4 | ✅ 2026-05-21 拡張 (ReactNode, classNameなど) |
| `src/components/docs/Tag.test.tsx` | 7 | ✅ 2026-05-21 拡張 (各colorバリアント, classNameなど) |
| `src/components/docs/ThreatCard.test.tsx` | 7 | ✅ 2026-05-21 拡張 (各severityバリアント, classNameなど) |
| `src/components/disclaimer-modal.test.tsx` | 9 | 表示/同意/storage/A11y 検証（初期フォーカステスト修正） |
| `src/components/search-modal.test.tsx` | 17 | ✅ 2026-05-20 追加 |
| `src/lib/search.test.ts` | 7 | ✅ 2026-05-20 追加 |
| `src/app/api/search/route.test.ts` | 3 | ✅ 2026-05-21 追加 |
| `src/app/docs/layout.test.tsx` | 8 | ✅ 2026-05-23 追加 |
| `src/proxy.test.ts` | 6 | ✅ 2026-05-23 追加（CSP ディレクティブ固定化） |

---

### 🔐 セキュリティ / CSP

| 項目 | 状態 | 詳細 |
|---|---|---|
| CSP 基本構成 | ✅ **完了** | `proxy.ts` で静的 CSP 付与 |
| nonce 問題（Issue #32） | ✅ **解消** | `'unsafe-inline'` ベースへ移行 |
| Netlify CDP スクリプト | ✅ **解消** | nonce 廃止により衝突なし |
| API セキュリティヘッダー | ❌ **未検証** | `GET /api/search` の CSP 応用未テスト |
| 入力サニタイズ | ❌ **未テスト** | SearchModal XSS 耐性テストなし |
| 依存関係監査 | ✅ **稼働中** | `bun audit --audit-level=high` を独立 job として CI 実行 |

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
| DocsSidebar のクライアントコンポーネント化とアクティブ状態の aria-current 制御 | ✅ 完了 | 2026-05-23 |

---

### 📄 仕様書 / ドキュメント更新

| ファイル | 最終更新 | 内容 |
|---|---|---|
| `CLAUDE.md` (ルート) | 2026-05-20 | CSP 静的構成・Terminal 仕様・ESLint v9 反映 |
| `security-docs/CLAUDE.md` | 2026-05-20 | CI 設定・テスト構成・ESLint v9 詳細追記 |
| `docs/test-coverage-dashboard.html` | 2026-05-23 | P-05 CSP テスト反映（114 cases / 22 files / 100% File Unit Coverage） |
| `docs/csp-fix-report-2026-05-19.md` | 2026-05-19 | Issue #32 対応記録（7フェーズ） |
| `docs/progress.md` (本ファイル) | 2026-05-23 | P-05 CSP ヘッダー検証テスト完了を反映（プロンプトブロック整理） |
| `.claude/skills/test-dashboard-updater/SKILL.md` | 2026-05-20 | ダッシュボード更新スキル 新規作成 |

---

### 🚀 CI / CD・インフラ

| 項目 | 状態 | 詳細 |
|---|---|---|
| GitHub Actions CI | ✅ **稼働中** | lint / types / test（PR・push トリガー） |
| Netlify 自動デプロイ | ✅ **稼働中** | `main` push でビルド・デプロイ |
| Docker 本番ビルド | ✅ **稼働中** | 3ステージ Dockerfile |
| カバレッジ CI 連携 | ✅ **稼働中** | `bun test --coverage` + Codecov (lcov.info) ※CODECOV_TOKEN 要手動追加 |
| `bun audit` CI 組み込み | ✅ **稼働中** | `audit` job として並列実行（`--audit-level=high`、高・重大のみ failure 扱い） |
| E2E テスト CI | ❌ **未設定** | Playwright 未導入 |

---

## 次のアクション

### ✅ 完了済み

| # | タスク | 完了日 |
|---|---|---|
| P-01 | **カバレッジレポート追加（bun test --coverage, bunfig.toml, ci.yml and Codecov integration）**<br>CIが整備されたため、`bun test --coverage` で lcov レポートを生成し、Codecov へアップロードしてPRごとのカバレッジ差分を可視化する構成を導入。<br>**タグ**: `bun --coverage` \| **コスト**: 小 \| **効果**: 行カバレッジの数値化 | 2026-05-20 |
| P-02 | **Search API Contract テスト**<br>`GET /api/search` を提供する `route.ts` ハンドラを実装し、戻り値の型（`SearchResult[]`）やキャッシュヘッダー（`Cache-Control: s-maxage=3600`）を HTTP レベルで検証するテスト `route.test.ts` を追加しました。<br>**タグ**: `API Contract` \| **コスト**: 小 \| **効果**: API 契約の回帰防止 | 2026-05-21 |
| P-03 | **DisclaimerModal A11y テスト**<br>`DisclaimerModal` に Escape キーによるクローズ、フォーカストラップ、ボディスクロールロック制御の機能を実装し、`disclaimer-modal.test.tsx` に WCAG 2.1 AA 準拠のテストを追加しました。<br>**タグ**: `A11y` \| **コスト**: 小 \| **効果**: WCAG 2.1 AA 達成 | 2026-05-21 |
| P-04 | **smoke テストコンポーネントの深化**<br>Checklist, CompareGrid, DataTable など 9 つのコンポーネントに対し、prop variation, ReactNode レンダリング, カラーバリアント, エッジケース等の検証テストを追加・深化させました。<br>**タグ**: `Unit Test` \| **コスト**: 中 \| **効果**: リグレッション検出精度向上 | 2026-05-21 |
| P-05 | **CSP ヘッダー検証テスト**<br>`src/proxy.ts` の CSP ディレクティブ（`script-src` の env 分岐、`frame-ancestors`/`base-uri`/`form-action`/`default-src`）を `src/proxy.test.ts` で固定化。`NODE_ENV` を切り替えながらディレクティブ単位でアサートし、意図しない緩和をリグレッション検出可能に。<br>**タグ**: `CSP` / `Unit Test` \| **コスト**: 小 \| **効果**: XSS 防御後退の即時検知 | 2026-05-23 |
| P-06 | **Integration テスト（docs layout + MDX）**<br>サイドバーコンポーネント `DocsSidebar` の切り出しを行い、アクティブなドキュメントページに `aria-current="page"` を動的に付与し、アクティブ用のCSSクラススタイルを適用。`layout.test.tsx` で全サイドバー要素の描画、セクション見出し、アクティブ状態、モバイル折りたたみのクラス適用を検証するテストを追加しました。<br>**タグ**: `Integration Test` \| **コスト**: 小 \| **効果**: ナビゲーションの動作保証 | 2026-05-23 |
| P-07 | **`bun audit` CI 組み込み**<br>`.github/workflows/ci.yml` に `audit` job を追加し、`bun audit --audit-level=high` を `quality` job と並列に実行。高・重大レベルの脆弱性のみ CI 失敗扱いとし、moderate / low はレポートのみで通過させる方針を YAML コメントで明文化（修正手順・`--ignore` 運用・npm フォールバック含む）。<br>**タグ**: `Security` / `CI` \| **コスト**: 小 \| **効果**: 依存脆弱性の即時検知 | 2026-05-23 |

---

### 🔴 HIGH — 即対応

---

### 🟡 MEDIUM — 次スプリント

#### 5. SearchModal A11y テスト追加

17件の Unit テストに加え、Escape 閉じる・フォーカス管理を WCAG 2.1 観点で検証。

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
