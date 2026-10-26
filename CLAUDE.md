# CLAUDE.md

Updated 2026-10-26

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
├── security-docs/          # Next.js 16.4.2 アプリ (本体)
│   ├── netlify.toml            # Netlify ビルド設定（@netlify/plugin-nextjs）
│   ├── .nvmrc                  # Node.js バージョン固定 (22)
│   ├── Dockerfile              # マルチステージビルド
│   ├── .dockerignore           # ビルドコンテキスト除外
│   ├── src/
│   │   ├── app/
│   │   │   ├── docs/       # ドキュメントページ (各 page.mdx)
│   │   │   │   ├── ghost-in-the-wires-guide/ # 原本構造を保持したMDX・部品・専用CSS・91テスト
│   │   │   │   ├── hacking-art-of-exploitation-guide/ # 全12章・専用CSS・部品・83テスト
│   │   │   │   ├── approach/, architecture/, owasp/, ...
│   │   │   │   ├── ccie-security/, ccst-cybersecurity/, cyberops-associate-guide/, cyberops-professional-guide/
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
5. Codecov へカバレッジ送信（`continue-on-error`、品質ゲートではない）。`bunfig.toml` の `coveragePathIgnorePatterns` で各ガイドの `fidelity-helpers.ts`（原本依存テスト基盤。archive/ のない CI では構造的に未実行）を対象外にしている。新ガイドの部品（例: `MermaidFigure` の既定レンダラー）は `sourceTest` ではなく原本非依存の `test` でカバーすること

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
- 元HTMLを正本として17節、77見出し、35表、15図、8 Javaコード例、19注意欄、32参考文献を移行。原本は `archive/security-guides/Secure-by-design-guide.html` と `archive/security-guides/Secure-by-design-guide.md` にアーカイブ保存。
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
- 原本は `archive/advanced-topics/Mitre-atlas.html` と `archive/advanced-topics/Mitre-atlas.md` に内容変更なしで保存。移動前後のSHA-256一致を確認。台帳: `docs/migration-inventory/mitre-atlas.json`、目視確認表: `docs/migration-inventory/mitre-atlas-review.md`。
- 前半の早すぎた実装コミットと誤った成功記録は、ユーザー承認により履歴を残して訂正。復旧後の全件成功を確認し、以降はRed/実装/docsを分離。詳細はprogressの復旧記録を参照。



図の可読性改善（2026-10-12）: ラベル18px、日本語向けフォント、明るい文字色（各ラベル背景でコントラスト比7以上）、明るい接続線を使用。SVGはviewBoxの自然幅を維持し、図だけをキーボード操作可能な領域で横スクロール。キャプション・説明は14pxに改善。図定義・接続・元資料は変更なし。全277件・lint・型検査成功。ビルド未実行、目視確認はユーザー担当。





<!-- CCIE TABLE CURRENT -->
## CCIE Security 現在の状態（2026-10-13）

- 原本HTML・MDのアーカイブ完了・バイト一致・全テストとlint/型検査成功。ルート `/docs/ccie-security`。
- CCIEアーカイブ完了時点: **291 pass / 0 fail、46ファイル、12,618 expect**。npm test（内部Bun）。
- ビルド未実行（禁止）。目視確認はユーザー担当。移行台帳: `docs/migration-inventory/ccie-security.json`。
- 原本: `archive/security-certifications/Ccie-security-guide.html` / `archive/security-certifications/Ccie-security-guide.md`。両SHA-256一致、比較テストはarchiveを参照。Red `d4f11e6` → Green `7782eb1`。
<!-- /CCIE TABLE CURRENT -->


<!-- CCST CURRENT -->
## CCST Cybersecurity 移行状況（2026-10-13）

- 移行完了・全395件/58ファイル/25,099expect・lint/型検査成功・原本アーカイブ済み・目視待ち。ルート `/docs/ccst-cybersecurity`、Security CertificationsのCCIE直後。
- 最新全体テスト: **395 pass / 0 fail、58ファイル、25,099 expect**。npm test（内部Bun）。
- ビルド禁止。目視はユーザー担当。台帳: `docs/migration-inventory/ccst-cybersecurity.json`。
- 配置: `security-docs/src/app/docs/ccst-cybersecurity/page.mdx`。全46節・227見出し・163表・50図・73リスト/344項目・25問/100選択肢・25チェック・60参考文献を保持。
- CCST専用テストは12ファイル・104件。全395件成功。丸点・標準番号・カウンター、表とコードの両テーマ、375/768/1440pxのCSSを検証。CSSはCCST内と条件付きルートセレクターに限定。
- HTML正本: `archive/security-certifications/Ccst-cybersecurity-guide.html`。MD保存: `archive/security-certifications/Ccst-cybersecurity-guide.md`。両SHA-256一致、情報基準日2026-10-05を保持。
- ナビ表示指摘（解消済み）: ホームとdocsヘッダーで `DocsHeaderNav` を共有する構成へ修正済み。詳細は「共通ガイドナビゲーション（2026-10-15）」節を参照。
- 目視確認表: `docs/migration-inventory/ccst-cybersecurity-review.md`。今回のビルド・ブラウザー目視・公開は未実施。pushはPRブランチ（dev、PR #46）へ実施済み、目視確認後の追加pushは未実施。
- 原本移動Green `779e602`、スタイルGreen `b4fae3a`、スクロールGreen `1169e10`。今後の修正もnpm経由でRed→テストコミット→Green→実装コミット→仕様書同期を維持。
- 図中央寄せ（2026-10-13）: SVGをdisplay:block・左右auto余白で中央配置。収まらない図はauto余白が0になり、左端から左右スクロール可能。図定義・自然幅を保持。375/1440pxと120/2400px幅の回帰テスト追加。Red `78997af` → Green `7c54fac`。ビルド未実行、目視はユーザー担当。
<!-- /CCST CURRENT -->


<!-- hacking-kubernetes-status -->

## Hacking Kubernetes 移行（2026-10-15）

