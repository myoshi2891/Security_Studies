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

→ **後述の対応 5 で追加修正**（Netlify が2本目のインラインスクリプトも注入していることが判明）

---

## 対応 5 — 本番 Netlify での `script-src` 違反（2本目のインラインスクリプト）

### エラー内容

```
Loading the script '<URL>' violates:
"script-src 'self' 'nonce-...' 'strict-dynamic' 'sha256-OBTN3RiyCV4Bq7dFqZ5a2pAXjnCcCYeTJMO2I/LYKeo='"

Executing inline script violates script-src.
Hash: 'sha256-F+nsqe/0sV8PrfMTfANWaYSWTSfnhRmJ9+Gt3npr1RY='
```

CSP ヘッダーに `sha256-OBTN3...` が含まれていることを確認 → 対応 4 の `IS_NETLIFY` 修正は機能していた。

### 根本原因

Netlify は HTML に独立したインラインスクリプトを **2本**直接埋め込む。2本は親子関係になく、`'strict-dynamic'` の伝播では信頼されない。

```
HTML に直接注入（独立）:
  <script>...OBTN3のコード...</script>   ← 対応 4 で許可済み ✓
  <script>...F+nsqeのコード...</script>  ← 今回判明 ✗
    └── /.netlify/scripts/cdp を動的ロード（strict-dynamic で伝播）
```

### 影響度

| 項目 | 状態 |
|---|---|
| ドキュメント閲覧・検索・ナビゲーション | 正常 ✓ |
| Netlify Analytics (CDP) | 停止 ✗ |
| セキュリティリスク | なし（意図通りブロック） |

### 修正内容

`proxy.ts` の `netlifyInlineHash` に2本目のハッシュを追加:

```typescript
const netlifyInlineHash = process.env.IS_NETLIFY
  ? ` 'sha256-OBTN3RiyCV4Bq7dFqZ5a2pAXjnCcCYeTJMO2I/LYKeo=' 'sha256-F+nsqe/0sV8PrfMTfANWaYSWTSfnhRmJ9+Gt3npr1RY='`
  : '';
```

---

## 最終的な CSP 構成

### `proxy.ts` の出力（環境別）

| 環境 | script-src | style-src |
|---|---|---|
| ローカル dev | `'self' 'nonce-...' 'strict-dynamic' 'unsafe-eval'` | `'self' 'unsafe-inline'` |
| Netlify 本番 / Deploy Preview | `'self' 'nonce-...' 'strict-dynamic' 'sha256-OBTN3...' 'sha256-F+nsqe...'` | `'self' 'nonce-...'` |
| Docker 本番（非 Netlify） | `'self' 'nonce-...' 'strict-dynamic'` | `'self' 'nonce-...'` |

### 全ディレクティブ（Netlify 本番）

