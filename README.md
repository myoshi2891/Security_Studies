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
    └── .dockerignore           # ビルドコンテキスト除外リスト
```

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

本番用のビルドを作成し、サーバーを起動するには、以下のコマンドを実行します。

```bash
bun run build
bun run start
```

### 型チェック

型チェックと MDX の型生成を行うには、以下のコマンドを実行します。

```bash
bun run types:check
```

## 開発の規約

- **コンテンツの作成:** 新しいドキュメントコンテンツはすべて MDX で作成し、`security-docs/src/app/docs/<slug>/page.mdx` に配置してください。追加後は `src/config/docs.ts` にもエントリを追加してください。
- **スタイリング:** プロジェクトでは Tailwind CSS (v4) を使用しています。カスタムコンポーネントにスタイルを追加する際は、Tailwind のユーティリティクラスを利用してください。
- **型安全性:** 変更をコミットする前に `bun run types:check` を実行し、プロジェクト全体の型安全性を確認してください。