- ページ: `/docs/hacking-kubernetes`（`security-docs/src/app/docs/hacking-kubernetes/page.mdx`）。原本アーカイブGreen・全452件成功・lint/型検査成功。
- 当該移行完了時の全体テスト実測: 452 pass / 0 fail、69ファイル、30,591 expect。`npm test`（内部Bun）で検証。
- 原本: `archive/security-guides/Hacking-kubernetes-guide.html` / `archive/security-guides/Hacking-kubernetes-guide.md` に移動済み（SHA-256一致）。18章・82小節・52表・24コード・12図・24チェック項目。
- 検証: npm経由のテスト・lint・型検査。Next.jsビルドは禁止。目視確認はユーザー担当・未完了。push・公開未実施。

- 専用11テストファイル・56件 + 既存layoutテスト1件追加。原本アーカイブHEAD: `25a5ea1`。目視確認表: `docs/migration-inventory/hacking-kubernetes-review.md`。

<!-- /hacking-kubernetes-status -->


<!-- web-application-hackers-handbook-status -->

## WAHH 移行（2026-10-15）

- 移行完了: `/docs/web-application-hackers-handbook`（`security-docs/src/app/docs/web-application-hackers-handbook/page.mdx`）。ホームのSecurity Guidesとグローバルナビに同名リンクを登録済み。ナビ・静的検索は17ページ、原本の127見出しを検索可能。
- WAHH移行完了時点の全体テスト実測（記録）: 538 pass / 0 fail、85ファイル、59,406 expect。専用14ファイル・74件、ホーム3件・既存layoutのWAHH現在位置1件。`npm test`、`npm run lint`、`npm run types:check` 成功。
- 保持: 13主要節・14ステップ節・53表（138見出しセル/892本文セル）・7コード（Python6/JavaScript1）・16図（フロー14/シーケンス2）・30チェック項目・28参考文献・55ID。原本情報基準日は2026年10月11日のまま。
- 表示: 丸点とチェック番号、表のホバー/区切り線、見出し・コードの余白/背景/枠線を原本比較。注意本文は7:1以上、補助文字・コードコメント・チェック済み番号は4.5:1以上。図は狭幅で中央、広幅で自然幅を保持して左右へスクロール可能。
- 原本: `archive/security-guides/Web-application-hackers-handbook-guide.html` / `archive/security-guides/Web-application-hackers-handbook-guide.md` へバイト不変でアーカイブ済み（SHA-256固定、移動コミット `56faff0`）。表示修正HEAD: `81c6dc1`。
- 目視確認表: `docs/migration-inventory/web-application-hackers-handbook-review.md`。ユーザー目視は未完了。npm使用、Next.jsビルド禁止・未実行、push・公開未実施。

<!-- /web-application-hackers-handbook-status -->


<!-- shared-guide-navigation-status -->

## 共通ガイドナビゲーション（2026-10-15）

- 表示問題の原因: ホーム上部はLibrary/Documentationだけの別ナビで、WAHHは一覧カードにのみ表示されていた。ホームとドキュメントヘッダーで `src/components/docs/DocsHeaderNav.tsx` を共有する構成へ修正（HEAD `81c6dc1`）。
- 入口: デスクトップは「ガイド一覧」、スマートフォンは「ガイド」。現在24ページをカテゴリ別に表示し、ガイド名・カテゴリで絞り込める。絞り込み欄は固定し、増えた項目はメニュー内で縦スクロールする。
- 拡張: `src/config/docs.ts` の `sidebarNav` がホーム一覧・共通メニュー・件数の共通設定。ページ追加時はMDX作成と設定登録を行い、検索インデックスを更新する。ナビコンポーネントにページごとの追記は不要。80ページ/新カテゴリを追加した97ページのテストと、設定に追従する件数・既存順序・重複検出テストで検証。
- 操作: 開いたら絞り込み欄へフォーカス、Escapeで閉じて入口へ戻る。リンク選択・外側クリックで閉じる。表示名と読み上げ名を一致させ、320px/375pxではヘッダー検索をコンパクトにする。
- 検証（共通ナビ完了時点の記録）: 共通ナビ8件・ホーム3件・docs layout12件。全538件/85ファイル/59,406 expect成功、`npm run lint`・`npm run types:check` 成功。localhost:3000が返すホームとdocsのHTMLで共通入口・絞り込み欄・17リンク・WAHHを確認。ユーザー目視は未完了。
- npm使用・Next.jsビルド未実行（禁止）・push/公開未実施。目視確認表: `docs/migration-inventory/web-application-hackers-handbook-review.md`。

<!-- /shared-guide-navigation-status -->

<!-- applied-migration-status -->
## Applied Cryptography移行（2026-10-18）

Applied Cryptography: 原本アーカイブGreen・全624件/専用60件成功・lint/型検査成功・目視待ち。624 pass / 0 fail、101ファイル（2026-10-18 移行完了時点の実測。最新の全体結果はdocs/progress.mdを参照）。npm経由・Next.jsビルド未実行（禁止）・目視はユーザー担当／未完了。同期前HEAD `7627df6`。

移行先: `security-docs/src/app/docs/applied-cryptography-guide/page.mdx`、URL `/docs/applied-cryptography-guide`。原本: `archive/security-guides/Applied-cryptography-guide.html`・`archive/security-guides/Applied-cryptography-guide.md`。バイト一致・ルート原本除去・全比較参照の移行を検証済み。全16節・28表・10コード・14図・26参考文献を原本と比較。台帳: `docs/migration-inventory/applied-cryptography-guide.json`。原本の65見出しを検索可能。専用60件/12ファイル。最新の全体結果はdocs/progress.mdを参照。`npm run lint`・`npm run types:check` 成功。目視確認表: `docs/migration-inventory/applied-cryptography-guide-review.md`（ユーザー確認待ち）。Next.jsビルド・push・公開は未実施。Mermaidの色設定を反映するためbaseテーマを使用し、各図の設定を描画ごとに渡す。狭い図は中央、幅広図は縮めず左右スクロール。
<!-- /applied-migration-status -->

<!-- threat-migration-status -->
## Threat Modeling移行（2026-10-18）

