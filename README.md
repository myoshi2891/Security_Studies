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
