# CSP 修正対応報告書

**日付**: 2026-05-19  
**対象リポジトリ**: Security_Studies / security-docs (Next.js 16.2.6)  
**ブランチ**: dev

---

## 背景

直近コミット `0459afb` で `shiki` から `highlight.js` へのシンタックスハイライト切り替えを実施。その後、ブラウザコンソールに複数の Content Security Policy (CSP) 違反が報告されたため、原因調査と修正を行った。

---

## 対応 1 — 仕様書の更新

### 変更ファイル

| ファイル | 変更内容 |
|---|---|
| `CLAUDE.md` (ルート) | `<Terminal>` コンポーネント行に `title` プロップと言語自動判定ルールを追記 |
| `security-docs/CLAUDE.md` | Technical Standards に highlight.js (v11) の実装詳細・対応言語・同期コンポーネント化を追記 |
| `.claude/skills/mdx-page-adder/SKILL.md` | `<Terminal>` 行に言語判定ルールとデフォルト言語 (typescript) を明記 |

### 追記内容の要点

`Terminal` コンポーネントの変更点（`shiki` → `highlight.js`）:

- `async` Server Component → 同期 Server Component（Turbopack の動的チャンク生成を回避）
- シンタックスハイライト: `codeToHtml()` → `hljs.highlight()`（同期 API）
- テーマ: `github-dark`（CSS クラスベース、`highlight.js/styles/github-dark.css` として import）
- 対応言語: `bash` / `typescript` / `yaml` / `json` / `markdown`（静的 import でツリーシェイク）
- 言語自動判定: `title` プロップのファイル拡張子から決定（未対応はデフォルト `typescript`）

---

## 対応 2 — Netlify Deploy Preview での `script-src` 違反

### エラー内容

```
Loading the script 'https://deploy-preview-28--security-studies.netlify.app/.netlify/scripts/cdp'
violates: "script-src 'self' 'nonce-...' 'strict-dynamic'"

Executing inline script violates script-src.
Hash: 'sha256-OBTN3RiyCV4Bq7dFqZ5a2pAXjnCcCYeTJMO2I/LYKeo='
```

### 根本原因

Netlify が Deploy Preview の HTML に **CDP (Customer Data Platform) インラインスクリプト** を直接注入する。このスクリプトには nonce がなく、`'strict-dynamic'` によりホストベース許可リスト (`'self'`) が無効化されるためブロックされた。

**`'strict-dynamic'` の動作:**
- nonce / hash を持つスクリプト → 信頼
- nonce / hash を持つスクリプトが動的ロードするスクリプト → 伝播的に信頼
- `<script src>` に nonce がない場合 → `'self'` も含めブロック

### 修正内容（当初）

`proxy.ts` に `process.env.CONTEXT`（Netlify がビルド時にセットする変数）で検出し、インラインスクリプトの sha256 hash を `script-src` に追加した。

```typescript
const netlifyInlineHash = process.env.CONTEXT
  ? ` 'sha256-OBTN3RiyCV4Bq7dFqZ5a2pAXjnCcCYeTJMO2I/LYKeo='`
  : '';
```

→ **後述の対応 4 で最終的に修正**（`process.env.CONTEXT` が Edge Runtime で参照できない問題が発覚）

---

## 対応 3 — ローカル開発環境での `style-src` 違反

### エラー内容

```
devtool-style-inject.js:47   Applying inline style violates style-src 'self' 'nonce-...'
font-styles.tsx:57           Applying inline style violates style-src 'self' 'nonce-...'
react-dom-client.production.js:9197  Applying inline style violates style-src
```

### 根本原因

Next.js / React 19 が開発時に nonce なしで `<style>` 要素を DOM に注入する:

| 発生源 | 内容 |
|---|---|
| `devtool-style-inject.js` | Next.js dev error overlay が `<style>` を注入（開発専用） |
| `font-styles.tsx` | Next.js フォントフォールバック CSS を `<style>` で注入 |
| `react-dom-client.production.js` | React 19 の style ホイスティング機能 |

### 試行 1（失敗）

`'nonce-...' 'unsafe-inline'` を `style-src` に併記。

```
style-src 'self' 'nonce-...' 'unsafe-inline'
```

**結果**: ブラウザが以下を返した:

> Note that `'unsafe-inline'` is ignored if either a hash or nonce value is present in the source list.

**学習**: CSP Level 3 では `script-src` と同様に `style-src` においても、nonce / hash が存在すると `'unsafe-inline'` は自動的に無効化される。

### 試行 2（成功）

`style-src` の dev 設定から nonce を除去し、`'unsafe-inline'` のみにする。

```typescript
const styleSrc = isDev
  ? `'self' 'unsafe-inline'`          // nonce なし → unsafe-inline が有効に機能
  : `'self' 'nonce-${nonce}'`         // prod は nonce のみで厳格に維持
```

**結果**: 開発環境のエラーが解消。

---

## 対応 4 — 本番 Netlify での `script-src` 違反（対応 2 の再発）

### エラー内容