Threat Modeling: 最終自動検証完了・原本アーカイブ済み・全685件/専用61件成功・lint/型検査成功・目視待ち。685 pass / 0 fail、114ファイル（2026-10-18 移行完了時点の全体実測。最新の全体結果はdocs/progress.mdを参照）。npm使用・ビルド禁止/未実行・目視はユーザー担当/未完了。同期前HEAD `701a8e1`。

移行先: `security-docs/src/app/docs/threat-modeling-guide/page.mdx`、URL `/docs/threat-modeling-guide`。全18章・42表・839表セル・9図・2コード・17チェック項目・5解答・41参考文献を原本と比較。原本: `archive/security-guides/Threat-modeling-guide.html`・`archive/security-guides/Threat-modeling-guide.md`（SHA-256一致）。Shostack版は対象外。最終全体685 pass / 0 fail、114ファイル、118,043 expect。専用61件/13ファイル。検索索引21ページ・原本89見出しを検証。目視確認表: `docs/migration-inventory/threat-modeling-guide-review.md`（ユーザー確認待ち）。push/公開未実施。Mermaidはbaseテーマ・strictモードで全定義/配色/間隔を保持し、実際の描画境界で高さを調整。台帳: `docs/migration-inventory/threat-modeling-guide.json`。
<!-- /threat-migration-status -->

<!-- iso15408-status -->

ISO/IEC 15408-1:2026: 原本アーカイブと最終自動検証完了・専用55件成功・lint/型検査成功・目視待ち。npm test: 457 pass / 297 skip / 0 fail、124ファイル。原本の有無でskip件数は変動。ビルド禁止・未実行、目視はユーザー担当・未完了。

移行先: `security-docs/src/app/docs/iso-iec-15408-1-2026-guide/page.mdx`（URL `/docs/iso-iec-15408-1-2026-guide`）。原本は `archive/standards/Iso-15408-1-2026-guide.html` / `archive/standards/Iso-15408-1-2026-guide.md` にバイト一致で移動済み。`archive/` は既存規約どおりGit管理外。

全21節・81見出し・31表（509セル）・17図・88リスト項目・10解答・19参考文献を原本と比較。点の疑似要素、番号、全CSS宣言、375/900/1440pxの計算済みスタイル、両配色、目次操作、図の再試行、表・全ページhydrationを検証。ナビ・ホーム一覧・静的検索22ページに登録。原本HTML/MDはSHA-256一致でアーカイブ済み。専用55件/10ファイル、全体457 pass / 297 skip / 0 fail（754件/124ファイル、41,155 expect）。npm test・npm run lint・npm run types:check成功。push・公開未実施。台帳: `docs/migration-inventory/iso-iec-15408-1-2026-guide.json`、目視確認表: `docs/migration-inventory/iso-iec-15408-1-2026-guide-review.md`。

<!-- /iso15408-status -->

<!-- iso27017-status -->

ISO/IEC 27017:2026: 移行・原本アーカイブ・最終自動検証完了。専用55件/12ファイル成功。全体512 pass / 297 skip / 0 fail、136ファイル（809件、84,599 expect）。npm test・npm run lint・npm run types:check成功。Next.jsビルド禁止・未実行。目視はユーザー担当・未完了。push・公開未実施。

移行先: `security-docs/src/app/docs/iso-iec-27017-2026-guide/page.mdx`（URL `/docs/iso-iec-27017-2026-guide`）。全17節・57見出し・30表（463セル）・10図・2コード・44リスト項目・7チェック項目・7 Q&A・18参考文献を原本と照合。全CSS宣言と375/1100/1440px・両配色の本文/表/リスト等の計算済みスタイルを比較。箇条書きの点、番号、チェックカウンター、選択/フォーカス表示、コード文字列とローカルハイライト、目次操作、図の描画/再試行、表・全ページhydrationを検証。原本: `archive/standards/Iso-27017-2026-guide.html` / `archive/standards/Iso-27017-2026-guide.md`（SHA-256一致・既存規約どおりGit管理外）。ナビと検索23ページに登録。台帳: `docs/migration-inventory/iso-iec-27017-2026-guide.json`。目視確認表: `docs/migration-inventory/iso-iec-27017-2026-guide-review.md`。

<!-- /iso27017-status -->

<!-- iso18045-status -->

ISO/IEC 18045:2026: 移行・原本アーカイブ・最終自動検証完了。専用56件/10ファイル成功。全体568 pass / 297 skip / 0 fail、146ファイル（865件、158,174 expect）。npm test・npm run lint・npm run types:check成功。Next.jsビルド禁止・未実行。目視はユーザー担当・未完了。push・公開未実施。

移行先: `security-docs/src/app/docs/iso-iec-18045-2026-guide/page.mdx`（URL `/docs/iso-iec-18045-2026-guide`）。全21節・77見出し・40表（830セル）・18図・98信頼度タグ・28参考文献を原本と照合。全CSS宣言、375/1100/1440px・両配色の本文/全表セル/タグ等の計算済みスタイル、リストの点・番号の定義を検証。18図の定義・配色・sequence/pie設定・円グラフ全11値、目次操作、図の描画/再試行、表・全ページhydrationを検証。共通CSSによるダーク配色の見出し色混入を修正。原本: `archive/standards/Iso-iec-18045-2026-guide.html` / `archive/standards/Iso-iec-18045-2026-guide.md`（SHA-256一致・既存規約どおりGit管理外）。ナビと検索24ページに登録。台帳: `docs/migration-inventory/iso-iec-18045-2026-guide.json`。目視確認表: `docs/migration-inventory/iso-iec-18045-2026-guide-review.md`。

<!-- /iso18045-status -->


## Bulletproof TLS and PKI 移行（2026-10-23）

Bulletproof TLS and PKI: `/docs/bulletproof-tls-pki-guide` へ移行。全15節・57表868セル・24図・12コード・10チェック項目・4解答を原本照合。専用41件/6ファイル成功。全体615 pass / 297 skip / 0 fail（912件・152ファイル・160,218 expect）。npm test・npm run lint・npm run types:check成功。Next.jsビルド禁止・未実行。目視はユーザー担当・未完了。原本HTML/MDは `archive/security-guides/` にカテゴリー別で保存（両SHA-256一致）。

