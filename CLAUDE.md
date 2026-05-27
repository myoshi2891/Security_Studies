# CLAUDE.md

Updated 2026-05-27

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
├── security-docs/          # Next.js 16.2.x アプリ (本体)
│   ├── netlify.toml            # Netlify ビルド設定（@netlify/plugin-nextjs）
│   ├── .nvmrc                  # Node.js バージョン固定 (22)
│   ├── Dockerfile              # マルチステージビルド
│   ├── .dockerignore           # ビルドコンテキスト除外
│   ├── src/
│   │   ├── app/
│   │   │   ├── docs/       # ドキュメントページ (各 page.mdx)
│   │   │   │   ├── approach/, architecture/, owasp/, ...
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
