# CLAUDE.md

Updated 2026-10-22

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## コマンド

すべてのコマンドは `security-docs/` ディレクトリ内で実行する。

```bash
cd security-docs
bun install          # 依存関係のインストール
bun run dev          # 開発サーバー起動 (http://localhost:3000)
bun run build        # 本番ビルド
bun run lint         # ESLint v9 実行（eslint . を直接呼ぶ）
bun run types:check  # TypeScript 型チェック (tsc --noEmit)
bun test             # 全テスト実行
bun test src/components/docs/Callout.test.tsx  # 単一テストファイル実行
```

コミット前に必ず `bun run lint` および `bun run types:check` を通過させること。

## Docker コマンド

すべての Docker 操作はプロジェクトルート (`Security_Studies/`) から実行する。

```bash
make dev              # 開発サーバー起動（ホットリロード, http://localhost:3000）
make dev-recreate     # docker-compose.yml 変更後の強制再作成
make build            # 本番イメージビルド（security-studies:prod）
make up               # 本番コンテナ起動（バックグラウンド）
make down             # 全コンテナ停止
make logs             # dev ログ追跡（make logs SERVICE=prod で prod ログ）
make shell            # dev コンテナへのシェル接続
make test             # Bun テスト実行（コンテナ内）
make clean            # コンテナ・イメージ・ボリューム完全削除
```

> **注意**: `docker-compose.yml` を変更した後は `make dev` だけでは旧設定で再起動される。`make dev-recreate` でコンテナを作り直す。

### Docker アーキテクチャ

| 項目 | 詳細 |
|---|---|
| **Dockerfile** | `security-docs/Dockerfile`（3ステージ: deps / builder / runner） |
| deps stage | `oven/bun:1-alpine` — 本番依存関係のみ |
| builder stage | `oven/bun:1-alpine` — 全依存関係 + `next build` |
| runner stage | `node:22-alpine` — `.next/standalone/server.js` を `node` で実行 |
| **output mode** | `process.env.NETLIFY` が真のとき無効、それ以外は `'standalone'` |
| **本番起動** | `node server.js`（`next start` は standalone モードで無効） |
| **開発** | ボリュームマウント + `CHOKIDAR_USEPOLLING=true` でホットリロード |
| **`.next` 隔離** | 匿名ボリューム `- /app/.next` で macOS virtiofs の `EROFS` を回避。初回起動時は Turbopack が再コンパイルするため遅い |

## アーキテクチャ

```
Security_Studies/
├── Makefile                    # Docker 操作ショートカット
├── docker-compose.yml          # dev/prod サービス定義
├── security-docs/          # Next.js 16.3.8 アプリ (本体)
│   ├── netlify.toml            # Netlify ビルド設定（@netlify/plugin-nextjs）
│   ├── .nvmrc                  # Node.js バージョン固定 (22)
│   ├── Dockerfile              # マルチステージビルド
│   ├── .dockerignore           # ビルドコンテキスト除外
│   ├── src/
│   │   ├── app/
│   │   │   ├── docs/       # ドキュメントページ (各 page.mdx)
│   │   │   │   ├── approach/, architecture/, owasp/, ...
│   │   │   │   ├── ccie-security/, ccst-cybersecurity/
│   │   │   │   ├── secure-by-design/, mitre-atlas/, hacking-kubernetes/
│   │   │   │   └── web-application-hackers-handbook/  # 元HTMLに対応する部品・CSS・原本比較テスト
│   │   │   ├── api/search/ # 検索インデックス API エンドポイント
│   │   │   └── layout.tsx  # ルートレイアウト
│   │   ├── components/
│   │   │   ├── docs/       # MDX 用カスタムコンポーネント群
│   │   │   └── search-modal.tsx
│   │   ├── config/docs.ts  # サイドバーナビゲーション定義
│   │   ├── lib/search.ts   # 検索インデックス生成ロジック
│   │   ├── proxy.ts        # Next.js Proxy (旧 middleware) — 静的 CSP ヘッダー付与（nonce 廃止済み、Issue #32）
│   │   └── mdx-components.tsx  # MDX コンポーネントのグローバル登録
├── docs/                   # 静的ダッシュボード（test-coverage-dashboard.html + .css）
├── md/                     # Markdown ソース原稿
├── html/                   # 静的 HTML ドキュメント
└── gen_security_html.sh    # HTML 生成スクリプト
```

