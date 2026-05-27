# globals.css 変更後のキャッシュリセットルール

## 問題

`globals.css`（特に `@theme` ブロックや `@layer base`）を変更した後、`.next` に古い CSS チャンクが残ると、CSS カスタムプロパティ（`--color-bg-primary` 等）が空文字に解決されてページのダークモードが消える。

**症状チェック**（ブラウザコンソールで確認）:

```js
getComputedStyle(document.documentElement).getPropertyValue('--color-bg-primary')
// "" が返る → キャッシュ汚染
// "#0a0e1a" が返る → 正常
```

## ルール

### 必須トリガー

以下のファイルを編集した後は **必ず** `.next` を削除して dev サーバーを再起動する:

- `security-docs/src/app/globals.css`
- `security-docs/src/app/**/*.css`（ページ固有スタイル）
- `security-docs/tailwind.config.*` (※本プロジェクトでは Tailwind v4 と PostCSS を使用しており、個別 config がない場合は globals.css 等のインポート設定)

### 手順

```bash
# 1. dev サーバーを停止（ポート 3000 を使用中の場合）
kill $(lsof -ti:3000) 2>/dev/null

# 2. キャッシュ削除
rm -rf security-docs/.next

# 3. dev サーバー再起動
cd security-docs && bun run dev
```

### Makefile ショートカット（推奨）

Docker 環境を利用している場合は、`make dev-recreate` を実行することでコンテナをキャッシュ破棄の上で再作成できます。

## 背景

Next.js + Tailwind v4 の CSS コンパイルはチャンク単位でキャッシュされる。HMR は JS の変更には追従するが、`@theme` ブロックの変数定義変更はキャッシュ無効化が不完全なことがある。

## 本番ビルド（Docker）でも同じ症状が出る場合

dev サーバーでは正常でも Docker の本番ビルドで CSS 変数が空になるケースがある。

**原因**: Next.js 本番ビルドは CSS をルート単位でチャンク分割する。Tailwind v4 の `@theme` 出力が別チャンクに分離され、特定ページで読み込まれないことがある（ブラウザ警告: "preloaded but not used"）。

**恒久対策**: `globals.css` の `:root {}` ブロックに `@theme` と同じ変数を直接定義する（実施済み）。こうすることで変数定義が常にメインチャンクに含まれる。

**Docker リビルド手順**（`globals.css` 変更後）:

```bash
make down && make build && make up
```