```
default-src 'self';
script-src 'self' 'nonce-<uuid>' 'strict-dynamic'
           'sha256-OBTN3RiyCV4Bq7dFqZ5a2pAXjnCcCYeTJMO2I/LYKeo='
           'sha256-F+nsqe/0sV8PrfMTfANWaYSWTSfnhRmJ9+Gt3npr1RY=';
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
| `security-docs/src/proxy.ts` | `styleSrc` dev/prod 分岐・`netlifyInlineHash` 検出ロジック修正・2本目の Netlify hash 追加 |

---

## 注意事項・今後の対応

### Netlify CDP ハッシュの更新が必要なケース

現在許可している2つのハッシュは Netlify のインラインスクリプト内容に基づく固定値。Netlify がスクリプトを更新した場合はハッシュが無効になる。

| ハッシュ | 対象 |
|---|---|
| `sha256-OBTN3...` | Netlify CDP インラインスクリプト 1本目 |
| `sha256-F+nsqe...` | Netlify CDP インラインスクリプト 2本目 |

**確認方法**: ブラウザコンソールで同エラーが再発した際、メッセージ内に新しい `sha256-...` が提示される。その値で `proxy.ts` の `netlifyInlineHash` を更新する。

### 本番環境での style-src 違反の可能性

`font-styles.tsx`（Next.js フォントフォールバック）と `react-dom-client.production.js`（React 19 style ホイスティング）は本番でも `<style>` を注入する可能性がある。現時点では本番での報告なし。発生した場合は hash を追加するか、Next.js のバージョンアップによる自動 nonce 対応を待つ。

---

## 対応 6 — 根本原因判明: Netlify が独自 nonce を上書き生成（2026-05-19 追記、対応延期）

### エラー内容（継続中）

対応 5 完了後も以下が継続している:

```
Loading the script '<URL>' violates: script-src 'self' 'nonce-YjUwMmU1MTgt...' 'strict-dynamic' ...
Executing inline script violates: Either a hash or a nonce ('nonce-...') is required.
（計9件 / 本番ページロードごとに発生）
```

### HTML ソース調査結果

ブラウザコンソールで収集した HTML ソースを分析した結果、**3種類の nonce が独立して存在する**ことが確認された。

| nonce | 値（冒頭12文字） | 形式 | 発生源 |
|---|---|---|---|
| **CSP ヘッダー** | `YjUwMmU1MTgt...` | 44文字 base64(UUID) | `proxy.ts`: `btoa(crypto.randomUUID())` |
| **`<script>` タグ属性** | `TZQiqTeMr9br...` | 32文字英数字 | Netlify レンダリング（未知の生成器） |
| **RSC flight data 内部** | `M2QzY2UxODQtMW...` | 44文字 base64(UUID) | Next.js レンダリングコンテキスト |

```html
<!-- 実際の HTML ソース（抜粋） -->
<script src="/_next/static/chunks/0unxv2zna.dqr.js"
  nonce="TZQiqTeMr9br83lH0ntOPv8ERIv48OtT" async></script>
<script nonce="TZQiqTeMr9br83lH0ntOPv8ERIv48OtT">
    (self.__next_f = self.__next_f || []).push([0])
</script>
```

CSP ヘッダー: `'nonce-YjUwMmU1MTgt...'`
script 属性: `nonce="TZQiqTeMr9br..."` ← **不一致 → 全スクリプトがブロック**

### 根本原因

`proxy.ts`（Edge Middleware）と `@netlify/plugin-nextjs`（Next.js レンダリング関数）が **独立した nonce 生成サイクルを持っており互いを無視している**。

```
proxy.ts (Edge Function):
  1. btoa(crypto.randomUUID()) → nonce A = "YjUwMmU1MTgt..."
  2. x-nonce: A をリクエストヘッダーにセット
  3. CSP レスポンスヘッダー: 'nonce-A'
       ↓
@netlify/plugin-nextjs (Lambda/Rendering):
  4. x-nonce: A を受け取るが「使用しない」or「上書きする」
  5. 独自の nonce B = "TZQiqTeMr9br..." を生成（32文字英数字形式）
  6. 全 <script> タグに nonce="B" を付与
       ↓
ブラウザ:
  CSP: 'nonce-A'  vs  <script nonce="B">  → 不一致 → 全スクリプトブロック