### コンテンツ追加フロー

新しいドキュメントを追加する手順:

1. `src/app/docs/<slug>/page.mdx` を作成し、frontmatter に `title` / `description` を定義する
2. `src/config/docs.ts` の `sidebarNav` に `{ title, href: "/docs/<slug>" }` を追加する

`src/lib/search.ts` は `src/app/docs/` 直下のサブディレクトリを自動スキャンしてインデックスを構築する。

### MDX カスタムコンポーネント

`mdx-components.tsx` でグローバル登録済みのため、`page.mdx` 内でインポート不要。

| コンポーネント | 用途 |
|---|---|
| `<HeroSection>` | ページトップのヒーロー |
| `<SectionCard>` | セクション区切り |
| `<Callout type="info\|warning\|danger\|success\|toxic">` | 注意書き |
| `<HighlightBox>` | 強調ボックス |
| `<StepTimeline>` | 手順ステップ |
| `<CompareGrid>` | 比較グリッド |
| `<AttackFlow>` | 攻撃フロー図 |
| `<DefenseList>` | 防御策リスト |
| `<Terminal title="file.sh" code="...">` | ターミナル表示（`title` の拡張子で言語自動判定: `.sh`→bash / `.yaml`/`.yml`→yaml / `.json`→json / `.md`→markdown。未対応拡張子は `typescript` を使用する（フォールバック）。`.ts` も同フォールバック経由で typescript が適用される） |
| `<Checklist>` | チェックリスト |
| `<DataTable>` | テーブル |
| `<SourceReferences>` | 出典一覧 |
| `<RiskBadge>` / `<ThreatCard>` / `<Tag>` | バッジ/カード |

### 検索 API

`GET /api/search` が `src/app/docs/` の `page.mdx` を読み取り、frontmatter + 本文冒頭500文字を返す。モジュールレベルでキャッシュされ、`Cache-Control: s-maxage=3600` が設定されている。

## Netlify デプロイ

`main` ブランチへの push で自動ビルド・デプロイ（GitHub 連携）。

```bash
# Netlify ビルドを手元で再現（.next/standalone が生成されないことを確認）
NETLIFY=true bun run build
ls .next/standalone 2>/dev/null && echo "NG" || echo "OK: standalone なし"
```

| 項目 | 詳細 |
|---|---|
| **設定ファイル** | `security-docs/netlify.toml` |
| **ビルドコマンド** | `bun install --frozen-lockfile && bun run build` |
| **publish ディレクトリ** | `.next` |
| **プラグイン** | `@netlify/plugin-nextjs`（Next.js Runtime v5） |
| **output 分岐** | `NETLIFY=true` → standalone 無効 / 未設定 → standalone 有効（Docker 用） |
| **Node.js** | 22（`.nvmrc` + `netlify.toml` の `NODE_VERSION` で固定） |
| **Deploy Preview** | PR ごとに自動生成（Free Plan 対象） |

### セキュリティ (CSP / Proxy)

`src/proxy.ts` が Next.js Proxy として動作し、CSP ヘッダーを静的構成で付与する（Next.js 16 では `middleware.ts` が deprecated となり `proxy.ts` が正式規約）。

