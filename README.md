# Security Studies

Next.js 16.2.2 (App Router) と カスタム MDX コンポーネントを活用した、セキュリティ学習のためのドキュメントアプリケーションです。Fumadocs は廃止済みで、`@next/mdx` と独自の React コンポーネント群でコンテンツを構築しています。

## 概要

本リポジトリには、以下の重要なセキュリティトピックに関する学習資料とドキュメントが含まれています。

- SDLC (ソフトウェア開発ライフサイクル)
- OWASP
- AI セキュリティ
- AI コーディング
- サプライチェーンセキュリティ
- PQC (耐量子計算機暗号)

## プロジェクト構造

- `security-docs/`: ドキュメントサイトのメインとなる Next.js アプリケーションディレクトリです。
  - `src/app/docs/`: 実際のドキュメントコンテンツ (MDX 形式) が格納されています。各トピックは `<slug>/page.mdx` 形式です。
  - `src/components/docs/`: MDX 内で使用するカスタム React コンポーネント群です。
  - `src/config/docs.ts`: サイドバーナビゲーション設定です。
  - `src/proxy.ts`: Next.js Proxy（旧 Middleware）。静的な `Content-Security-Policy` ヘッダー（`script-src 'self' 'unsafe-inline'`）を付与します。nonce / `'strict-dynamic'` は Netlify Next.js Runtime との nonce 競合（Issue [#32](https://github.com/myoshi2891/Security_Studies/issues/32)）により廃止済みです。
- `docs/`: ビルド不要の静的ダッシュボード群です。`test-coverage-dashboard.html` / `test-coverage-dashboard.css` を含みます。
- `md/`: MDX ページの原稿となる Markdown ソースファイルです。
- `html/`: `gen_security_html.sh` で生成されたレガシーな静的 HTML ドキュメントです。

## Docker を使った開発・本番環境

プロジェクトルートに `Makefile` と `docker-compose.yml` が配置されています。

### 前提条件

- Docker Engine 26+
- Docker Compose v2+

### 開発サーバー（ホットリロード付き）

```bash
make dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。
`security-docs/` 以下のファイルを編集すると即座に反映されます。

### 本番ビルドと起動

```bash
make build   # Docker イメージのビルド
make up      # 本番コンテナの起動（バックグラウンド）
make logs    # ログの確認
make down    # コンテナの停止
```

### その他のコマンド

```bash
make shell   # 実行中の dev コンテナにシェルで接続
make test    # Bun テストスイートの実行（コンテナ内）
make clean   # コンテナ・イメージ・ボリュームの完全削除
make help    # コマンド一覧の表示
```

### Docker 関連ファイル構成

```
Security_Studies/
├── Makefile                    # Docker 操作ショートカット
├── docker-compose.yml          # dev/prod サービス定義
└── security-docs/
    ├── Dockerfile              # マルチステージビルド（deps/builder/runner）
    ├── .dockerignore           # ビルドコンテキスト除外リスト
    ├── netlify.toml            # Netlify ビルド設定
    └── .nvmrc                  # Node.js バージョン固定 (22)
```

## Netlify デプロイ（Free Plan）

`main` ブランチへの push でビルド・デプロイが自動実行される（GitHub 連携）。

- 設定: `security-docs/netlify.toml`
- ビルド: `bun install --frozen-lockfile && bun run build`
- プラグイン: `@netlify/plugin-nextjs`（Next.js Runtime v5）
- Deploy Preview: PR ごとに自動生成

> **Docker との共存**: `next.config.ts` が `NETLIFY` 環境変数で `output: 'standalone'` を分岐するため、Docker 運用は変更なしで継続可能。

## はじめに

メインのアプリケーションは `security-docs` ディレクトリ内にあります。パッケージマネージャーとして `bun` を使用しています。

```bash
cd security-docs
bun install
```

### 開発用サーバーの起動

開発用サーバーを起動するには、以下のコマンドを実行します。

```bash
bun run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開き、結果を確認してください。

### ビルドと本番環境

`next.config.ts` は `NETLIFY` 環境変数が未設定のとき `output: 'standalone'` を有効にするため、
`bun run start`（= `next start`）はそのままでは動作しません。以下の 3 つの方法から選択してください。

**オプション 1: standalone を無効化して起動**（`NETLIFY=true` で standalone を無効化）

```bash
cd security-docs
NETLIFY=true bun run build
bun run start
```

**オプション 2: standalone ビルドを直接起動**（`output: 'standalone'` のまま使う場合）

```bash
cd security-docs
bun run build
node .next/standalone/server.js
```

**オプション 3: Docker で本番環境を再現（推奨）**

```bash
# プロジェクトルートで実行
make build && make up
```

### 型チェック・リント

```bash
bun run types:check  # TypeScript 型チェック
bun run lint         # ESLint v9 (eslint . を直接呼ぶ)
```

## CI（GitHub Actions）

`.github/workflows/ci.yml` が `main` / `dev` への push および PR で自動実行されます。

1. `bun install --frozen-lockfile`
2. `bun run lint`
3. `bun run types:check`
4. `bun test`

## 開発の規約

- **コンテンツの作成:** 新しいドキュメントコンテンツはすべて MDX で作成し、`security-docs/src/app/docs/<slug>/page.mdx` に配置してください。追加後は `src/config/docs.ts` にもエントリを追加してください。
- **スタイリング:** プロジェクトでは Tailwind CSS (v4) を使用しています。カスタムコンポーネントにスタイルを追加する際は、Tailwind のユーティリティクラスを利用してください。
- **型安全性:** 変更をコミットする前に `bun run types:check` を実行し、プロジェクト全体の型安全性を確認してください。
- **リント:** コミット前に `bun run lint` を実行してください。`_` プレフィックスの未使用引数は警告対象外です。