```

証拠:
- nonce の生成形式が異なる（44文字 base64 vs 32文字英数字）
- `layout.tsx` の `headers().get('x-nonce')` が取得する値さえも3番目の別 UUID
- 計3種類の nonce が同一ページに存在する

### 試みた対応（効果なし）

| 対応 | 変更内容 | 結果 |
|---|---|---|
| `layout.tsx` 修正 | `await headers()` → `(await headers()).get('x-nonce')` | 変化なし（root cause は Netlify 層） |

### 対応方針（延期）

根本修正には `@netlify/plugin-nextjs` の nonce 生成を抑制するか、proxy.ts の nonce を Netlify のレンダリングが採用する仕組みが必要。Netlify の内部アーキテクチャへの依存度が高く、コストが見合わないため **GitHub Issue に記録し対応を延期**する。

現実的な解決策の候補（優先順）:

| 案 | 内容 | コスト | 副作用 |
|---|---|---|---|
| A | proxy.ts の nonce 生成を廃止し、hash ベースの CSP に切り替える | 中 | コンテンツ変更のたびにハッシュ更新が必要 |
| B | `@netlify/plugin-nextjs` の nonce 設定 API を調査し CSP nonce を一本化する | 高 | Netlify サポートへの問い合わせが必要 |
| C | `'strict-dynamic'` を除去し `'self'` + Netlify ドメインの allowlist に切り替える | 低 | strict-dynamic の保護が失われる |

**GitHub Issue**: [myoshi2891/Security_Studies#32](https://github.com/myoshi2891/Security_Studies/issues/32) で追跡。

---

## 対応 7 — Issue #32 解消（hash-based CSP 移行 / 2026-05-19）

対応方針 **A**（nonce 廃止と hash ベース CSP への切り替え）を採用。実装過程で以下の技術制約が判明したため、文字通りの "hash-only" ではなく **`'self' 'unsafe-inline'` ベースの静的 CSP** を最終形とした。

### 判明した実装制約

| 制約 | 詳細 |
|---|---|
| Next.js Flight data の inline script | App Router は `(self.__next_f = self.__next_f \|\| []).push([...])` 形式のページ固有 inline script を出力する。内容がページ毎に変動するため事前ハッシュ化は不可能。 |
| CSP Level 3 の競合ルール | `script-src` に hash と `'unsafe-inline'` を併記するとブラウザは `'unsafe-inline'` を**無視**する。両立による hybrid 案は技術的に成立しない。 |
| `'strict-dynamic'` の前提 | nonce/hash 付き親スクリプトからの伝播信頼機能のため、nonce を外すと `'self'` が ignore され Next.js 外部チャンクも読めなくなる。nonce 廃止と同時に削除が必須。 |

### 変更内容

| ファイル | 変更概要 |
|---|---|
| `security-docs/src/proxy.ts` | nonce 生成 / `x-nonce` ヘッダ送出 / `'strict-dynamic'` / Netlify 用 sha256 hash を全て削除。`script-src` / `style-src` を `'self' 'unsafe-inline'` ベースの静的構成に変更（dev のみ `'unsafe-eval'` 追加）。 |
| `security-docs/src/app/layout.tsx` | `headers().get('x-nonce')` の読取を削除。`async` を解除し同期コンポーネント化。`import { headers }` も除去。 |
| `security-docs/next.config.ts` | `env.IS_NETLIFY` セクションを削除（Netlify hash 検出用途が消滅したため）。 |
| `CLAUDE.md` (ルート) | 「セキュリティ (CSP / Proxy)」セクションを新設定に書き換え。Issue #32 を理由として明記。 |
| `security-docs/CLAUDE.md` | Technical Standards の "Security / CSP" 段落を新設定に書き換え。"Do not remove 'strict-dynamic'" の警告を撤回。 |

### 最終的な CSP 構成（Netlify 本番 / Docker / Deploy Preview 共通）

```
default-src 'self';
script-src 'self' 'unsafe-inline';
style-src 'self' 'unsafe-inline';
img-src 'self' data:;
font-src 'self';
connect-src 'self';
frame-ancestors 'none';
base-uri 'self';
form-action 'self';
```

ローカル開発のみ `script-src` に `'unsafe-eval'`、`connect-src` に `ws://localhost:* ws://127.0.0.1:*` を追加。

### セキュリティトレードオフ

| 項目 | 状態 |
|---|---|
| Inline script ベースの XSS 防御 | **後退**（`'unsafe-inline'` 許可） |
| 第三者ドメインからの script ロード | 引き続き遮断（`default-src 'self'`） |
| Clickjacking | 引き続き防御（`frame-ancestors 'none'`） |
| Base タグ / フォーム改竄 | 引き続き防御（`base-uri 'self'` / `form-action 'self'`） |
| Netlify nonce 上書きによる script ブロック | 解消（CSP 側で nonce を要求しないため `<script nonce="...">` 属性は無視される） |

### 今後の改善余地

将来 `@netlify/plugin-nextjs` が CSP nonce 設定 API を公開した場合（対応 6 の選択肢 B）、nonce + `'strict-dynamic'` の理想形へ復帰を検討する。
