# Security Studies — Progress Tracker

> **最終更新**: 2026-10-13（CCST: 図中央寄せRed・小図/2400pxの幅広SVGと左端スクロール契約2件失敗）
> **ブランチ**: `dev` → `main` マージ済み (#34)
> **デプロイ**: Netlify 自動デプロイ（`main` push トリガー）

---

## カテゴリー別ステータス

### 🧪 テスト

| 指標 | 状態 | 詳細 |
|---|---|---|
| テストケース総数 | **387件** | `npm test`: 385 pass / 2 fail、58ファイル、25,009 expect（図中央寄せRed・小図/2400pxの幅広SVGと左端スクロール契約2件失敗） |
| テストファイル数 | **58ファイル** | 実行ファイル数。ページ移行テストはロジック単位と別集計 |
| Strategy Coverage | **17.5%** | 40カテゴリ×ドメインセル中 7セル相当 |
| CI | ✅ **稼働中** | GitHub Actions（lint / types / test --coverage） |
| カバレッジレポート | ⚠️ **送信停止中** | `bun test --coverage` による lcov 生成は稼働中。Codecov へのアップロードは停止中（下記「カバレッジ CI 連携」参照） |

#### ファイル別テスト数（2026-10-13 実測）

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
| `src/lib/search.test.ts` | 23 | 23 pass / 0 fail |
| `src/app/api/search/route.test.ts` | 5 | 3 pass / 2 fail |
| `src/app/docs/layout.test.tsx` | 10 | 10 pass / 0 fail |
| `src/proxy.test.ts` | 6 | 6 pass / 0 fail |
| `src/app/docs/ccie-security/foundation.test.tsx` | 16 | 16 pass / 0 fail |
| `src/app/docs/ccie-security/chapters-01-04.test.tsx` | 6 | 6 pass / 0 fail |
| `src/app/docs/ccie-security/chapters-05-07.test.tsx` | 4 | 4 pass / 0 fail |
| `src/app/docs/ccie-security/chapters-08-09.test.tsx` | 2 | 2 pass / 0 fail |
| `src/app/docs/ccie-security/chapters-10-13.test.tsx` | 7 | 7 pass / 0 fail |
| `src/app/docs/ccie-security/integration.test.tsx` | 9 | 9 pass / 0 fail |
| `src/app/docs/ccie-security/hydration.test.tsx` | 3 | 3 pass / 0 fail |
| `src/app/docs/ccie-security/GuideSidebar.test.tsx` | 10 | 10 pass / 0 fail |
| `src/app/docs/secure-by-design/foundation.test.tsx` | 12 | 12 pass / 0 fail |
| `src/app/docs/secure-by-design/sections-00-04.test.tsx` | 6 | 6 pass / 0 fail |
| `src/app/docs/secure-by-design/sections-05-09.test.tsx` | 5 | 5 pass / 0 fail |
| `src/app/docs/secure-by-design/sections-10-16.test.tsx` | 8 | 8 pass / 0 fail |
| `src/app/docs/secure-by-design/integration.test.tsx` | 12 | 12 pass / 0 fail |
| `src/app/docs/secure-by-design/hydration.test.tsx` | 3 | 3 pass / 0 fail |
| `src/app/docs/mitre-atlas/foundation.test.tsx` | 12 | 12 pass / 0 fail |
| `src/app/docs/mitre-atlas/sections-01-04.test.tsx` | 5 | 5 pass / 0 fail |
| `src/app/docs/mitre-atlas/sections-05-08.test.tsx` | 4 | 4 pass / 0 fail |
| `src/app/docs/mitre-atlas/sections-09-13.test.tsx` | 7 | 7 pass / 0 fail |
| `src/app/docs/mitre-atlas/integration.test.tsx` | 11 | 11 pass / 0 fail |
| `src/app/docs/mitre-atlas/hydration.test.tsx` | 3 | 3 pass / 0 fail |
| `src/app/docs/secure-by-design/sidebar-a11y.test.tsx` | 2 | 2 pass / 0 fail |
| `src/app/docs/mitre-atlas/sidebar-a11y.test.tsx` | 1 | 1 pass / 0 fail |
| `src/app/docs/ccie-security/archive.test.ts` | 5 | 5 pass / 0 fail |
| `src/app/docs/ccie-security/table-cascade.test.tsx` | 5 | 5 pass / 0 fail |

| `src/app/docs/ccst-cybersecurity/foundation.test.tsx` | 7 | 7 pass / 0 fail |

| `src/app/docs/ccst-cybersecurity/sections-00-03.test.tsx` | 4 | 4 pass / 0 fail |

| `src/app/docs/ccst-cybersecurity/MermaidFigure.test.tsx` | 6 | 6 pass / 0 fail |

| `src/app/docs/ccst-cybersecurity/chapters-01-02.test.tsx` | 11 | 11 pass / 0 fail |

| `src/app/docs/ccst-cybersecurity/chapter-03.test.tsx` | 7 | 7 pass / 0 fail |

| `src/app/docs/ccst-cybersecurity/chapters-04-05.test.tsx` | 10 | 10 pass / 0 fail |

| `src/app/docs/ccst-cybersecurity/chapter-06-references.test.tsx` | 17 | 17 pass / 0 fail |

| `src/app/docs/ccst-cybersecurity/hydration.test.tsx` | 3 | 3 pass / 0 fail |

| `src/app/docs/ccst-cybersecurity/integration.test.tsx` | 8 | 8 pass / 0 fail |

| `src/app/docs/ccst-cybersecurity/style-cascade.test.tsx` | 14 | 12 pass / 2 fail |

| `src/app/docs/ccst-cybersecurity/GuideSidebar.test.tsx` | 4 | 4 pass / 0 fail |

| `src/app/docs/ccst-cybersecurity/archive.test.ts` | 5 | 5 pass / 0 fail |

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
| Docs ページ (14ページ、Archive含む) | ✅ 稼働中 | — |
| Standalone Docker モード | ✅ 稼働中 | — |
| MITRE ATLAS全13節・11表・4図・6手順カード・29参考文献移行 | ✅ 自動検証完了・目視確認待ち | 2026-10-12 |
| Secure by Design全17節・35表・15図・8 Java例・32参考文献移行 | ✅ 自動検証完了・目視確認待ち | 2026-10-12 |
| DocsHeaderNavへのグローバルナビ移設・CCIE元サイドバー復元・全幅本文・table hydration修正 | ✅ 完了 | 2026-10-09 |

---

### 📄 仕様書 / ドキュメント更新

| `CLAUDE.md` | 2026-10-13 | CCST移行・原本アーカイブ・全385件/58ファイル/25,003 expect・目視待ちを同期 |
| `GEMINI.md` | 2026-10-13 | CCST移行・原本アーカイブ・全385件/58ファイル/25,003 expect・目視待ちを同期 |
| `README.md` | 2026-10-13 | CCST移行・原本アーカイブ・全385件/58ファイル/25,003 expect・目視待ちを同期 |
| `security-docs/CLAUDE.md` | 2026-10-13 | CCST移行・原本アーカイブ・全385件/58ファイル/25,003 expect・目視待ちを同期 |
| `security-docs/README.md` | 2026-10-13 | CCST移行・原本アーカイブ・全385件/58ファイル/25,003 expect・目視待ちを同期 |
| `docs/test-coverage-dashboard.html` | 2026-10-13 | CCST移行・原本アーカイブ・全385件/58ファイル/25,003 expect・目視待ちを同期 |
| `docs/progress.md` | 2026-10-13 | CCST移行・原本アーカイブ・全385件/58ファイル/25,003 expect・目視待ちを同期 |
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
| P-12 | **CCST Cybersecurity全46節移行** — `/docs/ccst-cybersecurity`、94件の移行/表示テスト追加。163表・50図・73リスト/344項目・25問・60参考文献保持。全385件とlint/型検査成功、原本アーカイブ済み、ビルド未実行・目視待ち。 | 2026-10-13 |
| P-11 | **MITRE ATLAS全13節移行** — `/docs/mitre-atlas`、42移行・表示テストと4検索テスト追加。全277件・lint・型検査成功。原本アーカイブ済み、ビルド未実行・ユーザー目視待ち。 | 2026-10-12 |
| P-10 | **Secure by Design全17節移行** — `/docs/secure-by-design`。45件の移行・表示テスト、全231件成功。lint・型検査成功、ビルド未実行・目視確認待ち。 | 2026-10-12 |
| P-09 | **CCIE Security全13章移行** — `/docs/ccie-security`、Security Certifications新設。50件の移行・描画・目次・hydrationテストと10件のナビ検証、全170件成功（当時。最新実測は186件）。ビルド未実施・ユーザー目視確認待ち。 | 2026-10-09 |

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

- 実装HEAD: `96cc635`。テスト170 pass / 0 fail、30ファイル（当時。最新は下記時系列の186件）。lint・型検査成功。
- 全13章の自動検証完了。次はユーザーによる目視確認。`docs/migration-inventory/ccie-security-review.md` の章別表と共通チェックを使用する。
- 再開時はnpmを使用し、ビルドは禁止。表示修正は再現テストを先にコミットする。元HTML・Markdownはarchiveに保持する。
- 2026-10-09: レイアウト再構成Red・hydration再現を含む15件の失敗。152 pass / 15 fail、30テストファイル。npm・Next.jsビルド未実行。
- 2026-10-09: ヘッダーナビ・左端の元サイドバー・全幅本文・table hydration修正Green。170 pass / 0 fail、30テストファイル。npm・Next.jsビルド未実行。
- 2026-10-09: 検索インデックスのMDX import/export除去（`search.test.ts` +1）。171 pass / 0 fail、30テストファイル。
- 2026-10-09: 見出しベース検索索引（`search.test.ts` +1、`search-modal.test.tsx` +1）。173 pass / 0 fail、30テストファイル。
- 2026-10-09: レビュー対応（Mermaid遅延描画・図説明の縦積み: `foundation.test.tsx` +2、Markdown見出し索引: `search.test.ts` +1）。176 pass / 0 fail、30テストファイル。
- 2026-10-09: Codecov `codecov/patch` 失敗（96.19% < 目標98.57%）対応。既定Mermaidエンジンの初期化・描画（`foundation.test.tsx` +1）とJSON非対応エスケープの見出し（`search.test.ts` +1）をテスト化し、`MermaidFigure.tsx`・`search.ts` の行カバレッジ100%。**178 pass / 0 fail、30テストファイル（当時の最新実測・5,966 expect。CSS比較ヘルパー共通化後）**。
- 件数の推移: 167件は表示レイアウト再構成前の旧同期値、170件はレイアウト修正Green時点、171件・173件はその後の検索改修、176件はレビュー対応（Mermaid遅延描画・図レイアウト・Markdown見出し索引）、178件はCodecovパッチカバレッジ対応による追加。185件は2026-10-10のレビュー対応（コードフェンス索引）による追加。186件は hydrateRoot の recoverable error 検証による追加。CCIE移行時点の基準値は186件。現在の実測値は冒頭のテスト表を参照。
- 2026-10-10: レビュー対応（実装HEAD: `bd664b3`）。フローチャート説明を接続と向き（→ / ↔ / —）で列挙、Mermaid `import` 失敗時にキャッシュを破棄して再試行、`.eyebrow` / `a:hover` / `.hljs-literal` を `--gold-d` に変更、コードフェンス内のJSX見出しを検索索引から除外（`foundation.test.tsx` +3、`search.test.ts` +1）。**182 pass / 0 fail、30テストファイル、5,978 expect**。lint・型検査・`bun run build` 成功。CLAUDE.md・GEMINI.md・README.md・security-docs/{CLAUDE,README}.md・ダッシュボード・移行確認表も182件・ビルド成功へ同期済み（`8b27aae`）。続けてガイド修正（Trivy影響範囲、ephemeralContainersのSecret検査、型の取り違え検出範囲、TM-012の期限付き受容）を `7f5d793` で反映。
- 2026-10-10: レビュー対応（Red: `c2378eb` / Green: `2e17306`）。検索索引に素のテキストのJSX見出し（`<h3>3. VEX…</h3>`）と、見出しを描画するdocsコンポーネント（`HeroSection` / `SectionCard` / `ThreatCard` の `title`、`DocsSubheading` の子テキスト）を追加し、`public/search-index.json` を再生成。Mermaid SVG の `max-width: 100%` を外し、幅の広い図は自然な px 幅のまま横スクロールで読めるようにした（`search.test.ts` +2、`foundation.test.tsx` は既存テストのアサーション変更）。**184 pass / 0 fail、30テストファイル、6,301 expect**（索引テストが見出しごとに検証するため expect が増加）。lint・型検査・`bun run build` 成功。ガイド修正（v1.37 ストレージ機能のAlphaとフィーチャーゲート、シークレット管理基盤の優先、OIDCシーケンスへのPKCEとnonce照合の追加）を `2bff45d` で反映。
- 2026-10-10: レビュー対応。検索索引のコードフェンスを開きフェンスの文字と長さで管理し、同じ文字・同じ長さ以上・info string なしのフェンスでのみ閉じるよう修正（```` ````md ```` 内の ```` ``` ```` で外側ブロックが終了しない。`search.test.ts` +1）。`Hacking-kubernetes-guide.md` の PSA `audit` モードを「監査イベントへの注釈付与」と明記し、監査ログ記録には kube-apiserver の監査機能設定が必要である旨を追記。目視確認ステータスを全仕様書で「pending」に統一。**185 pass / 0 fail、30テストファイル、6,302 expect**。lint・型検査・`bun run build` 成功（185件時点で再実行し確認）。
- 2026-10-11: レビュー対応（Red: `a814df4` / Green: `ba26742`）。`MermaidFigure` の描画完了・失敗処理で `active` を先に確認し、定義変更やアンマウント後に完了した古い描画では `sizeSvg` と `console.error` を実行しないよう修正（`foundation.test.tsx` の既存 stale テストにアサーション追加、件数増減なし）。**186 pass / 0 fail、30テストファイル、6,304 expect**。lint・型検査成功。

## Secure by Design 移行（2026-10-12）

原本は `archive/html/Secure-by-design-guide.html` と `archive/md/Secure-by-design-guide.md` に内容変更なしで保存。npm経由でBunを実行。ビルド禁止。目視確認はユーザー担当。

### 実行履歴
- 2026-10-12: 棚卸し完了・表示基盤着手前（直前HEAD `0be26b2`）。186 pass / 0 fail、30ファイル、6,304 expect。ビルド未実行。
- 2026-10-12: 表示基盤Red・9件の期待どおりの失敗（直前HEAD `0be26b2`）。186 pass / 9 fail、31ファイル、6,304 expect。ビルド未実行。
- 2026-10-12: 表示基盤Redコミット済み・実装開始前（直前HEAD `a69e3ee`）。186 pass / 9 fail、31ファイル、6,304 expect。ビルド未実行。
- 2026-10-12: 表示基盤Green・本文は未移行・lintと型検査成功（直前HEAD `741bcd6`）。195 pass / 0 fail、31ファイル、6,593 expect。ビルド未実行。
- 2026-10-12: ヒーロー・0〜4節Red・6件の期待どおりの失敗（直前HEAD `a5598dd`）。195 pass / 6 fail、32ファイル、6,593 expect。ビルド未実行。
- 2026-10-12: ヒーロー・0〜4節Green・5〜16節は未移行（直前HEAD `c609180`）。201 pass / 0 fail、32ファイル、6,685 expect。ビルド未実行。
- 2026-10-12: 5〜9節Red・5件の期待どおりの失敗（直前HEAD `3363ae3`）。201 pass / 5 fail、33ファイル、6,690 expect。ビルド未実行。
- 2026-10-12: 5〜9節Green・10〜16節は未移行（直前HEAD `3d46938`）。206 pass / 0 fail、33ファイル、6,766 expect。ビルド未実行。
- 2026-10-12: 10〜16節・フッターRed・8件の期待どおりの失敗（直前HEAD `7f2a7bb`）。206 pass / 8 fail、34ファイル、6,774 expect。ビルド未実行。
- 2026-10-12: 全17節・フッターGreen・ナビ登録と統合検証は未完了（直前HEAD `1093285`）。214 pass / 0 fail、34ファイル、6,877 expect。ビルド未実行。
- 2026-10-12: 統合Red・目次・ナビ登録・検索で4件失敗・35表hydrationと15図構文は成功（直前HEAD `09b4622`）。224 pass / 4 fail、36ファイル、8,660 expect。ビルド未実行。
- 2026-10-12: 統合Green検証・既存ナビ契約13件へ同期・実装は未コミット（直前HEAD `23708f9`）。228 pass / 0 fail、36ファイル、8,841 expect。ビルド未実行。
- 2026-10-12: 統合Greenコミット済み・全228件成功・最終監査へ（直前HEAD `e7da4dc`）。228 pass / 0 fail、36ファイル、8,841 expect。ビルド未実行。
- 2026-10-12: 最終監査Red・文書スクロール契約1件失敗・モバイルフォーカスと解除は成功（直前HEAD `d619294`）。229 pass / 1 fail、36ファイル、8,848 expect。ビルド未実行。
- 2026-10-12: 最終監査Green・230件成功・lintと型検査成功（直前HEAD `a2c908e`）。230 pass / 0 fail、36ファイル、8,850 expect。ビルド未実行。

### 最終状態・再開手順

- 実装HEAD: `0ee9b6d`（原本アーカイブ、本文全幅 `12c926d`、スクロール補正 `a2c908e`、本文統合 `e7da4dc`、表示基盤 `741bcd6`）。全231件成功・0失敗、36ファイル、9,070 expect。lint・型検査成功。
- ヒーロー・0〜16節・フッターの自動比較完了。既存ナビは13リンク、静的検索アセットも13ページ。ロジック単位29/29、戦略セル7/40=17.5%（増減なし）。
- 各段階でtest→実装→docsを分離してコミット済み。Red段階の失敗は上の時系列参照。最終整理では追加のリファクタリングは不要。
- 未実施: Next.jsビルド（禁止）、ブラウザ目視（ユーザー担当）、push・公開。
- 次のアクション: ユーザーが `docs/migration-inventory/secure-by-design-review.md` に沿って目視確認する。
- 再開プロンプト: 「Secure by Designのユーザー目視結果を確認し、指摘がある場合はnpm・ビルド禁止を維持して失敗テスト→testコミット→修正→Greenコミット→仕様書同期を実施する。元HTML・Markdownは保存する。」
- 2026-10-12: 本文全幅Red・共通proseの800px制限を再現（直前HEAD `572f97e`）。230 pass / 1 fail、36ファイル、8,852 expect。ビルド未実行。
- 2026-10-12: 本文全幅Green・全17節を1440px/900px/375pxで計算済みCSS検証・lintと型検査成功（直前HEAD `12c926d`）。231 pass / 0 fail、36ファイル、9,070 expect。ビルド未実行。

本文全幅補正: 元の本文には変更なし。共通 `.prose` の800px制限と左右auto余白を解除し、17節をデスクトップ・タブレット・スマートフォンで全幅にする計算済みCSSテストを追加（Red `572f97e` / Green `12c926d`）。
- 2026-10-12: 元HTML・MDをarchiveへ移動・原本バイト一致・全231件とlint/型検査成功（直前HEAD `0ee9b6d`）。231 pass / 0 fail、36ファイル、9,070 expect。ビルド未実行。

原本保存先: `archive/html/Secure-by-design-guide.html` / `archive/md/Secure-by-design-guide.md`。Next.js本文・検索アセットは変更なし。今後の移行比較はarchiveのHTMLを正本として実行する。配置換えのためTDD規約のリファクタリング手順を適用し、移動前後に既存全テストを実行した。

## MITRE ATLAS 移行（2026-10-12）

ルート `/docs/mitre-atlas`。元HTML正本。npm経由Bun・ビルド禁止・目視はユーザー担当。既存の未コミット原稿2件は作業対象外。

### 実行履歴
- 2026-10-12: 棚卸し完了・表示基盤着手前（直前HEAD `ca2fff9`）。231 pass / 0 fail、36ファイル、9,070 expect。ビルド未実行。
- 2026-10-12: 表示基盤Red・8件の期待どおりの失敗（直前HEAD `c2dfcea`）。231 pass / 8 fail、37ファイル、9,070 expect。ビルド未実行。
- 2026-10-12: 表示基盤Green・本文は未移行・lintと型検査成功（直前HEAD `cb740cb`）。239 pass / 0 fail、37ファイル、9,287 expect。ビルド未実行。
- 2026-10-12: ヒーロー・1〜4節Red・5件の期待どおりの失敗（直前HEAD `cb740cb`）。239 pass / 5 fail、38ファイル、9,287 expect。ビルド未実行。
- 2026-10-12: 表示基盤Green・本文は未移行・lintと型検査成功（直前HEAD `ee8b6ac`）。239 pass / 0 fail、37ファイル、9,287 expect。ビルド未実行。
- 2026-10-12: ヒーロー・1〜4節Red・5件の期待どおりの失敗（直前HEAD `8e1d3e2`）。239 pass / 5 fail、38ファイル、9,287 expect。ビルド未実行。
- 2026-10-12: 本文前半比較基盤補正・1〜4節は4件失敗（当時のGreen表記を訂正）・本文は未コミット（直前HEAD `57d71a7`）。240 pass / 4 fail、38ファイル、9,359 expect。ビルド未実行。
- 2026-10-12: ヒーロー・1〜4節は4件失敗（Green表記を訂正）・5〜13節は未移行（直前HEAD `9c42449`）。240 pass / 4 fail、38ファイル、9,359 expect。ビルド未実行。

復旧承認（2026-10-12）: ユーザーの「対応して」により履歴を残して復旧。`9c42449` は4件失敗中に作成され、`dddf9c4` のGreen記録は誤り。失敗原因はSVGライブラリの追加クラスを原本クラス全体と比較したこと。元のti装飾クラスは保持し、追加lucideクラスのみ許容する比較へ訂正する。
- 2026-10-12: 復旧開始・本文前半4件失敗の状態へ記録訂正（直前HEAD `0170b4c`）。240 pass / 4 fail、38ファイル、9,359 expect。ビルド未実行。
- 2026-10-12: 承認済み復旧完了・ヒーローと1〜4節Green・lintと型検査成功（直前HEAD `4603722`）。244 pass / 0 fail、38ファイル、9,361 expect。ビルド未実行。
- 2026-10-12: 5〜8節Red・4件の期待どおりの失敗（直前HEAD `5e98624`）。244 pass / 4 fail、39ファイル、9,365 expect。ビルド未実行。
- 2026-10-12: 5〜8節Green・9〜13節は未移行（直前HEAD `78439d5`）。248 pass / 0 fail、39ファイル、9,435 expect。ビルド未実行。
- 2026-10-12: 9〜13節・手順カード・参考文献Red・7件の期待どおりの失敗（直前HEAD `76e6ebd`）。248 pass / 7 fail、40ファイル、9,442 expect。ビルド未実行。
- 2026-10-12: 全13節・手順・参考文献・フッターGreen・検索と統合は未完了（直前HEAD `d738d40`）。255 pass / 0 fail、40ファイル、9,529 expect。ビルド未実行。
- 2026-10-12: 統合Red・検索/ナビ/索引8件失敗・11表hydrationと4図構文は成功（直前HEAD `37f1d7a`）。266 pass / 8 fail、42ファイル、10,510 expect。ビルド未実行。
- 2026-10-12: 統合Green・全274件成功・14ページと全34見出しを静的検索へ反映・lint/型検査成功（直前HEAD `0553651`）。274 pass / 0 fail、42ファイル、10,569 expect。ビルド未実行。
- 2026-10-12: 原本アーカイブ完了・バイト一致・全274件成功・目視確認待ち（直前HEAD `aa90484`）。274 pass / 0 fail、42ファイル、10,569 expect。ビルド未実行。
- 2026-10-12: 原本アーカイブ完了・バイト一致・全274件成功・目視確認待ち（直前HEAD `201ae15`）。274 pass / 0 fail、42ファイル、10,569 expect。ビルド未実行。
- 2026-10-12: 原本保存完了・全274件成功・最終CSS監査でリスト余白を追加確認中（直前HEAD `201ae15`）。274 pass / 0 fail、42ファイル、10,569 expect。ビルド未実行。
- 2026-10-12: 最終CSS監査Red・共通リスト余白混入の1件失敗（直前HEAD `5fefecf`）。273 pass / 1 fail、42ファイル、10,546 expect。ビルド未実行。
- 2026-10-12: 最終CSS監査Green・全274件成功・元CSS実効値308項目照合・lint/型検査成功（直前HEAD `f7feeb0`）。274 pass / 0 fail、42ファイル、10,581 expect。ビルド未実行。

### 最終状態・目視確認の再開

- 実装HEAD: `f7feeb0`（リスト項目余白）。統合実装 `0553651`、原本アーカイブ `201ae15`。全274件成功・0失敗、42ファイル、10,581 expect。lint・型検査成功。
- HTML/MD原本は `archive/html/Mitre-atlas.html` / `archive/md/Mitre-atlas.md`。SHA-256一致、本文・情報基準日変更なし。新規6テストファイルに39件、既存searchテストに4件追加。
- ナビ14ページ、ATLAS検索見出し34件、ロジック単位32/32。戦略セル7/40=17.5%は増減なし。
- 元CSS実効値の追加監査は14セレクタ×11プロパティ×2画面サイズの308項目。DOM実装が省略するブラウザ既定値（リストの点・番号・40px字下げ・1em余白・0px項目余白）を明示して照合した。実ブラウザの描画はユーザー目視待ち。
- TDD復旧: 早すぎた `9c42449` と誤った `dddf9c4` の記録は、ユーザー承認により履歴を残して訂正（`0170b4c` / `c57579d`）。`4603722` で元アイコンのti装飾用クラスを厳密に保持する比較へ訂正し、`2d54f7f` で244件成功を記録。それ以降のRed→実装→docsは分離済み。
- 次のアクション: ユーザーが `docs/migration-inventory/mitre-atlas-review.md` に沿って目視確認する。ビルドは禁止、push・公開は未実施。
- 再開プロンプト: 「MITRE ATLASの目視結果を確認し、指摘があればnpm・ビルド禁止を維持して失敗テスト→testコミット→修正→成功確認→実装コミット→仕様書同期を実施する。原本はarchiveのHTML/MDを保持し、関係しない未コミット原稿を変更しない。」
- 2026-10-12: 図の可読性Red・18px/コントラスト/縮小防止の6件失敗（直前HEAD `9037a98`）。271 pass / 6 fail、42ファイル、10,564 expect。ビルド未実行。
- 2026-10-12: 図の可読性Green・全277件成功・18px/コントラスト7以上/縮小防止・lint/型検査成功（直前HEAD `a9a21d7`）。277 pass / 0 fail、42ファイル、10,627 expect。ビルド未実行。

### 図の可読性改善（2026-10-12）

- ラベル18px・日本語向けフォント・明るい文字色、ノード／サブグラフ／接続ラベルでコントラスト比7以上を検証。
- viewBoxの自然幅を維持し、横長の図を縮小せず図だけ横スクロール。1800px幅SVGの縮小防止・ラベル／説明の保持・キーボード操作を検証。キャプション・説明文は14px。
- 全277件成功・0失敗、42ファイル、10,627 expect。ATLASは42件、searchは23件。lint・型検査成功。ビルド未実行・目視確認はユーザー担当。
- 元図定義・本文・原本ハッシュは不変。元テーマとの差分はユーザー依頼による文字・線のコントラスト／文字サイズ・図サイズ・キャプションの改善。

## CCIE Security 移行（2026-10-12）

ルート `/docs/ccie-security`。元HTML正本。npm経由Bun・ビルド禁止・目視はユーザー担当。既存の未コミット原稿2件は作業対象外。

### 実行履歴
- 2026-10-12: 表のCSSカスケードRed・ホバー背景と上下余白の3件失敗（直前HEAD `db686d8`）。277 pass / 3 fail、43ファイル、10,633 expect。ビルド未実行。
- 2026-10-12: 表の比較テスト補正・全280件成功・実ブラウザ85表確認済み・実装は未コミット（直前HEAD `bfa7fd9`）。280 pass / 0 fail、43ファイル、12,169 expect。ビルド未実行。
- 2026-10-12: 表のCSSカスケードGreen・全280件成功・実画面85表の白背景/上下0px確認・lint/型検査成功（直前HEAD `6a6d1d4`）。280 pass / 0 fail、43ファイル、12,169 expect。ビルド未実行。
- 2026-10-12: コード背景Red・280成功2失敗・実装前（直前HEAD `1d2a72e`）。280 pass / 2 fail、43ファイル、12,173 expect。ビルド未実行。
- 2026-10-12: コード背景Green・全282件成功・lint/型検査成功・実ブラウザー34コード/85表検証済み（直前HEAD `6203e86`）。282 pass / 0 fail、43ファイル、12,582 expect。ビルド未実行。

- 2026-10-13: CCIE Security 事前監査・既存移行の全テスト成功、原本アーカイブは次ステップ。286 pass / 0 fail、45ファイル、12,603 expect。ビルド未実行。

- 2026-10-13: CCIE Security アーカイブRed・原本移動前の契約5件が期待どおり失敗。286 pass / 5 fail、46ファイル、12,608 expect。ビルド未実行。

- 2026-10-13: CCIE Security 原本HTML・MDのアーカイブ完了・バイト一致・全テストとlint/型検査成功。291 pass / 0 fail、46ファイル、12,618 expect。ビルド未実行。

### CCIE Security 原本アーカイブ完了（2026-10-13）

既存Next.js移行を再検証し、未対応だった原本保存を完了。公開ルート `/docs/ccie-security` は変更なし。
原本: `archive/html/Ccie-security-guide.html` / `archive/md/Ccie-security-guide.md`。HTML・MD双方のSHA-256が移動前後で一致。
事前仕様書補正 `547774b` → Red `d4f11e6`（286成功・5失敗）→ Red記録 `f76e3ef` → Green `7782eb1`（291成功・0失敗）。
46テストファイル・12,618 expect、npm run lint / types:check成功。ビルド・今回の目視確認・push・公開は未実施。
全13章・85表・61図・34コード・49リスト/196項目・7チェック・59参考文献とマーカーCSSをアーカイブ原本と継続比較。
再開時はユーザーの目視指摘を再現する失敗テストから対応する。

- 2026-10-13: CCST 事前棚卸し完了・本文未移行。291 pass / 0 fail、46ファイル、12,618 expect。ビルド未実行。

- 2026-10-13: CCST 表示基盤Red・未実装による7件の失敗を確認。291 pass / 7 fail、47ファイル、12,618 expect。ビルド未実行。

- 2026-10-13: CCST 表示基盤Green・298件成功・lint/型検査成功・本文は次ステップ。298 pass / 0 fail、47ファイル、12,834 expect。ビルド未実行。

- 2026-10-13: CCST 導入・図Red・追加10件のみ期待どおり失敗（実行上限30秒）。298 pass / 10 fail、49ファイル、12,842 expect。ビルド未実行。

- 2026-10-13: CCST 導入Green・308件成功・50図パーサー検証・lint/型検査成功。308 pass / 0 fail、49ファイル、13,076 expect。ビルド未実行。

- 2026-10-13: CCST 第1〜2章Red・対象11節が未移行として失敗。308 pass / 11 fail、50ファイル、13,096 expect。ビルド未実行。

- 2026-10-13: CCST 第1〜2章Green・319件成功・lint/型検査成功。319 pass / 0 fail、50ファイル、13,418 expect。ビルド未実行。

- 2026-10-13: CCST 第3章Red・対象7節が未移行として失敗。319 pass / 7 fail、51ファイル、13,432 expect。ビルド未実行。

- 2026-10-13: CCST 第3章Green・326件成功・lint/型検査成功。326 pass / 0 fail、51ファイル、13,618 expect。ビルド未実行。

- 2026-10-13: CCST 第4〜5章Red・対象10節が未移行として失敗。326 pass / 10 fail、52ファイル、13,638 expect。ビルド未実行。

- 2026-10-13: CCST 第4〜5章Green・336件成功・lint/型検査成功。336 pass / 0 fail、52ファイル、13,944 expect。ビルド未実行。

- 2026-10-13: CCST 第6章・参考文献Red・対象14節と25問/25チェック/60参考文献の17件失敗。336 pass / 17 fail、53ファイル、13,975 expect。ビルド未実行。

- 2026-10-13: CCST 全46節Green・353件成功・lint/型検査成功・統合監査は次ステップ。353 pass / 0 fail、53ファイル、14,301 expect。ビルド未実行。

- 2026-10-13: CCST 統合Red・ナビ登録と静的検索の4件失敗・全量比較と163表hydration成功。360 pass / 4 fail、55ファイル、19,434 expect。ビルド未実行。

- 2026-10-13: CCST 統合追加Red・既存ATLAS契約も15件へ同期・登録前の6件失敗。358 pass / 6 fail、55ファイル、19,433 expect。ビルド未実行。

- 2026-10-13: CCST 統合Green・364件成功・15リンク/検索227見出し/163表hydration・lint/型検査成功。364 pass / 0 fail、55ファイル、19,443 expect。ビルド未実行。

- 2026-10-13: CCST CSS監査Red・フォント/見出し/番号項目余白/狭幅カードの5件失敗・163表と3コードの色は成功。374 pass / 5 fail、57ファイル、23,060 expect。ビルド未実行。

- 2026-10-13: CCST CSS監査Red補正・happy-dom normalキーワード欠落を最小再現・元CSSで5件失敗。374 pass / 5 fail、57ファイル、23,060 expect。ビルド未実行。

- 2026-10-13: CCST CSS監査Green・379件成功・全163表/3コード/丸点/番号・3画面幅と両テーマ・lint/型検査成功。379 pass / 0 fail、57ファイル、24,987 expect。ビルド未実行。

- 2026-10-13: CCST 原本アーカイブRed・移動前の保存先/ハッシュ/旧パス/台帳/比較参照5件失敗。379 pass / 5 fail、58ファイル、24,992 expect。ビルド未実行。

- 2026-10-13: CCST 原本アーカイブGreen・両SHA-256一致・384件成功・lint/型検査成功。384 pass / 0 fail、58ファイル、25,000 expect。ビルド未実行。

- 2026-10-13: CCST 最終監査Red・元のアンカースクロールを実viewportへ適用する契約1件失敗。384 pass / 1 fail、58ファイル、25,001 expect。ビルド未実行。

- 2026-10-13: CCST 移行完了・全385件/58ファイル/25,003expect・lint/型検査成功・原本アーカイブ済み・目視待ち。385 pass / 0 fail、58ファイル、25,003 expect。ビルド未実行。

## CCST Cybersecurity 最終状態（2026-10-13）

- ルート `/docs/ccst-cybersecurity`、Security CertificationsのCCIE直後に登録。15件のナビ・静的検索索引へ反映済み。
- 全46節をHTML正本と比較。元の丸点・番号・階層・カウンター・175アイコン、表・コード・注意枠・質問・参考文献を保持。
- CCST 12テストファイル・94件追加。全385 pass / 0 fail、58ファイル、25,003 expect。npm run lint / types:check成功。
- 原本はarchive/htmlとarchive/mdの `Ccst-cybersecurity-guide` ファイル。両ハッシュ一致、元情報基準日2026-10-05を保持。
- ロジック単位の追跡対象は36/36（既存32 + CCST GuideSidebar / GuideIcon / GuideCode / MermaidFigure）。MDX、静的データ、テストヘルパーは別集計。戦略セル7/40=17.5%は変更なし。
- 既存ナビ・静的索引の14件固定契約も15件へ同期。happy-domのletter-spacing:normal欠落は最小再現で確認し、宣言と計算済み書体を併せて検証するテストへ補正。
- Red / Green / docsを分離コミット。整理監査とlint/型検査を実施。ビルド・ブラウザー目視・push・公開は未実施。
- 次のアクション: ユーザーが `docs/migration-inventory/ccst-cybersecurity-review.md` に沿って目視確認する。指摘の修正は失敗テストのコミットから開始する。

- 2026-10-13: CCST 図中央寄せRed・小図/2400pxの幅広SVGと左端スクロール契約2件失敗。385 pass / 2 fail、58ファイル、25,009 expect。ビルド未実行。