Issue [#32](https://github.com/myoshi2891/Security_Studies/issues/32) で判明した通り、Netlify Next.js Runtime (`@netlify/plugin-nextjs`) が独自 nonce を生成して全 `<script>` タグに上書き付与し、`proxy.ts` 側の nonce と不一致になる事象が継続発生したため、nonce および `'strict-dynamic'` を廃止した。ページ毎に内容が変動する Next.js Flight data の inline script は事前ハッシュ化できないため `'unsafe-inline'` で許可している。

| ディレクティブ | 設定値 |
|---|---|
| `default-src` | `'self'` |
| `script-src` | prod: `'self' 'unsafe-inline'` / dev: `'self' 'unsafe-inline' 'unsafe-eval'` |
| `style-src` | `'self' 'unsafe-inline'` |
| `img-src` | `'self' data:` |
| `font-src` | `'self'` |
| `connect-src` | prod: `'self'` / dev: `'self' ws://localhost:* ws://127.0.0.1:*`（HMR 用） |
| `frame-ancestors` | `'none'` |
| `base-uri` | `'self'` |
| `form-action` | `'self'` |

`'unsafe-inline'` を許可するため inline script ベースの XSS 防御は後退するが、`default-src 'self'` で第三者ドメインからの script ロードを遮断し、`frame-ancestors 'none'` で clickjacking、`base-uri 'self'` / `form-action 'self'` で base タグ・フォーム経由の改竄を防御する構成は維持される。

### テスト構成

- ランナー: `bun test`
- DOM 環境: `happy-dom` (`bunfig.toml` の `preload` で自動セットアップ)
- アサーション: `@testing-library/jest-dom`（型は `src/jest-dom.d.ts` で `bun:test` に拡張済み）
- テストファイルはコンポーネントと同階層に `*.test.tsx` / `*.test.ts` として配置
- 主要テストファイル:
  - `src/lib/search.test.ts` — 検索インデックス生成・SearchResult 形式・href フォーマット
  - `src/components/search-modal.test.tsx` — SearchModal の fetch / クエリ / ナビゲーション
  - `src/components/docs/DocsSubheading.test.tsx` — DocsSubheading レンダリング

### ESLint 構成

ESLint v9 flat config（`eslint.config.mjs`）を採用。`bun run lint` は `eslint .` を直接呼ぶ（`next lint` ラッパーではない）。

カスタムルール:
- `@typescript-eslint/no-unused-vars`: `_` プレフィックスの引数・変数・catch エラーは警告対象外（シグネチャ維持目的の慣行に合わせた設定）

### CI（GitHub Actions）

`.github/workflows/ci.yml` が `main` / `dev` ブランチへの push および PR トリガーで以下を実行する:

1. `bun install --frozen-lockfile`
2. `bun run lint`
3. `bun run types:check`
4. `bun test --coverage`（パス除外なし。ISO 27000/27001 の `page.test.ts` も実行対象。移行ガイドの原本依存テストは `sourceTest` で自動スキップ、下記参照）
5. Codecov へカバレッジ送信（`continue-on-error`、品質ゲートではない）

作業ディレクトリは `security-docs/` 固定。

#### 原本比較テストの CI 扱い（2026-10-18、`1ce9728` を改修）

`archive/` は `.gitignore` 対象（意図的に未追跡）のため、CI のチェックアウトには原本が存在しない。移行済みガイドの各 `fidelity-helpers.ts` は原本を **最初の原本依存テストの実行時まで遅延読み込み** し、`hasSource`（原本の存在）と `sourceTest`（原本がなければ `test.skipIf` でスキップ）を公開する。原本 HTML に依存するテスト（節/章契約・原本比較）だけが `sourceTest` を使う。`archive.test.ts` のバイト一致テストと Markdown 原本のハッシュ検証は、ファイルごとに `test.skipIf(!existsSync(path))` で判定するため、Markdown 原本の欠落は HTML 原本の有無と独立してスキップされる。原本非依存の表示・操作・統合テストは CI でも実行される。ローカルの `bun test` / `npm test` も、原本依存テストを実行するのは `archive/` に原本がある場合のみで、原本がなければ同様にスキップされる（原本非依存のテストは常に実行される）。

- パス除外は廃止（ISO 27000/27001 の `page.test.ts` も `fidelity-helpers` 経由で `sourceTest` を使用）
- CI 条件の実測（2026-10-18 時点の記録、パス除外なし）: 391 pass / 296 skip / 0 fail、114ファイル・687件（`archive/` なしのクリーン worktree で再現）。ローカル（同日）: 687 pass / 0 fail。最新の全体件数は `docs/progress.md` を参照
- 注意: 負荷が高い初回実行では、CSS・コントラスト系の重いテスト（例: `hacking-kubernetes/contrast.test.tsx`）が Bun 既定の 5秒タイムアウトを僅かに超えて fail することがある（再実行で解消）

> **⚠️ 今後の移行作業で必須**: 原本を `archive/` へ移動し、原本を読むテストを追加・変更した場合は、原本の読み込みを `fidelity-helpers.ts` の遅延ロード（モジュールレベルで `readFileSync` しない）に揃え、原本 HTML を参照するテストは `test` ではなく `sourceTest` で登録し、`archive.test.ts` のバイト一致や Markdown 原本のハッシュ検証はファイルごとに `test.skipIf(!existsSync(path))` で登録すること。モジュールレベルで原本由来の値を即時評価しない（関数化する）。ディレクトリ単位の除外パターンは追加しない。漏れは CI で ENOENT や `undefined` 参照の失敗として現れる。確認は `git worktree add` したクリーンな作業ツリー（`archive/` なし）で CI と同じコマンドを実行し、0 fail を確認する。

### CCIE Security migration status

CCIE Security migration (2026-10-10・当時の検証記録): ヘッダーナビ・左端の元サイドバー・全幅本文・table hydration修正・レビュー対応Green. Bun tests: 186 pass / 0 fail (30 files, 6,304 expects). `bun run build` succeeded; browser visual review pending with user.

### CCIE Security migration details

- Route: `/docs/ccie-security` (`security-docs/src/app/docs/ccie-security/page.mdx`). Global header navigation: **Security Certifications**, immediately before Resources; AppSec remains in Resources.
- Full original content retained with page-scoped faithful CSS and intrinsic JSX elements; CCIE Security, CCST Cybersecurity, Secure by Design and MITRE ATLAS are the page-scoped CSS exceptions to the utility-only styling convention. All other MDX pages keep the shared design system.
- Mermaid 11.12.0 and Source Serif 4 Variable 5.3.0 are local dependencies. Python examples use server-side highlight.js. No legacy CDN scripts are loaded.
- 67 CCIE fidelity/lifecycle/archive tests plus 10 layout tests; CCIE archival session tests: 291 across 46 files (291 pass / 0 fail, 12,618 expects). Baseline 22 tracked logic files plus CCIE部品3 / DocsHeaderNav1 / Secure by Design部品3 / MITRE ATLAS部品3 are tracked separately from MDX test files (32/32).
- Shared navigation is in `DocsHeaderNav` in the header. CCIE uses its original 288px sidebar at the viewport left below the header and fills the remaining width. Mobile TOC preserves chapter expansion, scroll tracking, Escape/backdrop dismissal and focus wrapping.
- All 85 tables are checked before HTML parsing for invalid whitespace text nodes; table rendering emits no hydration/nesting warnings. Table cell and code whitespace remain intact.
- Review checklist: `docs/migration-inventory/ccie-security-review.md`. `bun run build` succeeded (2026-10-10); browser visual review pending with user.

## Secure by Design 移行（2026-10-12・完了時点の記録）

- Route: `/docs/secure-by-design` (`security-docs/src/app/docs/secure-by-design/page.mdx`)。Security Guidesに登録。全13ページをナビと検索アセットへ反映。
- 元HTMLを正本として17節、77見出し、35表、15図、8 Javaコード例、19注意欄、32参考文献を移行。原本は `archive/html/Secure-by-design-guide.html` と `archive/md/Secure-by-design-guide.md` にアーカイブ保存。
- 専用CSSとintrinsic要素で共通MDX装飾から分離。点、丸付き番号、カウンター、注意欄、表、コード、参考文献、1024px/600px条件を元CSSと比較。共通ヘッダーの位置補正と対象ページ限定の文書スクロールを追加。
- ローカルMermaidは図ごとのダーク設定を使用し、他ページのエンジン初期化を変更しない。Javaはサーバー側highlight.js、アイコンはローカルSVG。CDN・元スクリプトは使用しない。
- 移行・表示45テスト（6ファイル）。プロジェクト全体: **231 pass / 0 fail、36ファイル、9,070 expect**。ロジック単位29/29（従来26 + 本ガイドのGuideSidebar / JavaCode / MermaidFigureの3）。MDX・データ・CSSの移行テストは別集計。
- `npm test`（内部Bun）、`npm run lint`、`npm run types:check` 成功。検索アセットは `npm exec --call 'bun ./scripts/build-search-index.ts'` で更新。**この移行ではビルド未実行（ユーザー指定で禁止）**。目視確認はユーザー担当・未完了。push・公開未実施。
- 元資料・許容差分: `docs/migration-inventory/secure-by-design.json`。目視確認表: `docs/migration-inventory/secure-by-design-review.md`。

本文全幅の追加対応（2026-10-12）: 共通 `.prose` の800px上限・中央寄せをページ専用CSSで解除。デスクトップは320px目次を除いた残り幅、1024px以下は画面幅100%。全17節を1440px/900px/375pxの計算済みCSSで検証。Red `572f97e` → Green `12c926d`。npm test・lint・型検査成功、ビルド未実行。

原本アーカイブ（2026-10-12）: HTML/MDを上記archiveへ内容変更なしで移動。移行比較テストの読み込み先を更新。配置換えのため既存テストを移動前後に実行し、231 pass / 0 failを確認（コミット `0ee9b6d`）。

## MITRE ATLAS 移行結果（2026-10-12）

- Route: `/docs/mitre-atlas` (`security-docs/src/app/docs/mitre-atlas/page.mdx`)。Advanced Topicsに登録。ナビと静的検索アセットは全14ページ。
- 元HTMLを正本として全13節、34見出し、11表（228データセル）、4図、6番号付き手順カード、4注意欄、29参考文献を移行。63個のインラインcodeと技術ID、タグ、URL、キャプション、2026年7月の情報基準日を保持。
- 専用CSSとintrinsic要素で共通MDX装飾から分離。元CSS宣言・メディア条件の照合に加え、Tailwind preflightと共通CSSを合わせて1440px/900px/375pxの幅・点・番号・項目余白を検証。本文は260px目次を除く残り幅、900px以下は画面幅100%。モバイル目次はユーザー指定の開閉式。
- ローカルSVGとMermaid 11.12.0を使用。元の4定義、accTitle/accDescr、テーマ、htmlLabels=falseを保持。図ごとの設定で他ページのエンジン初期化を変更しない。CDN・元スクリプトは不使用。
- 複合JSX見出しはMDX構文木の静的文字列から抽出。改行・タグ・アイコン付き見出しを索引化し、フェンス内・SVG title・式の実行を除外する。既存検索APIの返却形式は維持。
- 移行・表示テスト42件（6ファイル）、既存検索テストへ4件追加。プロジェクト全体: **277 pass / 0 fail、42ファイル、10,627 expect**。ロジック単位32/32（従来29 + GuideIcon/GuideSidebar/MermaidDiagram）。戦略セル7/40=17.5%は増減なし。
- `npm test`（内部Bun）、`npm run lint`、`npm run types:check` 成功。静的索引生成のみnpm経由で実行。**ビルド未実行（禁止）**、ブラウザ目視はユーザー担当・未完了。push・公開未実施。
- 原本は `archive/html/Mitre-atlas.html` と `archive/md/Mitre-atlas.md` に内容変更なしで保存。移動前後のSHA-256一致を確認。台帳: `docs/migration-inventory/mitre-atlas.json`、目視確認表: `docs/migration-inventory/mitre-atlas-review.md`。
- 前半の早すぎた実装コミットと誤った成功記録は、ユーザー承認により履歴を残して訂正。復旧後の全件成功を確認し、以降はRed/実装/docsを分離。詳細はprogressの復旧記録を参照。



図の可読性改善（2026-10-12）: ラベル18px、日本語向けフォント、明るい文字色（各ラベル背景でコントラスト比7以上）、明るい接続線を使用。SVGはviewBoxの自然幅を維持し、図だけをキーボード操作可能な領域で横スクロール。キャプション・説明は14pxに改善。図定義・接続・元資料は変更なし。全277件・lint・型検査成功。ビルド未実行、目視確認はユーザー担当。





<!-- CCIE TABLE CURRENT -->
## CCIE Security 現在の状態（2026-10-13）

- 原本HTML・MDのアーカイブ完了・バイト一致・全テストとlint/型検査成功。ルート `/docs/ccie-security`。
- CCIEアーカイブ完了時点: **291 pass / 0 fail、46ファイル、12,618 expect**。npm test（内部Bun）。
- ビルド未実行（禁止）。目視確認はユーザー担当。移行台帳: `docs/migration-inventory/ccie-security.json`。
- 原本: `archive/html/Ccie-security-guide.html` / `archive/md/Ccie-security-guide.md`。両SHA-256一致、比較テストはarchiveを参照。Red `d4f11e6` → Green `7782eb1`。
<!-- /CCIE TABLE CURRENT -->


<!-- CCST CURRENT -->
## CCST Cybersecurity 移行状況（2026-10-13）

- 移行完了・全395件/58ファイル/25,099expect・lint/型検査成功・原本アーカイブ済み・目視待ち。ルート `/docs/ccst-cybersecurity`、Security CertificationsのCCIE直後。
- 最新全体テスト: **395 pass / 0 fail、58ファイル、25,099 expect**。npm test（内部Bun）。
- ビルド禁止。目視はユーザー担当。台帳: `docs/migration-inventory/ccst-cybersecurity.json`。
- 配置: `security-docs/src/app/docs/ccst-cybersecurity/page.mdx`。全46節・227見出し・163表・50図・73リスト/344項目・25問/100選択肢・25チェック・60参考文献を保持。
- CCST専用テストは12ファイル・104件。全395件成功。丸点・標準番号・カウンター、表とコードの両テーマ、375/768/1440pxのCSSを検証。CSSはCCST内と条件付きルートセレクターに限定。
- HTML正本: `archive/html/Ccst-cybersecurity-guide.html`。MD保存: `archive/md/Ccst-cybersecurity-guide.md`。両SHA-256一致、情報基準日2026-10-05を保持。
- ナビ表示指摘（解消済み）: ホームとdocsヘッダーで `DocsHeaderNav` を共有する構成へ修正済み。詳細は「共通ガイドナビゲーション（2026-10-15）」節を参照。
- 目視確認表: `docs/migration-inventory/ccst-cybersecurity-review.md`。今回のビルド・ブラウザー目視・公開は未実施。pushはPRブランチ（dev、PR #46）へ実施済み、目視確認後の追加pushは未実施。
- 原本移動Green `779e602`、スタイルGreen `b4fae3a`、スクロールGreen `1169e10`。今後の修正もnpm経由でRed→テストコミット→Green→実装コミット→仕様書同期を維持。
- 図中央寄せ（2026-10-13）: SVGをdisplay:block・左右auto余白で中央配置。収まらない図はauto余白が0になり、左端から左右スクロール可能。図定義・自然幅を保持。375/1440pxと120/2400px幅の回帰テスト追加。Red `78997af` → Green `7c54fac`。ビルド未実行、目視はユーザー担当。
<!-- /CCST CURRENT -->


<!-- hacking-kubernetes-status -->

## Hacking Kubernetes 移行（2026-10-15）

- ページ: `/docs/hacking-kubernetes`（`security-docs/src/app/docs/hacking-kubernetes/page.mdx`）。原本アーカイブGreen・全452件成功・lint/型検査成功。
- 当該移行完了時の全体テスト実測: 452 pass / 0 fail、69ファイル、30,591 expect。`npm test`（内部Bun）で検証。
- 原本: `archive/html/Hacking-kubernetes-guide.html` / `archive/md/Hacking-kubernetes-guide.md` に移動済み（SHA-256一致）。18章・82小節・52表・24コード・12図・24チェック項目。
- 検証: npm経由のテスト・lint・型検査。Next.jsビルドは禁止。目視確認はユーザー担当・未完了。push・公開未実施。

- 専用11テストファイル・56件 + 既存layoutテスト1件追加。原本アーカイブHEAD: `25a5ea1`。目視確認表: `docs/migration-inventory/hacking-kubernetes-review.md`。

<!-- /hacking-kubernetes-status -->


<!-- web-application-hackers-handbook-status -->

## WAHH 移行（2026-10-15）

- 移行完了: `/docs/web-application-hackers-handbook`（`security-docs/src/app/docs/web-application-hackers-handbook/page.mdx`）。ホームのSecurity Guidesとグローバルナビに同名リンクを登録済み。ナビ・静的検索は17ページ、原本の127見出しを検索可能。
- WAHH移行完了時点の全体テスト実測（記録）: 538 pass / 0 fail、85ファイル、59,406 expect。専用14ファイル・74件、ホーム3件・既存layoutのWAHH現在位置1件。`npm test`、`npm run lint`、`npm run types:check` 成功。
- 保持: 13主要節・14ステップ節・53表（138見出しセル/892本文セル）・7コード（Python6/JavaScript1）・16図（フロー14/シーケンス2）・30チェック項目・28参考文献・55ID。原本情報基準日は2026年10月11日のまま。
- 表示: 丸点とチェック番号、表のホバー/区切り線、見出し・コードの余白/背景/枠線を原本比較。注意本文は7:1以上、補助文字・コードコメント・チェック済み番号は4.5:1以上。図は狭幅で中央、広幅で自然幅を保持して左右へスクロール可能。
- 原本: `archive/html/Web-application-hackers-handbook-guide.html` / `archive/md/Web-application-hackers-handbook-guide.md` へバイト不変でアーカイブ済み（SHA-256固定、移動コミット `56faff0`）。表示修正HEAD: `81c6dc1`。
- 目視確認表: `docs/migration-inventory/web-application-hackers-handbook-review.md`。ユーザー目視は未完了。npm使用、Next.jsビルド禁止・未実行、push・公開未実施。

<!-- /web-application-hackers-handbook-status -->


<!-- shared-guide-navigation-status -->

## 共通ガイドナビゲーション（2026-10-15）

- 表示問題の原因: ホーム上部はLibrary/Documentationだけの別ナビで、WAHHは一覧カードにのみ表示されていた。ホームとドキュメントヘッダーで `src/components/docs/DocsHeaderNav.tsx` を共有する構成へ修正（HEAD `81c6dc1`）。
- 入口: デスクトップは「ガイド一覧」、スマートフォンは「ガイド」。現在23ページをカテゴリ別に表示し、ガイド名・カテゴリで絞り込める。絞り込み欄は固定し、増えた項目はメニュー内で縦スクロールする。
- 拡張: `src/config/docs.ts` の `sidebarNav` がホーム一覧・共通メニュー・件数の共通設定。ページ追加時はMDX作成と設定登録を行い、検索インデックスを更新する。ナビコンポーネントにページごとの追記は不要。80ページ/新カテゴリを追加した97ページのテストと、設定に追従する件数・既存順序・重複検出テストで検証。
- 操作: 開いたら絞り込み欄へフォーカス、Escapeで閉じて入口へ戻る。リンク選択・外側クリックで閉じる。表示名と読み上げ名を一致させ、320px/375pxではヘッダー検索をコンパクトにする。
- 検証（共通ナビ完了時点の記録）: 共通ナビ8件・ホーム3件・docs layout12件。全538件/85ファイル/59,406 expect成功、`npm run lint`・`npm run types:check` 成功。localhost:3000が返すホームとdocsのHTMLで共通入口・絞り込み欄・17リンク・WAHHを確認。ユーザー目視は未完了。
- npm使用・Next.jsビルド未実行（禁止）・push/公開未実施。目視確認表: `docs/migration-inventory/web-application-hackers-handbook-review.md`。

<!-- /shared-guide-navigation-status -->

<!-- applied-migration-status -->
## Applied Cryptography移行（2026-10-18）

Applied Cryptography: 原本アーカイブGreen・全624件/専用60件成功・lint/型検査成功・目視待ち。624 pass / 0 fail、101ファイル（2026-10-18 移行完了時点の実測。最新の全体結果はdocs/progress.mdを参照）。npm経由・Next.jsビルド未実行（禁止）・目視はユーザー担当／未完了。同期前HEAD `7627df6`。

移行先: `security-docs/src/app/docs/applied-cryptography-guide/page.mdx`、URL `/docs/applied-cryptography-guide`。原本: `archive/html/Applied-cryptography-guide.html`・`archive/md/Applied-cryptography-guide.md`。バイト一致・ルート原本除去・全比較参照の移行を検証済み。全16節・28表・10コード・14図・26参考文献を原本と比較。台帳: `docs/migration-inventory/applied-cryptography-guide.json`。原本の65見出しを検索可能。専用60件/12ファイル。最新の全体結果はdocs/progress.mdを参照。`npm run lint`・`npm run types:check` 成功。目視確認表: `docs/migration-inventory/applied-cryptography-guide-review.md`（ユーザー確認待ち）。Next.jsビルド・push・公開は未実施。Mermaidの色設定を反映するためbaseテーマを使用し、各図の設定を描画ごとに渡す。狭い図は中央、幅広図は縮めず左右スクロール。
<!-- /applied-migration-status -->

<!-- threat-migration-status -->
## Threat Modeling移行（2026-10-18）

Threat Modeling: 最終自動検証完了・原本アーカイブ済み・全685件/専用61件成功・lint/型検査成功・目視待ち。685 pass / 0 fail、114ファイル（2026-10-18 移行完了時点の全体実測。最新の全体結果はdocs/progress.mdを参照）。npm使用・ビルド禁止/未実行・目視はユーザー担当/未完了。同期前HEAD `701a8e1`。

移行先: `security-docs/src/app/docs/threat-modeling-guide/page.mdx`、URL `/docs/threat-modeling-guide`。全18章・42表・839表セル・9図・2コード・17チェック項目・5解答・41参考文献を原本と比較。原本: `archive/html/Threat-modeling-guide.html`・`archive/md/Threat-modeling-guide.md`（SHA-256一致）。Shostack版は対象外。最終全体685 pass / 0 fail、114ファイル、118,043 expect。専用61件/13ファイル。検索索引21ページ・原本89見出しを検証。目視確認表: `docs/migration-inventory/threat-modeling-guide-review.md`（ユーザー確認待ち）。push/公開未実施。Mermaidはbaseテーマ・strictモードで全定義/配色/間隔を保持し、実際の描画境界で高さを調整。台帳: `docs/migration-inventory/threat-modeling-guide.json`。
<!-- /threat-migration-status -->

<!-- iso15408-status -->

ISO/IEC 15408-1:2026: 原本アーカイブと最終自動検証完了・専用55件成功・lint/型検査成功・目視待ち。npm test: 457 pass / 297 skip / 0 fail、124ファイル。原本の有無でskip件数は変動。ビルド禁止・未実行、目視はユーザー担当・未完了。

移行先: `security-docs/src/app/docs/iso-iec-15408-1-2026-guide/page.mdx`（URL `/docs/iso-iec-15408-1-2026-guide`）。原本は `archive/html/Iso-15408-1-2026-guide.html` / `archive/md/Iso-15408-1-2026-guide.md` にバイト一致で移動済み。`archive/` は既存規約どおりGit管理外。

全21節・81見出し・31表（509セル）・17図・88リスト項目・10解答・19参考文献を原本と比較。点の疑似要素、番号、全CSS宣言、375/900/1440pxの計算済みスタイル、両配色、目次操作、図の再試行、表・全ページhydrationを検証。ナビ・ホーム一覧・静的検索22ページに登録。原本HTML/MDはSHA-256一致でアーカイブ済み。専用55件/10ファイル、全体457 pass / 297 skip / 0 fail（754件/124ファイル、41,155 expect）。npm test・npm run lint・npm run types:check成功。push・公開未実施。台帳: `docs/migration-inventory/iso-iec-15408-1-2026-guide.json`、目視確認表: `docs/migration-inventory/iso-iec-15408-1-2026-guide-review.md`。

<!-- /iso15408-status -->

<!-- iso27017-status -->

ISO/IEC 27017:2026: 移行・原本アーカイブ・最終自動検証完了。専用55件/12ファイル成功。全体512 pass / 297 skip / 0 fail、136ファイル（809件、84,599 expect）。npm test・npm run lint・npm run types:check成功。Next.jsビルド禁止・未実行。目視はユーザー担当・未完了。push・公開未実施。

移行先: `security-docs/src/app/docs/iso-iec-27017-2026-guide/page.mdx`（URL `/docs/iso-iec-27017-2026-guide`）。全17節・57見出し・30表（463セル）・10図・2コード・44リスト項目・7チェック項目・7 Q&A・18参考文献を原本と照合。全CSS宣言と375/1100/1440px・両配色の本文/表/リスト等の計算済みスタイルを比較。箇条書きの点、番号、チェックカウンター、選択/フォーカス表示、コード文字列とローカルハイライト、目次操作、図の描画/再試行、表・全ページhydrationを検証。原本: `archive/html/Iso-27017-2026-guide.html` / `archive/md/Iso-27017-2026-guide.md`（SHA-256一致・既存規約どおりGit管理外）。ナビと検索23ページに登録。台帳: `docs/migration-inventory/iso-iec-27017-2026-guide.json`。目視確認表: `docs/migration-inventory/iso-iec-27017-2026-guide-review.md`。

<!-- /iso27017-status -->

<!-- iso18045-status -->

ISO/IEC 18045:2026: 原本アーカイブRed・新規4件は2 skip/2失敗（既存専用52件成功、計10ファイル）。原本はルートに残存し比較先未更新。npm使用・Next.jsビルド禁止/未実行・目視はユーザー担当/未完了。

対象: `security-docs/src/app/docs/iso-iec-18045-2026-guide/page.mdx`（URL `/docs/iso-iec-18045-2026-guide`）。全21節・40表830セル・18図・28参考文献。最終段階で原本HTML/MDをarchiveへ保存する。

<!-- /iso18045-status -->
