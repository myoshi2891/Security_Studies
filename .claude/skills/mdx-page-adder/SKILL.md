---
name: mdx-page-adder
description: >
  Converts HTML or Markdown files to MDX pages, places them under
  security-docs/src/app/docs/, and registers the new slug in the sidebar config
  (docs.ts). Use when asked to add or migrate an HTML/MD file as a documentation page.
---

# MDX Page Adder — Security Studies

## Goal

`html/` または `md/` のファイルを受け取り、このプロジェクトの MDX 規約に沿った
`page.mdx` を生成して `security-docs/src/app/docs/<slug>/` に配置し、
サイドバー設定 (`src/config/docs.ts`) への登録まで一貫して行う。

---

## Instructions

### Step 1 — ソースファイルの読み込みとメタデータ抽出

1. 対象ファイルを Read ツールで読み込む。
2. 以下を決定する：
   - `title`：ページ見出しから抽出。YAML で `:` `#` `"` を含む場合はクォートで囲む。
   - `description`：1〜2文の要約。技術的なキーワードを優先して含める。
   - `slug`：後述のアルゴリズムで生成。
3. HTML の場合は `<body>` 内のコンテンツのみ対象とし、`<script>` `<style>` `<iframe>`
   `<form>` `on*` 属性はすべて除去する。`href`/`src` の `javascript:` `data:text/html`
   スキームは拒否してプレースホルダーに置換する。

### Step 2 — スラグ生成

以下の手順でスラグを決定する：

1. タイトルを小文字化・トリム。
2. Unicode を NFKD 正規化し ASCII に変換。変換不能な文字は除去。
3. 空白・記号を `-` に置換。連続ハイフンを単一ハイフンに圧縮。先頭末尾の `-` を除去。
4. 最大 60 文字に切り詰める。
5. Glob で `security-docs/src/app/docs/<slug>/` の存在を確認。
   衝突する場合は `-2`, `-3`, ... を末尾に付加する。

### Step 3 — MDX フロントマターの付与

ファイル先頭に以下を追加する：

```mdx
---
title: "タイトル"
description: "説明文"
---
```

複数行の description は YAML ブロックスカラー (`|`) を使用する。

### Step 4 — MDX コンテンツへの変換

#### HTML → MDX 変換ルール

| HTML 要素 | 変換先 |
|---|---|
| `<h1>`〜`<h6>` | `#`〜`######` |
| `<ul>` / `<ol>` | Markdown リスト |
| `<table>` | `<DataTable>` コンポーネント（後述）または Markdown テーブル |
| `<pre><code>` | コードフェンス（言語名を付与） |
| `<blockquote>` | `<Callout type="info">` |
| `<strong class="warning">` 等 | 内容に応じた Callout type を選択 |
| その他インライン要素 | Markdown 相当に変換 |

#### 利用可能なカスタムコンポーネント

`mdx-components.tsx` でグローバル登録済み。`page.mdx` 内でインポート不要。

| コンポーネント | 用途 | 使用する目安 |
|---|---|---|
| `<HeroSection section="NN" title={...} description="..." chips={[...]}>` | ページトップのヒーロー | 各ページの冒頭に1回 |
| `<SectionCard eyebrow="..." title="..." sub="...">` | セクション区切り | 主要セクションの開始 |
| `<Callout type="info\|warning\|danger\|success\|toxic">` | 注意・警告ボックス | 重要な補足情報 |
| `<HighlightBox color="blue\|red\|yellow\|green">` | 強調ボックス | 定義や重要概念の強調 |
| `<StepTimeline>` | 手順ステップ | 順序のある手順説明 |
| `<CompareGrid>` | 比較グリッド | 複数手法の比較 |
| `<AttackFlow>` | 攻撃フロー図 | 攻撃シナリオの可視化 |
| `<DefenseList>` | 防御策リスト | 対策・推奨事項の列挙 |
| `<Terminal>` | ターミナル表示 | コマンド出力の再現 |
| `<Checklist>` | チェックリスト | 確認事項の列挙 |
| `<DataTable headers={[...]} rows={[...]}>` | テーブル | 表形式データ |
| `<ThreatCard title="..." severity="critical\|high\|medium\|low">` | 脅威カード | インシデント・CVE 情報 |
| `<RiskBadge>` / `<Tag color="red\|blue\|...">` | バッジ・タグ | リスクレベルの明示 |
| `<SourceReferences>` | 出典一覧 | 参照リンクのまとめ |

コンテンツの性質に応じて積極的に活用し、Markdown のみの平文変換は避ける。

### Step 5 — ファイルの書き込み

1. Write ツールで `security-docs/src/app/docs/<slug>/page.mdx` を作成する。
2. **既存ファイルを上書きしない**。衝突した場合は Step 2 のサフィックスルールを再適用する。

### Step 6 — サイドバー登録

`security-docs/src/config/docs.ts` を Read してから、適切な `sidebarNav` グループに
以下のエントリを Edit で追加する：

```typescript
{ title: "<Extracted Title>", href: "/docs/<slug>" }
```

グループの選定基準（既存 `docsConfig` 構造を参照）：

- `Getting Started`：概要・アーキテクチャ系
- `Security Guides`：特定技術・手法のガイド
- `Advanced Topics`：OWASP・PQC・サプライチェーンなど専門トピック
- `Resources`：認定・参考資料

### Step 7 — 検証

```bash
cd security-docs && bun run types:check
```

- 成功：完了を報告し、追加されたパス (`/docs/<slug>`) を伝える。
- 失敗：エラー内容を報告し、完了を主張しない。型エラーを修正してから再実行する。

---

## Constraints

- **削除禁止**：既存ファイル・ディレクトリは一切削除・上書きしない。
- **書き込みスコープ**：
  - `security-docs/src/app/docs/<slug>/page.mdx`（新規作成のみ）
  - `security-docs/src/config/docs.ts`（エントリ追記のみ）
  - これら以外のファイルへの変更は不可。
- **コマンド制限**：`bun run types:check`（= `tsc --noEmit`）のみ実行可。`rm` などの破壊的コマンドは禁止。
- **アセット欠如時の挙動**：
  - 本文に不可欠な画像・添付ファイルが存在しない場合は変換を中断してユーザーに報告する（fail-closed）。
  - 装飾用アセットのみ欠如する場合は `[MISSING_ASSET:名前]` プレースホルダーに置換して継続可。