配置: `security-docs/src/app/docs/bulletproof-tls-pki-guide/page.mdx`。Cloud & Cryptography のナビ・ホーム一覧・静的検索（25ページ）に登録。原本の丸点・番号・チェックカウンター・疑似要素を含む全CSS宣言、5画面幅の適用結果、目次操作、図の再試行、表とページ全体のhydrationを検証。台帳: `docs/migration-inventory/bulletproof-tls-pki-guide.json`。目視確認表: `docs/migration-inventory/bulletproof-tls-pki-guide-review.md`。


## Zero Trust Networks 第2版 移行（2026-10-23）

Zero Trust Networks, 2nd Edition: /docs/zero-trust-networks-2nd-edition-guide へ移行・原本アーカイブ完了。全25節・83表（1344セル）・17図・3コード・90 STEP・36解答・20出典を原本と照合。専用68件/12ファイル成功。全体683 pass / 297 skip / 0 fail（980件・164ファイル・327,505 expect）。npm test・npm run lint・npm run types:check成功。Next.jsビルド禁止・未実行。目視はユーザー担当・未完了。push・公開未実施。

配置: `security-docs/src/app/docs/zero-trust-networks-2nd-edition-guide/page.mdx`。Security Guidesのナビ・ホーム一覧・静的検索（26ページ、全124見出し）へ登録。リストの点・番号・章/STEP/出典バッジ、全CSS宣言とmedia条件、全1344セルの適用スタイル、図のLR→TB再配置・余白・左右スクロール、36解答・25目次・hydrationを検証。原本は `archive/security-guides/Zero-trust-networks-2nd-edition-guide.html` / `archive/security-guides/Zero-trust-networks-2nd-edition-guide.md`（両SHA-256一致、archive/は既存規約どおりGit管理外）。台帳: `docs/migration-inventory/zero-trust-networks-2nd-edition-guide.json`。目視確認表: `docs/migration-inventory/zero-trust-networks-2nd-edition-guide-review.md`。


## Secrets and Lies 移行（2026-10-23）

Secrets and Lies: /docs/secrets-and-lies-guide へ移行・原本アーカイブ完了。全11節・24表627セル・12図・31演習・8チェック項目・21出典を原本照合。専用55件/11ファイル成功。全体738 pass / 297 skip / 0 fail（1035件・175ファイル・410,413 expect）。npm test・npm run lint・npm run types:check成功。Next.jsビルド禁止・未実行。目視はユーザー担当・未完了。push・公開未実施。

配置: `security-docs/src/app/docs/secrets-and-lies-guide/page.mdx`。Security Guidesのナビ・ホーム一覧・静的検索（27ページ、全59見出し）へ登録。丸い箇条書きの点、通常番号と31演習の丸番号、8チェックのカウンター/選択/フォーカス、全CSS/mediaと627セルの適用スタイル、12図の配色・構文・1始まりの表示番号、目次操作、表・ページ全体hydrationを検証。原本: `archive/security-guides/Secrets-and-lies-guide.html` / `archive/security-guides/Secrets-and-lies-guide.md`（両SHA-256一致、archive/は既存規約でGit管理外）。台帳: `docs/migration-inventory/secrets-and-lies-guide.json`。目視確認表: `docs/migration-inventory/secrets-and-lies-guide-review.md`。


## Bulletproof原本のカテゴリー別アーカイブ（2026-10-23）

Bulletproof TLS and PKIのHTML・Markdown原本を内容別カテゴリー archive/security-guides/ にアーカイブ。両SHA-256一致、ルート原本を除去、比較テストの参照先を更新。専用45件/7ファイル成功。全体742 pass / 297 skip / 0 fail（1039件・176ファイル・410,418 expect）。npm test・npm run lint・npm run types:check成功。ビルド禁止・未実行。archive/は既存設定でGit管理外。

移動先: `archive/security-guides/Bulletproof-tls-pki-guide.html` / `archive/security-guides/Bulletproof-tls-pki-guide.md`。アーカイブは形式別の `html/`・`md/` ではなく、既存の内容別カテゴリーへHTML・Markdownをまとめる。


## 内容別アーカイブ統一（2026-10-23）

アーカイブを内容別カテゴリーへ統一。archive/html・archive/mdに残っていた10原本を移動し、全10件のSHA-256一致を確認。ISO3組はarchive/standards、Secrets and Lies・Zero Trust Networksの2組はarchive/security-guides。空の形式別フォルダーを除去し、すでに分類済みの原本を含む比較テスト・台帳の旧パスも修正。ローカル全体1052 pass / 0 skip / 0 fail（1052件・177ファイル・489,759 expect）。旧パスでスキップされていた297件の原本比較が復帰。CI相当576 pass / 476 skip / 0 fail（1052件・177ファイル、archive/なし・npm test -- --coverage）。lint・型チェック成功。ビルド禁止・未実行。

新規保存も既存の内容別カテゴリー（技術ガイド: `archive/security-guides/`、国際規格: `archive/standards/`、資格: `archive/security-certifications/`、専門トピック: `archive/advanced-topics/`、概要・設計: `archive/getting-started/`）を使い、HTMLとMarkdownを同じカテゴリーへ置く。移動台帳: `docs/migration-inventory/archive-category-reorganization.json`。archive/は既存設定どおりGit管理外。原本がある場合は比較を実行し、ないCIでは原本依存の比較だけをスキップする。


## ISC2 CC 移行（2026-10-23・自動検証完了）

ISC2 CCを `/docs/cc-certified-in-cybersecurity-guide` へ移行。11章・120見出し・85表1520セル・239リスト項目・23図・54目次リンク・53出典カード・75注意欄を原本と照合。丸点・番号・全CSS宣言とmedia条件、5画面幅×明暗両配色、目次操作、図の再試行・説明・配色、全表とページのhydrationを検証。専用59件/6ファイル成功。全体1120成功/0失敗（185ファイル、494,572 expect）。npm test・npm run lint・npm run types:check成功。Next.jsビルドは禁止・未実行。目視はユーザー担当・未確認。