```
Loading the script '<URL>' violates: "script-src 'self' 'nonce-...' 'strict-dynamic'"
Executing inline script violates script-src.
Hash: 'sha256-OBTN3RiyCV4Bq7dFqZ5a2pAXjnCcCYeTJMO2I/LYKeo='
```

CSP ヘッダーに hash が含まれていなかったことを確認。対応 2 の修正が本番で機能していなかった。

### 根本原因

`process.env.CONTEXT` を `proxy.ts`（Edge Runtime）で直接参照していたが、Next.js Edge Runtime はビルド時に `process.env` を文字列置換でインライン展開する際、**`next.config.ts` の `env` セクションで明示した変数のみ**を確実に展開する。`CONTEXT` を宣言していなかったため、実行時に `undefined` となりハッシュが付与されなかった。

```
Netlify ビルド時の動作:
  process.env.CONTEXT (Netlify がセット)
    ↓ next.config.ts の env 未宣言
    ↓ Edge Runtime バンドルでインライン展開されない
    ↓ 実行時 undefined → hash が CSP に付与されない
```

### 修正内容

**`next.config.ts`**: `IS_NETLIFY` を `env` セクションで明示的にビルド時解決

```typescript
const nextConfig: NextConfig = {
  // ...
  env: {
    IS_NETLIFY: process.env.NETLIFY ?? '',
  },
};
```

**`proxy.ts`**: `process.env.CONTEXT` → `process.env.IS_NETLIFY` に変更

```typescript
const netlifyInlineHash = process.env.IS_NETLIFY
  ? ` 'sha256-OBTN3RiyCV4Bq7dFqZ5a2pAXjnCcCYeTJMO2I/LYKeo='`
  : '';
```

**伝播の仕組み:**

```
Netlify ビルド時: NETLIFY=true
  ↓
next.config.ts (Node.js): env.IS_NETLIFY = 'true'
  ↓ Edge Runtime バンドルに文字列として埋め込み
proxy.ts (Edge Runtime): process.env.IS_NETLIFY → '1' (truthy)
  ↓
script-src に 'sha256-OBTN3...' が付与される
  ↓
Netlify CDP インラインスクリプト → hash 一致で信頼 ✓
  strict-dynamic 伝播で /.netlify/scripts/cdp も信頼 ✓
```

---

## 最終的な CSP 構成

### `proxy.ts` の出力（環境別）

| 環境 | script-src | style-src |
|---|---|---|
| ローカル dev | `'self' 'nonce-...' 'strict-dynamic' 'unsafe-eval'` | `'self' 'unsafe-inline'` |
| Netlify 本番 / Deploy Preview | `'self' 'nonce-...' 'strict-dynamic' 'sha256-OBTN3...'` | `'self' 'nonce-...'` |
| Docker 本番（非 Netlify） | `'self' 'nonce-...' 'strict-dynamic'` | `'self' 'nonce-...'` |

### 全ディレクティブ（Netlify 本番）

```
default-src 'self';
script-src 'self' 'nonce-<uuid>' 'strict-dynamic' 'sha256-OBTN3RiyCV4Bq7dFqZ5a2pAXjnCcCYeTJMO2I/LYKeo=';
style-src 'self' 'nonce-<uuid>';
img-src 'self' data:;
font-src 'self';
connect-src 'self';
frame-ancestors 'none';
base-uri 'self';
form-action 'self';
```

---

## 変更ファイル一覧

| ファイル | 変更概要 |
|---|---|
| `CLAUDE.md` | Terminal コンポーネント仕様を更新（highlight.js, 言語判定, style-src 分岐） |
| `security-docs/CLAUDE.md` | highlight.js 実装詳細と Terminal 同期化を Technical Standards に追記 |
| `.claude/skills/mdx-page-adder/SKILL.md` | Terminal の言語判定ルールとデフォルトを明記 |
| `security-docs/next.config.ts` | `env.IS_NETLIFY` を追加し Edge Runtime へ変数を確実に伝播 |
| `security-docs/src/proxy.ts` | `styleSrc` dev/prod 分岐・`netlifyInlineHash` 検出ロジックを修正 |

---

## 注意事項・今後の対応

### Netlify CDP ハッシュの更新が必要なケース

`sha256-OBTN3RiyCV4Bq7dFqZ5a2pAXjnCcCYeTJMO2I/LYKeo=` は Netlify のインラインスクリプト内容に基づく固定値。Netlify がスクリプトを更新した場合はハッシュが無効になる。

**確認方法**: ブラウザコンソールで同エラーが再発した際、メッセージ内に新しい `sha256-...` が提示される。その値で `proxy.ts` の `netlifyInlineHash` を更新する。

### 本番環境での style-src 違反の可能性

`font-styles.tsx`（Next.js フォントフォールバック）と `react-dom-client.production.js`（React 19 style ホイスティング）は本番でも `<style>` を注入する可能性がある。現時点では本番での報告なし。発生した場合は hash を追加するか、Next.js のバージョンアップによる自動 nonce 対応を待つ。
