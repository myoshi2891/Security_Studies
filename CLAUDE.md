# CLAUDE.md

Updated 2026-10-12

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
│   │   │   │   └── secure-by-design/, mitre-atlas/  # 元HTMLを忠実に移行したガイド・専用部品・CSS・テスト
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
4. `bun test`

作業ディレクトリは `security-docs/` 固定。

### CCIE Security migration status

CCIE Security migration (2026-10-10・当時の検証記録): ヘッダーナビ・左端の元サイドバー・全幅本文・table hydration修正・レビュー対応Green. Bun tests: 186 pass / 0 fail (30 files, 6,304 expects). `bun run build` succeeded; browser visual review pending with user.

### CCIE Security migration details

- Route: `/docs/ccie-security` (`security-docs/src/app/docs/ccie-security/page.mdx`). Global header navigation: **Security Certifications**, immediately before Resources; AppSec remains in Resources.
- Full original content retained with page-scoped faithful CSS and intrinsic JSX elements; this page is an exception to the utility-only styling convention. Other MDX pages keep the shared design system.
- Mermaid 11.12.0 and Source Serif 4 Variable 5.3.0 are local dependencies. Python examples use server-side highlight.js. No legacy CDN scripts are loaded.
- 60 CCIE fidelity/lifecycle tests plus 10 layout tests; latest project tests: 280 across 43 files (280 pass / 0 fail, 12,169 expects). Baseline 22 tracked logic files plus CCIE部品3 / DocsHeaderNav1 / Secure by Design部品3 / MITRE ATLAS部品3 are tracked separately from MDX test files (32/32).
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
## CCIE Security 現在の状態（2026-10-12）

- 表のCSSカスケードGreen・全280件成功・実画面85表の白背景/上下0px確認・lint/型検査成功。ルート `/docs/ccie-security`。
- プロジェクト全体: **280 pass / 0 fail、43ファイル、12,169 expect**。npm test（内部Bun）。
- ビルド未実行（禁止）。目視確認はユーザー担当。移行台帳: `docs/migration-inventory/ccie-security.json`。
<!-- /CCIE TABLE CURRENT -->