配置: `security-docs/src/app/docs/cc-certified-in-cybersecurity-guide/page.mdx`。Security Certifications（資格・学習）の共通ナビ・ホーム・静的検索28件に登録。HTML・Markdown原本は `archive/security-certifications/` へバイト一致でアーカイブ済み。ローカルSource Serif 4 Variableとアイコン・Mermaidを使用。共有ヘッダーを避けた目次配置と幅広図の左右スクロールに対応。台帳: `docs/migration-inventory/cc-certified-in-cybersecurity-guide.json`。目視確認表: `docs/migration-inventory/cc-certified-in-cybersecurity-guide-review.md`。実装コミット `58e8b43`。


## ISC2 CC 原本アーカイブ（2026-10-23・Green）

ISC2 CCの元HTMLとMarkdownを `archive/security-certifications/` へアーカイブ（両SHA-256一致、ルート残存なし）。原本比較はアーカイブ参照へ変更。専用59件/6ファイル・全1120件/185ファイル成功、494,572 expect。原本のない隔離環境は専用30成功/29skip/0失敗で、原本非依存の検証は継続。npm test・lint・型チェック成功。ビルド未実行、目視はユーザー担当。実装コミット `c1e0da3`。

### 移行完了の必須条件

移行完了後は、元HTMLと対応するMarkdownを必ず同じ内容別カテゴリーのarchiveへ移動する。資格は`archive/security-certifications/`。移動前後のSHA-256一致・ルート残存なし・比較パス更新を検証し、原本を上書き・消失させない。


<!-- ccsp-migration-status -->
## CCSP移行（2026-10-23）

CCSP: 全12節移行・原本アーカイブGreen・目視待ち。全12節・115見出し・78表1216セル・16図・219リスト項目・10解答・6チェック・38出典カードを原本と照合。丸点/番号/カウンター、全CSS/media、5画面幅×両OS配色、図・目次・チェック/解答操作、全表と全ページのhydrationを検証。HTML/Markdownは両SHA-256一致でarchive/security-certificationsへ移動済み。原本なし隔離環境は専用33成功/36skip/0失敗。 専用69件/10ファイル・全体1189成功/0skip/0失敗（195ファイル、499,087 expect）。npm test・lint・型チェック成功。ビルド禁止・未実行。目視はユーザー担当。直前実装コミット `bac8c7a`。

配置: `security-docs/src/app/docs/ccsp-study-guide/page.mdx`、URL `/docs/ccsp-study-guide`。Security Certifications（資格・学習）へ登録。台帳: `docs/migration-inventory/ccsp-study-guide.json`。原本: `archive/security-certifications/Ccsp-study-guide.html` / `archive/security-certifications/Ccsp-study-guide.md`（バイト一致でアーカイブ済み）。目視確認表: `docs/migration-inventory/ccsp-study-guide-review.md`。
<!-- /ccsp-migration-status -->


## ガイドの表ホバー・参照コード配色修正（2026-10-24）

配色レビュー修正完了。共通proseのOSダーク配色が固定配色のガイドへ混入することが原因。ISC2 CCの全85表ホバーと[S番号]・プライベートIP・CIDR・マスク記号の6コード、他6ガイドの表ホバー、Applied Cryptographyの[S1]を修正。各ガイドのスコープ内のみ変更し、原本の縞模様と既存コードテーマを保持。新規回帰23件と全1212件/196ファイル成功（499,187 expect）、lint・型チェック成功。原本なし環境でも新規23件成功。Chrome実画面375/1440px×明暗4条件で全85表と6コードを確認。16ガイド×明暗の共通CSS比較は差分0。さらに修正7ガイドの全表セルを明暗14条件（8146セル評価）で検証し、固有の背景・縞模様の変化なし。ビルド未実行。修正コミット `6399898`。

調査記録: `docs/migration-inventory/guide-readability-review.json`。

固定配色の移行ページでは通常表示だけでなく、実際のOS配色と表ホバー、インラインcodeの前景/背景を確認する。原本のcodeにcolor指定がなくても、共通proseの明示色が侵入するため継承を明示する。行の背景リセットは元の縞模様を優先させる。Happy DOMはhover・backgroundショートハンド・勝ったinheritの解決がChromeと異なるため、同じ詳細度で状態/継承をモデル化し、修正を外す負の対照でも元症状を検出する。


<!-- cissp-migration-status -->
## CISSP移行（2026-10-24）

CISSP: `/docs/cissp-guide` へ全18節・147見出し・143表2214セル・42図・108リスト項目・15解答・11チェック項目・25参考文献を移行し、HTML/Markdown原本を `archive/security-certifications/` へ両SHA-256一致でアーカイブ済み。専用97件/11ファイル成功。原本なし隔離環境でも55成功/42skip/0失敗（全18節とヒーロー・目次等の構造ハッシュ22件を含む）。全CSS宣言とmedia条件、5幅×明暗の計算済みCSS、丸点・番号・カウンター・図の自然幅と横スクロール、全143表と全ページのhydration、目次・図・確認問題・チェック操作を検証。全体1309成功/0skip/0失敗（207ファイル、503,825 expect）。共通ナビ・ホーム・静的検索は30ページ。既存CCIE/CCSTの資格ナビ期待値もCISSP登録に同期。npm経由のテスト・lint・型チェック成功。Next.js開発サーバーでHTTP 200と配信本文の件数一致を確認。Next.jsビルド禁止・未実行、目視はユーザー担当・未確認。移行Green `4c9fbee`、アーカイブGreen `2e279ff`。

配置: `security-docs/src/app/docs/cissp-guide/page.mdx`。台帳: `docs/migration-inventory/cissp-guide.json`。目視確認表: `docs/migration-inventory/cissp-guide-review.md`。原本: `archive/security-certifications/Cissp-guide.html` / `archive/security-certifications/Cissp-guide.md`（Git管理外）。
<!-- /cissp-migration-status -->


<!-- iso27001-html-status -->
## ISO27001 HTML画面更新（2026-10-24）

