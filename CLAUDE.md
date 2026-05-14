# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## コマンド

すべてのコマンドは `security-docs/` ディレクトリ内で実行する。

```bash
cd security-docs
bun install          # 依存関係のインストール
bun run dev          # 開発サーバー起動 (http://localhost:3000)
bun run build        # 本番ビルド
bun run lint         # ESLint 実行
bun run types:check  # TypeScript 型チェック (tsc --noEmit)
bun test             # 全テスト実行
bun test src/components/docs/Callout.test.tsx  # 単一テストファイル実行
```

コミット前に必ず `bun run types:check` を通過させること。

## Docker コマンド

すべての Docker 操作はプロジェクトルート (`Security_Studies/`) から実行する。

```bash
make dev              # 開発サーバー起動（ホットリロード, http://localhost:3000）
make build            # 本番イメージビルド（security-studies:prod）
make up               # 本番コンテナ起動（バックグラウンド）
make down             # 全コンテナ停止
make logs             # dev ログ追跡（make logs SERVICE=prod で prod ログ）
make shell            # dev コンテナへのシェル接続
make test             # Bun テスト実行（コンテナ内）
make clean            # コンテナ・イメージ・ボリューム完全削除
```

### Docker アーキテクチャ

| 項目 | 詳細 |
|---|---|
| **Dockerfile** | `security-docs/Dockerfile`（3ステージ: deps / builder / runner） |
| deps stage | `oven/bun:1-alpine` — 本番依存関係のみ |
| builder stage | `oven/bun:1-alpine` — 全依存関係 + `next build` |
| runner stage | `node:22-alpine` — `.next/standalone/server.js` を `node` で実行 |
| **output mode** | `next.config.ts` に `output: 'standalone'` 設定済み |
| **本番起動** | `node server.js`（`next start` は standalone モードで無効） |
| **開発** | ボリュームマウント + `CHOKIDAR_USEPOLLING=true` でホットリロード |

## アーキテクチャ

```
Security_Studies/
├── Makefile                    # Docker 操作ショートカット
├── docker-compose.yml          # dev/prod サービス定義
├── security-docs/          # Next.js 16.2.x アプリ (本体)
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
│   │   └── mdx-components.tsx  # MDX コンポーネントのグローバル登録
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
| `<Terminal>` | ターミナル表示 |
| `<Checklist>` | チェックリスト |
| `<DataTable>` | テーブル |
| `<SourceReferences>` | 出典一覧 |
| `<RiskBadge>` / `<ThreatCard>` / `<Tag>` | バッジ/カード |

### 検索 API

`GET /api/search` が `src/app/docs/` の `page.mdx` を読み取り、frontmatter + 本文冒頭500文字を返す。モジュールレベルでキャッシュされ、`Cache-Control: s-maxage=3600` が設定されている。

### テスト構成

- ランナー: `bun test`
- DOM 環境: `happy-dom` (`bunfig.toml` の `preload` で自動セットアップ)
- アサーション: `@testing-library/jest-dom`
- テストファイルはコンポーネントと同階層に `*.test.tsx` として配置
