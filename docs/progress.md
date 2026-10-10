# Security Studies — Progress Tracker

> **最終更新**: 2026-10-10（CCIE Security レビュー対応: 図の接続説明・Mermaid読込再試行・金色テキストのコントラスト・コードフェンス内JSX見出し除外）
> **ブランチ**: `dev` → `main` マージ済み (#34)
> **デプロイ**: Netlify 自動デプロイ（`main` push トリガー）

---

## カテゴリー別ステータス

### 🧪 テスト

| 指標 | 状態 | 詳細 |
|---|---|---|
| テストケース総数 | **182件** | `bun test`: 182 pass / 0 fail（2026-10-10 レビュー対応Green） |
| テストファイル数 | **30ファイル** | 実行ファイル数。ロジック単位は 26/26、ページ移行テストは別集計 |
| Strategy Coverage | **17.5%** | 40カテゴリ×ドメインセル中 7セル相当 |
| CI | ✅ **稼働中** | GitHub Actions（lint / types / test --coverage） |
| カバレッジレポート | ⚠️ **送信停止中** | `bun test --coverage` による lcov 生成は稼働中。Codecov へのアップロードは停止中（下記「カバレッジ CI 連携」参照） |

#### ファイル別テスト数（2026-10-09 実測）

| ファイル | テスト数 | 備考 |
|---|---|---|
| `src/components/docs/Callout.test.tsx` | 4 | 4 pass / 0 fail |
| `src/components/docs/DocsSubheading.test.tsx` | 4 | 4 pass / 0 fail |
| `src/components/docs/SectionCard.test.tsx` | 3 | 3 pass / 0 fail |
| `src/components/docs/AttackFlow.test.tsx` | 2 | 2 pass / 0 fail |
| `src/components/docs/DefenseList.test.tsx` | 2 | 2 pass / 0 fail |
| `src/components/docs/RiskBadge.test.tsx` | 2 | 2 pass / 0 fail |
| `src/components/docs/Terminal.test.tsx` | 2 | 2 pass / 0 fail |
| `src/components/docs/Checklist.test.tsx` | 5 | 5 pass / 0 fail |
| `src/components/docs/CompareGrid.test.tsx` | 4 | 4 pass / 0 fail |
| `src/components/docs/DataTable.test.tsx` | 4 | 4 pass / 0 fail |
| `src/components/docs/HeroSection.test.tsx` | 3 | 3 pass / 0 fail |
| `src/components/docs/HighlightBox.test.tsx` | 7 | 7 pass / 0 fail |
| `src/components/docs/SourceReferences.test.tsx` | 4 | 4 pass / 0 fail |
| `src/components/docs/StepTimeline.test.tsx` | 4 | 4 pass / 0 fail |
| `src/components/docs/Tag.test.tsx` | 7 | 7 pass / 0 fail |
| `src/components/docs/ThreatCard.test.tsx` | 7 | 7 pass / 0 fail |
| `src/components/disclaimer-modal.test.tsx` | 9 | 9 pass / 0 fail |
| `src/components/search-modal.test.tsx` | 18 | 18 pass / 0 fail |
| `src/lib/search.test.ts` | 15 | 15 pass / 0 fail |
| `src/app/api/search/route.test.ts` | 3 | 3 pass / 0 fail |
| `src/app/docs/layout.test.tsx` | 10 | 10 pass / 0 fail |
| `src/proxy.test.ts` | 6 | 6 pass / 0 fail |
| `src/app/docs/ccie-security/foundation.test.tsx` | 13 | 13 pass / 0 fail |
| `src/app/docs/ccie-security/chapters-01-04.test.tsx` | 6 | 6 pass / 0 fail |
| `src/app/docs/ccie-security/chapters-05-07.test.tsx` | 4 | 4 pass / 0 fail |
| `src/app/docs/ccie-security/chapters-08-09.test.tsx` | 2 | 2 pass / 0 fail |
| `src/app/docs/ccie-security/chapters-10-13.test.tsx` | 7 | 7 pass / 0 fail |
| `src/app/docs/ccie-security/integration.test.tsx` | 9 | 9 pass / 0 fail |
| `src/app/docs/ccie-security/hydration.test.tsx` | 2 | 2 pass / 0 fail |
| `src/app/docs/ccie-security/GuideSidebar.test.tsx` | 10 | 10 pass / 0 fail |

---

### 🔐 セキュリティ / CSP

| 項目 | 状態 | 詳細 |
|---|---|---|
| CSP 基本構成 | ✅ **完了** | `proxy.ts` で静的 CSP 付与 |
| nonce 問題（Issue #32） | ✅ **解消** | `'unsafe-inline'` ベースへ移行 |
| Netlify CDP スクリプト | ✅ **解消** | nonce 廃止により衝突なし |
| API セキュリティヘッダー | ❌ **未検証** | `GET /api/search` の CSP 応用未テスト |
| 入力サニタイズ | ❌ **未テスト** | SearchModal XSS 耐性テストなし |
| 依存関係監査 | ✅ **稼働中** | `bun audit --audit-level=high` を独立 job として CI 実行。加えて `bun audit --prod --audit-level=high`（除外指定なし）で本番依存を監査 |
| next RCE（GHSA-vcvr-r3jv-pc5j） | ✅ **解消** | 2026-10-05: `next` / `eslint-config-next` を 16.3.5 → 16.3.8 へ更新 |
| braces DoS（GHSA-vfj7-8cjw-p6xm） | ⚠️ **一時除外** | パッチ未提供（<=3.0.3 全版が対象）。`eslint-config-next` 経由の dev 依存のみで、本番バンドル・ユーザー入力経路に含まれない。CI で `--ignore` 指定、**期限 2026-11-05** までに修正版の有無を再確認 |

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
| Docs ページ (12ページ、Archive含む) | ✅ 稼働中 | — |
| Standalone Docker モード | ✅ 稼働中 | — |
| DocsHeaderNavへのグローバルナビ移設・CCIE元サイドバー復元・全幅本文・table hydration修正 | ✅ 完了 | 2026-10-09 |

---

### 📄 仕様書 / ドキュメント更新

| `CLAUDE.md` | 2026-10-09 | CCIE移行・新カテゴリー・全幅レイアウト・hydration修正・最新実測178テスト（下記「CCIE Security 再開・目視確認」の時系列参照）を同期 |
| `GEMINI.md` | 2026-10-09 | CCIE移行・新カテゴリー・全幅レイアウト・hydration修正・最新実測178テスト（下記「CCIE Security 再開・目視確認」の時系列参照）を同期 |
| `README.md` | 2026-10-09 | CCIE移行・新カテゴリー・全幅レイアウト・hydration修正・最新実測178テスト（下記「CCIE Security 再開・目視確認」の時系列参照）を同期 |
| `security-docs/CLAUDE.md` | 2026-10-09 | CCIE移行・新カテゴリー・全幅レイアウト・hydration修正・最新実測178テスト（下記「CCIE Security 再開・目視確認」の時系列参照）を同期 |
| `security-docs/README.md` | 2026-10-09 | CCIE移行・新カテゴリー・全幅レイアウト・hydration修正・最新実測178テスト（下記「CCIE Security 再開・目視確認」の時系列参照）を同期 |
| `docs/test-coverage-dashboard.html` | 2026-10-09 | CCIE移行・新カテゴリー・全幅レイアウト・hydration修正・最新実測178テスト（下記「CCIE Security 再開・目視確認」の時系列参照）を同期 |
| `docs/progress.md` | 2026-10-09 | CCIE移行・新カテゴリー・全幅レイアウト・hydration修正・最新実測178テスト（下記「CCIE Security 再開・目視確認」の時系列参照）を同期 |
| `security-docs/src/app/docs/approach/page.mdx` | 2026-05-27 | P-08 サプライチェーンセキュリティ＆SCS評価制度内容統合 |
| `.claude/skills/test-dashboard-updater/SKILL.md` | 2026-05-20 | ダッシュボード更新スキル 新規作成 |
| `.claude/skills/docs-sync/SKILL.md` | 2026-05-27 | 他プロジェクトから移植・本プロジェクト向けに調整 |
| `.gemini/skills/docs-sync/SKILL.md` | 2026-05-27 | プロジェクトローカルの .gemini/skills に移行し適用 |
| `.claude/skills/markdown-formatter/SKILL.md` | 2026-05-27 | マークダウンフォーマッタ規約スキルファイル |
| `.gemini/skills/markdown-formatter/SKILL.md` | 2026-05-27 | 新規作成、プロジェクトローカル .gemini/skills に移行し適用 |

---

### 🚀 CI / CD・インフラ

| 項目 | 状態 | 詳細 |
|---|---|---|
| GitHub Actions CI | ✅ **稼働中** | lint / types / test（PR・push トリガー） |
| Netlify 自動デプロイ | ✅ **稼働中** | `main` push でビルド・デプロイ |
| Docker 本番ビルド | ✅ **稼働中** | 3ステージ Dockerfile |
| カバレッジ CI 連携 | ⚠️ **送信停止中** | `bun test --coverage` による lcov.info 生成は稼働中、Codecov へのアップロードは停止中。2026-10-05 時点で Codecov 側に接続不可（TLS ハンドシェイク拒否）。`codecov-action` v7.1.1 + `continue-on-error` で CI は通過させている（CLI の署名・ハッシュ検証を維持するため `use_pypi` は不使用）。CODECOV_TOKEN 未登録 → 次のアクション #11 |
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
| P-08 | **最新セキュリティアプローチ統合（/docs/approach）**<br>準備中の approach ページに、2026年サプライチェーンセキュリティとSCS評価制度のドキュメント内容をもれなく統合し、検索インデックスのチェックテストを追加しました。<br>**タグ**: `Documentation` / `Unit Test` \| **コスト**: 中 \| **効果**: サプライチェーンセキュリティ解説の完成 | 2026-05-27 |
| P-09 | **CCIE Security全13章移行** — `/docs/ccie-security`、Security Certifications新設。50件の移行・描画・目次・hydrationテストと10件のナビ検証、全170件成功（当時。最新実測は178件）。ビルド未実施・ユーザー目視確認待ち。 | 2026-10-09 |

---

### 🔴 HIGH — 即対応

---

### 🟡 MEDIUM — 次スプリント

#### 5. SearchModal A11y テスト追加

18件の Unit テストに加え、Escape 閉じる・フォーカス管理を WCAG 2.1 観点で検証。

#### 11. Codecov 復旧後の対応（2026-10-05 起票）

**経緯**: 2026-10-05、`codecov/codecov-action@v4` が `cli.codecov.io` からの CLI 取得時に `SSL alert number 40`（handshake_failure）で失敗し、`quality` job が落ちた。ローカルの `curl` / `openssl s_client` でも同じ症状が再現し、`ingest.codecov.io` は証明書の期限切れを返していたため、Codecov 側の障害と判断した。Codecov のサイトにも接続できない状態。

**実施済み（`ci.yml`）**: `codecov-action` を v7.1.1（SHA 固定）へ更新、トークンを `token:` 入力で渡すよう変更、`continue-on-error: true` を追加（カバレッジ送信は品質ゲートではないため）。

**Codecov 復旧後に行うこと**:

- [ ] `curl -sS -o /dev/null -w '%{http_code}\n' https://cli.codecov.io/` で TLS 接続の復旧を確認する
- [ ] https://app.codecov.io/gh/myoshi2891/Security_Studies/config/general から Repository upload token を取得し、`gh secret set CODECOV_TOKEN -R myoshi2891/Security_Studies` で登録する（現状シークレット未登録で、`dev` は protected branch のためトークンなしの送信は警告対象）
- [ ] CI を再実行し、Codecov ステップのログでアップロード成功と、Codecov 上でのカバレッジ反映を確認する
- [ ] 代替案の検討: トークン管理を不要にする OIDC（`use_oidc: true` + `permissions: id-token: write`）。ワークフロー権限の拡大を伴うため要判断
- [ ] 完了後、`continue-on-error` を残すか判断し、上記「CI / CD・インフラ」表のステータスを ✅ に戻す

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


## CCIE Security 移行記録

- 2026-10-09: 表示基盤Red・6件の期待どおりの失敗。118 pass / 6 fail、23テストファイル。npm・Next.jsビルド未実行。
- 2026-10-09: 表示基盤Green・124件成功・lintと型検査成功。124 pass / 0 fail、23テストファイル。npm・Next.jsビルド未実行。
- 2026-10-09: 第1〜4章Red・5件の期待どおりの失敗。125 pass / 5 fail、24テストファイル。npm・Next.jsビルド未実行。
- 2026-10-09: 比較基盤補正・130件成功・第1〜4章実装検証中。130 pass / 0 fail、24テストファイル。npm・Next.jsビルド未実行。
- 2026-10-09: 第1〜4章Green・130件成功・lintと型検査成功。130 pass / 0 fail、24テストファイル。npm・Next.jsビルド未実行。
- 2026-10-09: 第5〜7章Red・Python強調を含む4件の期待どおりの失敗。130 pass / 4 fail、25テストファイル。npm・Next.jsビルド未実行。
- 2026-10-09: 第5〜7章Green・134件成功・lintと型検査成功。134 pass / 0 fail、25テストファイル。npm・Next.jsビルド未実行。
- 2026-10-09: 第8〜9章Red・2件の期待どおりの失敗。134 pass / 2 fail、26テストファイル。npm・Next.jsビルド未実行。
- 2026-10-09: 第8〜9章Green・136件成功・lintと型検査成功。136 pass / 0 fail、26テストファイル。npm・Next.jsビルド未実行。
- 2026-10-09: 第10〜13章Red・参考文献とチェックを含む7件の期待どおりの失敗。136 pass / 7 fail、27テストファイル。npm・Next.jsビルド未実行。
- 2026-10-09: 全13章Green・143件成功・lintと型検査成功。143 pass / 0 fail、27テストファイル。npm・Next.jsビルド未実行。
- 2026-10-09: 統合Red・カテゴリーとメタデータとテーマ等8件の期待どおりの失敗。146 pass / 8 fail、28テストファイル。npm・Next.jsビルド未実行。
- 2026-10-09: 統合Green・154件成功・lintと型検査成功・目視確認待ち。154 pass / 0 fail、28テストファイル。npm・Next.jsビルド未実行。
- 2026-10-09: 移行・整理完了・154件成功・lintと型検査成功・目視確認待ち。154 pass / 0 fail、28テストファイル。npm・Next.jsビルド未実行。

### CCIE Security 再開・目視確認

- 実装HEAD: `96cc635`。テスト170 pass / 0 fail、30ファイル（当時。最新は下記時系列の178件）。lint・型検査成功。
- 全13章の自動検証完了。次はユーザーによる目視確認。`docs/migration-inventory/ccie-security-review.md` の章別表と共通チェックを使用する。
- 再開時もnpm・ビルドを実行せず、表示修正が必要なら再現テストを先にコミットする。元HTML・Markdownは保持する。
- 2026-10-09: レイアウト再構成Red・hydration再現を含む15件の失敗。152 pass / 15 fail、30テストファイル。npm・Next.jsビルド未実行。
- 2026-10-09: ヘッダーナビ・左端の元サイドバー・全幅本文・table hydration修正Green。170 pass / 0 fail、30テストファイル。npm・Next.jsビルド未実行。
- 2026-10-09: 検索インデックスのMDX import/export除去（`search.test.ts` +1）。171 pass / 0 fail、30テストファイル。
- 2026-10-09: 見出しベース検索索引（`search.test.ts` +1、`search-modal.test.tsx` +1）。173 pass / 0 fail、30テストファイル。
- 2026-10-09: レビュー対応（Mermaid遅延描画・図説明の縦積み: `foundation.test.tsx` +2、Markdown見出し索引: `search.test.ts` +1）。176 pass / 0 fail、30テストファイル。
- 2026-10-09: Codecov `codecov/patch` 失敗（96.19% < 目標98.57%）対応。既定Mermaidエンジンの初期化・描画（`foundation.test.tsx` +1）とJSON非対応エスケープの見出し（`search.test.ts` +1）をテスト化し、`MermaidFigure.tsx`・`search.ts` の行カバレッジ100%。**178 pass / 0 fail、30テストファイル（最新実測・5,966 expect。CSS比較ヘルパー共通化後）**。
- 件数の推移: 167件は表示レイアウト再構成前の旧同期値、170件はレイアウト修正Green時点、171件・173件はその後の検索改修、176件はレビュー対応（Mermaid遅延描画・図レイアウト・Markdown見出し索引）、178件はCodecovパッチカバレッジ対応による追加。仕様書の基準値は最新実測の178件。
- 2026-10-10: レビュー対応（実装HEAD: `bd664b3`）。フローチャート説明を接続と向き（→ / ↔ / —）で列挙、Mermaid `import` 失敗時にキャッシュを破棄して再試行、`.eyebrow` / `a:hover` / `.hljs-literal` を `--gold-d` に変更、コードフェンス内のJSX見出しを検索索引から除外（`foundation.test.tsx` +3、`search.test.ts` +1）。**182 pass / 0 fail、30テストファイル、5,978 expect**。lint・型検査・`bun run build` 成功。他仕様書の178件表記は未同期（docs-sync で追従予定）。