ISO27001 HTML更新: 既存 `/docs/iso-iec-27001-2022-guide` を元HTMLの全17章・66見出し・36表845セル・13図・40リスト項目・16チェック項目・43出典カードで更新。独自の丸点・丸囲み番号とグループ別チェック番号、全CSS/media、5幅×明暗のCSS、全845セルのホバー、全表とページのhydration、目次・図・チェック操作を検証。全17章とヒーロー/目次/フッター等22構造SHA-256は原本なしでも検証する。専用100件/12ファイル成功。原本なし隔離環境59成功/41skip/0失敗。全体1403成功/0skip/0失敗（218ファイル、507,982 expect）。既存30ルートとナビ表示名を維持し、静的/動的検索の66見出しを同期。原本は `archive/standards/iso-iec-27001-2022-guide-2026-10-24/` 内へHTML/Markdownを両SHA-256一致でアーカイブ済み。内容の異なる以前のMarkdown（`archive/standards/Iso-27001-2022-beginner-guide.md`）もハッシュ不変で保持。npm経由のテスト・lint・型チェック成功。既存開発サーバーのHTTP 200で全件数と22構造ハッシュの一致も確認。ビルド禁止・未実行、目視はユーザー担当・未確認。前半Green `05756c9`、後半Green `db5f859`、アーカイブGreen `a213e46`。

配置: `security-docs/src/app/docs/iso-iec-27001-2022-guide/page.mdx`。原本のdark配色を専用CSSで保持。台帳: `docs/migration-inventory/iso-iec-27001-2022-guide.json`。目視確認表: `docs/migration-inventory/iso-iec-27001-2022-guide-review.md`。
<!-- /iso27001-html-status -->

<!-- csslp-migration-status -->
## CSSLP移行（2026-10-24）

CSSLP: `/docs/csslp-guide` へ全16章・130見出し・97表1566セル・16図・3コード・16参考ソースを移行し、HTML/Markdown原本を `archive/security-certifications/` へ両SHA-256一致でアーカイブ済み。専用96件/12ファイル成功。原本なし隔離環境62成功/34skip/0失敗（全16章とブランド/ヒーロー/目次の19構造ハッシュは原本なしでも検証）。全CSS宣言/media、5幅×明暗のCSS、丸点・番号・参考番号、全97表のホバー、目次/図操作、全表とページのhydrationを検証。全体1499成功/0skip/0失敗（230ファイル、511,065 expect）。資格ナビ・ホーム・静的/動的検索は31ページ・CSSLPの130見出しを収録。npm経由テスト・lint・型チェック成功。Next.js開発サーバーのHTTP 200で全15件数項目と19構造ハッシュの一致も確認。ビルド禁止・未実行、目視はユーザー担当・未確認。移行Green `d53c0ed`、アーカイブGreen `db89d6e`、ホバー修正Green `4565411`。最新デザイン: 下記「CSSLP練習問題・図解デザイン改善」を参照。

配置: `security-docs/src/app/docs/csslp-guide/page.mdx`。原本: `archive/security-certifications/Csslp-guide.html` / `archive/security-certifications/Csslp-guide.md`。台帳: `docs/migration-inventory/csslp-guide.json`。目視確認表: `docs/migration-inventory/csslp-guide-review.md`。
<!-- /csslp-migration-status -->

<!-- csslp-design-status -->
## CSSLP練習問題・図解デザイン改善（2026-10-24）

CSSLPデザイン改善: 第13章の全10問を番号・設問・40選択肢に分けたカードへ整理。スマートフォンは1列、768px以上は2列の選択肢。解答欄はネイティブdetailsの開閉を保持し、正解バッジと内部フォーカスリングを整備。全16図へ図番号・内容別タイトル・種類表示を追加し、描画面・角丸ノード・曲線の矢印・サンセリフ体・配色を統一。小さい補助文字のコントラスト比4.5以上を検証。図の自然幅・中央寄せ・左端からの横スクロール・遅延描画・再試行・テキスト説明を保持。原文・正解・図定義・両原本のSHA-256は不変。第13章の装飾spanのみ透過した全19構造ハッシュ、問題文10件の固定ハッシュ、全40選択肢、3幅のデザインを検証。他章は5幅×明暗の原本CSS比較を継続。専用96件/12ファイル成功、原本なし隔離環境62成功/34skip/0失敗。全体1499成功/0skip/0失敗（230ファイル、511,065 expect）。npm test・lint・型チェック成功。HTTP 200の配信HTMLで40選択肢・16図見出しと全件数・19構造ハッシュの一致を確認。Red `047a0b7` → Green `173382a`、文字コントラストRed `395d578` → Green `6c2ef93`。ビルド禁止・未実行、目視はユーザー担当・未確認。
<!-- /csslp-design-status -->

<!-- cyberops-migration-status -->

## CyberOps Associate移行（2026-10-24）

移行・アーカイブ完了: `/docs/cyberops-associate-guide`。全12章・76小節（section計88）・153見出し・135表2706セル・42図・6コード・本文26リスト118項目・36チェック・25問100選択肢を保持。全CSS/media・丸点/番号カウンター・5幅×明暗・全セルホバー・全表/ページhydration・採点3評価帯/解答表示/両リセット・目次/チェック/図操作を検証。専用80件/10ファイル、原本なし隔離環境48成功/32skip/0失敗。全体1582成功/0skip/0失敗（240ファイル、534,027 expect）。資格ナビ・ホーム・静的/動的検索は32ページ（全153見出しを収録）。ロジック単位96/96（従来91＋GuideSidebar/GuideRuntime/MermaidFigure/GuideIcon/CodeSample）。HTML/Markdownを `archive/security-certifications/` へ両SHA-256一致でアーカイブ済み（Git管理外）。npm test・lint・型チェック成功。HTTP 200配信HTMLも16件数/16構造ハッシュ一致。表示基盤Red e694e3e→Green a8caf1e、本文Red b407224・ホバーRed d17d525→Green 451d28d、アーカイブRed 9b206d1→Green 8980a07。目視確認表: `docs/migration-inventory/cyberops-associate-guide-review.md`。ビルド禁止/未実行、目視はユーザー担当/未確認。

配置: `security-docs/src/app/docs/cyberops-associate-guide/page.mdx`。台帳: `docs/migration-inventory/cyberops-associate-guide.json`。npm使用・ビルド禁止/未実行・目視はユーザー担当/未確認。

<!-- /cyberops-migration-status -->

<!-- cyberops-hover-status -->

## CyberOps表ホバー修正（2026-10-25）

ホバー修正完了。Red 17a2859 → Green 38f4aba（専用CSSのみ）。強化した単体7件成功、CyberOps専用83件/10ファイルを含む全体1585成功/0skip/0失敗（240ファイル、520,277 expect）。原本なし隔離環境51成功/32skip/0失敗。実Chromeは375/1440px×明暗4条件・全135表2706セル（合計10824セル条件）の背景/文字/罫線変化0セル、実ポインターの奇数/偶数行12チェックも成功。修正前は全4条件で各1253セルの背景変化を検出。未解決Tailwind importをテスト用CSSから除去し、共通ホバールールの読込ガードを追加。製品CSSのimportや共通ホバーは変更せず、他ガイドへの適用もない。HTML/Markdown原本・本文・構造ハッシュは不変。npm test・lint・型チェック成功。ビルド未実行。

共通 `.prose tr:hover td` が専用 `td` より高い詳細度を持つため、OSダーク設定で背景 #18181b / 文字 #161B26 となっていた。Happy DOM用CSSに未解決のTailwind importを残すと共通ルールを評価できないため、テスト用にimportだけを除去する。実ブラウザー検証: Playwrightが利用可能な環境で `npm exec --package=playwright --call "node src/app/docs/cyberops-associate-guide/hover.browser.mjs"`（security-docs内、起動済み開発サーバーを使用）。`PLAYWRIGHT_MODULE_PATH` / `CHROME_PATH` / `DOCS_BASE_URL` も指定可。npm使用・ビルド禁止/未実行・目視はユーザー担当。

<!-- /cyberops-hover-status -->

<!-- cyberops-professional-status -->

## CyberOps Professional移行（2026-10-25）

移行・アーカイブ完了: `/docs/cyberops-professional-guide`。全134本文ブロック・135見出し・122表2051セル・42図・20コード（8言語表記）・15確認問題と解答・61参考文献・57ul/14ol/190項目を保持。原本比較＋全137固定構造SHA-256・全20コードの改行/空白SHA・全CSS/media・5幅×明暗の計算済みCSS・全表/ページhydration・目次と問題の個別/一括開閉を検証。Chromeは375/1440px×明暗4条件で全2051セルのホバー変化0、全190項目の金色丸点/丸囲み番号/14カウンターリセット、実ポインター12チェックが成功。専用330件/12ファイルを含む全体1920成功/0skip/0失敗（252ファイル、526,543 expect）。原本なし隔離環境175成功/155skip/0失敗。資格ナビ・ホーム・静的/動的検索は33ページ（全135見出しを収録）。ロジック単位101/101（従来96＋GuideSidebar/GuideRuntime/GuideIcon/MermaidFigure/CodeSample）。HTML/Markdownを `archive/security-certifications/` へ両SHA-256一致でアーカイブ済み（Git管理外）。HTTP 200実配信も16件数/137構造ハッシュ/20コードハッシュ一致。npm test・lint・型チェック成功。TDD: 表示基盤adf5aee→2fc814b、前半0eccd25→a3c179f、後半ae61e93→676fba2、アーカイブf427b65→c97a37d。目視確認表: `docs/migration-inventory/cyberops-professional-guide-review.md`。ビルド禁止/未実行、目視はユーザー担当/未確認。

配置: `security-docs/src/app/docs/cyberops-professional-guide/page.mdx`。台帳: `docs/migration-inventory/cyberops-professional-guide.json`。npm使用・ビルド禁止/未実行・目視はユーザー担当/未確認。

<!-- /cyberops-professional-status -->

<!-- threat-modeling-shostack-status -->

## Threat Modeling (Shostack) 移行（2026-10-25）

移行・アーカイブ完了: `/docs/threat-modeling-shostack-guide`。全17章（`section.chapter` 17）・82見出し（h1:1 / h2:17 / h3:60 / h4:4）・52表944セル（th:152 / td:792）・9図・2コード（Markdown / Python）・2演習解答（`details.answer`）・12注意欄（`.callout`）・22参考文献（`.ref-card`）・77目次リンク（17グループ）・81固有IDを保持。原本比較＋全22固定構造SHA-256（`.hero`/`.brand`/`.sidebar nav`/`.sidebar-foot`/`.footer`＋17章）・全2コードの改行/空白SHA・全CSS/media・5画面幅（375/640/768/1024/1440px）×明暗両配色の計算済みCSS・リスト丸点（`ul` の `list-style-type: disc`）と番号（`ol`）・ステップバッジ・空セルダッシュ表示・全944セルホバー（`#0b1a2e`）・インラインcode継承・全52表とページ全体のhydration・目次操作/フォーカストラップ/hashchange/スクロールスパイ・Mermaid遅延描画/110px余白/再試行/テキスト説明を検証。専用98件/12ファイルを含む全体2018成功/0skip/0失敗（264ファイル、544,760 expect）。原本なし隔離環境は専用60成功/38skip/0失敗。Security Guidesナビ・ホーム・静的/動的検索は34ページ（全82見出しを収録）。ロジック単位105/105（従来101＋GuideSidebar/GuideIcon/MermaidFigure/CodeSample）。HTML/Markdownを `archive/security-guides/` へ両SHA-256一致でアーカイブ済み（Git管理外）。npm test・lint・型チェック成功。TDD: 段階1（表示基盤）Red `aede778` → Green `ea1c415`、段階2（第1〜8章）Red `0c3a089` → Green `c36c81d`、段階3（第9〜17章・統合・スタイル・可読性）Red `39158e8` → Green `5259c9e`、段階4（原本アーカイブ）Red `b0cde59` → Green `37b12b2`。目視確認表: `docs/migration-inventory/threat-modeling-shostack-guide-review.md`。ビルド禁止/未実行、目視はユーザー担当/未確認。

配置: `security-docs/src/app/docs/threat-modeling-shostack-guide/page.mdx`。台帳: `docs/migration-inventory/threat-modeling-shostack-guide.json`。原本: `archive/security-guides/Threat-modeling-shostack-guide.html` / `archive/security-guides/Threat-modeling-shostack-guide.md`。npm使用・ビルド禁止/未実行・目視はユーザー担当/未確認。

<!-- /threat-modeling-shostack-status -->

<!-- ghost-wires-migration-status -->
2026-10-25 Ghost in the Wires: `/docs/ghost-in-the-wires-guide` 移行・原本アーカイブ完了。全17節・58見出し・20表332セル・65リスト項目・年表10項目・8解答・41出典・6図を保持。専用91件/8ファイルを含む全体2109成功/0skip/0失敗（272ファイル、548,280 expect）。原本なし隔離環境55成功/36skip/0失敗。実配信HTTP 200で16件数/21構造SHA-256一致。Chrome 5幅×明暗10条件で文字・リスト点/番号・年表・全332セルホバー差分0。375/1440pxで6図の実SVG描画と左右スクロール、目次、8解答、smooth/reduced-motionを操作し実行時エラー0。原本HTML/Markdownは `archive/security-guides/` に両SHA-256一致で保存（Git管理外）。Security Guides・ホーム・静的/動的検索35ページへ登録。ロジック単位108/108。npm test・lint・型チェック成功。ビルド禁止/未実行・目視はユーザー担当/未確認。
配置: `security-docs/src/app/docs/ghost-in-the-wires-guide/page.mdx`。TDD: 表示基盤cd22987→b82025d、本文9110dd5/8d8ef36→d2b15dc、アーカイブ3ddf7b5→23c8512、目次補完801f666→8b993ad。台帳: `docs/migration-inventory/ghost-in-the-wires-guide.json`。目視確認表: `docs/migration-inventory/ghost-in-the-wires-guide-review.md`。
<!-- /ghost-wires-migration-status -->

<!-- hacking-exploitation-status -->
## Hacking: The Art of Exploitation移行（2026-10-25）

2026-10-25 Hacking: The Art of Exploitation: `/docs/hacking-art-of-exploitation-guide` 移行・原本アーカイブ完了。全12章・68見出し・20表341セル・8図・Cコード2件・21参考文献・7注意欄・18リスト項目（本文6/目次12）を保持。全17固定構造SHA-256・コードの改行/空白SHA・全CSS/media・ローカル構文配色・5幅×明暗のCSS・全表/ページhydrationを検証。Chrome10条件で文字/リスト丸点/章番号バッジ/全341セルホバー差分0、375/1440pxで全8図の実描画・自然幅/左右スクロール・目次/配慮設定が成功（pageErrors 0）。専用83件/9ファイル成功、原本なし隔離環境52成功/31skip/0失敗。全体2192成功/0skip/0失敗（281ファイル、550,252 expect）。Security Guides・ホーム・静的/動的検索36ページへ登録（全68見出し）。ロジック単位112/112（従来108＋GuideSidebar/GuideIcon/MermaidFigure/CodeSample）。HTML/Markdownは `archive/security-guides/` へ両SHA-256一致で保存（Git管理外）。HTTP 200で13件数/17構造SHA-256一致。npm test・lint・型チェック成功。ビルド禁止/未実行、目視はユーザー担当/未確認。

配置: `security-docs/src/app/docs/hacking-art-of-exploitation-guide/page.mdx`。台帳: `docs/migration-inventory/hacking-art-of-exploitation-guide.json`。目視確認表: `docs/migration-inventory/hacking-art-of-exploitation-guide-review.md`。TDD: 表示基盤a9ed7b0→aedb368、前半af97a26（ユーザー承認の復旧後）→8359341、後半/装飾fdaf555・a86dc51・454aff4→41ae1a8、アーカイブb9117cd→4915ef5。
<!-- /hacking-exploitation-status -->








<!-- iso29100-status -->
## ISO/IEC 29100:2024 移行（2026-10-26）

移行・原本アーカイブ完了: /docs/iso-iec-29100-2024-guide。全16節・96見出し・41表937セル・12図・4コード・125リスト項目・10問・26出典を保持。全20構造SHA-256・コードの空白SHA・全CSS/media・5幅×明暗・リスト丸点/丸囲み番号/カウンター・全セルホバー・全表/ページhydrationを検証。専用92件/9ファイルを含む全体2295成功/0skip/0失敗（290ファイル、553,875 expect）。原本なし隔離環境58成功/34skip/0失敗。Chrome10条件差分0、375/1440pxのHTTP200で全件数/20構造/4コードSHA一致・全12図描画と左右スクロール・目次/10問/配慮設定成功（pageErrors0）。原本HTML/Markdownはarchive/standards/へ両SHA-256一致で保存済み（Git管理外）。原本の16重複IDは節へ集約し全126固有ID保持。ナビ/ホーム/静的・動的検索は37ページ。ロジック117/117（従来112＋GuideSidebar/GuideRuntime/GuideIcon/MermaidFigure/CodeSample）。npm test・lint・型チェック成功。ビルド禁止/未実行、目視はユーザー担当/未確認。TDD: 基盤1ab5ad3→34f8e35、本文4e7cf0e/6cf2612/7cddc81/d040e06→2903a9e、アーカイブ2a133af→61c0861。目視確認表: docs/migration-inventory/iso-iec-29100-2024-guide-review.md。 未移行のルート原稿: CGRC、ISSAP、ISSEP、SSCP、ISO/IEC24759（HTML3件/Markdown5件）。

配置: `security-docs/src/app/docs/iso-iec-29100-2024-guide/page.mdx`。台帳: `docs/migration-inventory/iso-iec-29100-2024-guide.json`。npm使用・ビルド禁止/未実行・目視はユーザー担当/未確認。
<!-- /iso29100-status -->









<!-- issap-status -->
## ISSAP 移行（2026-10-26）

原本アーカイブRed: 新規4件が全件失敗し、ルート原本の残存・HTML/Markdownの移動先・比較パスが未完了であることを検出。専用84件/9ファイル登録（本文80件は成功済み）。次に両原本をarchive/security-certifications/へSHA-256不変で移動する。

配置: `security-docs/src/app/docs/issap-guide/page.mdx`。台帳: `docs/migration-inventory/issap-guide.json`。npm使用・ビルド禁止/未実行・目視はユーザー担当/未確認。
<!-- /issap-status -->
