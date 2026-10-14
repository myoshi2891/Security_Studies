# Includes / Directives

Updated 2026-10-15

The following directive is used to include agent-specific rules and context. This syntax is handled by specific agent-compatible editors/tools.

@AGENTS.md

---

## Deployment Note

`next.config.ts` の `output` は `process.env.NETLIFY` で分岐する。
- **Netlify ビルド時** (`NETLIFY=true`): standalone 無効 → Netlify Next.js Runtime が処理
- **Docker / ローカル** (未設定): `output: 'standalone'` 有効 → `node .next/standalone/server.js` で起動

詳細は親ディレクトリの `CLAUDE.md` の「Netlify デプロイ」セクションを参照。

## Technical Standards

- **Next.js**: 16.3.8, App Router, TypeScript (strict).
- **Content**: MDX via `@next/mdx`. All pages live in `src/app/docs/<slug>/page.mdx`. Register new slugs in `src/config/docs.ts`.
- **Components**: Custom docs components in `src/components/docs/` (e.g. `HeroSection`, `ThreatCard`, `DataTable`).
- **Styling**: Tailwind CSS v4 — `@import 'tailwindcss';` in `globals.css`. Utility classes by default; the CCIE Security, Secure by Design and MITRE ATLAS migrations use page-scoped CSS to preserve the original styling.
- **Testing**: Bun test with React Testing Library.
- **Syntax Highlighting**: `highlight.js` (v11) — tree-shaken via `highlight.js/lib/core` + per-language static imports. Supported languages: `bash`, `typescript`, `yaml`, `json`, `markdown`. Theme applied via `highlight.js/styles/github-dark.css`. `<Terminal>` is a **synchronous** component; language is auto-detected from the `title` prop file extension (`.sh`→bash / `.yaml`/`.yml`→yaml / `.json`→json / `.md`→markdown; unrecognised extensions fall back to `typescript`).
- **Security / CSP**: `src/proxy.ts` implements Next.js Proxy (Next.js 16 renamed the convention from `middleware.ts` to `proxy.ts`). It sets a **static** `Content-Security-Policy` response header without nonces or `'strict-dynamic'`.
  - **Background**: Netlify Next.js Runtime (`@netlify/plugin-nextjs`) generates an independent nonce and overwrites all `<script nonce>` attributes, causing every script to be blocked when our header carried a different nonce (Issue [#32](https://github.com/myoshi2891/Security_Studies/issues/32)). Since Next.js Flight data inline scripts have per-page content and cannot be pre-hashed, the directives fall back to `'unsafe-inline'`.
  - **Directives**: `script-src 'self' 'unsafe-inline'` (prod) / `'self' 'unsafe-inline' 'unsafe-eval'` (dev for React dev runtime / Turbopack); `style-src 'self' 'unsafe-inline'`; `connect-src 'self' ws://localhost:* ws://127.0.0.1:*` (dev HMR) / `'self'` (prod).
  - **Hardening preserved**: `default-src 'self'`, `frame-ancestors 'none'`, `base-uri 'self'`, `form-action 'self'`, `img-src 'self' data:`, `font-src 'self'`.

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
- 元HTMLを正本として17節、77見出し、35表、15図、8 Javaコード例、19注意欄、32参考文献を移行。原本は `archive/html/Secure-by-design-guide.html` と `archive/md/Secure-by-design-guide.md` にアーカイブ保存。
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
- 原本は `archive/html/Mitre-atlas.html` と `archive/md/Mitre-atlas.md` に内容変更なしで保存。移動前後のSHA-256一致を確認。台帳: `docs/migration-inventory/mitre-atlas.json`、目視確認表: `docs/migration-inventory/mitre-atlas-review.md`。
- 前半の早すぎた実装コミットと誤った成功記録は、ユーザー承認により履歴を残して訂正。復旧後の全件成功を確認し、以降はRed/実装/docsを分離。詳細はprogressの復旧記録を参照。



図の可読性改善（2026-10-12）: ラベル18px、日本語向けフォント、明るい文字色（各ラベル背景でコントラスト比7以上）、明るい接続線を使用。SVGはviewBoxの自然幅を維持し、図だけをキーボード操作可能な領域で横スクロール。キャプション・説明は14pxに改善。図定義・接続・元資料は変更なし。全277件・lint・型検査成功。ビルド未実行、目視確認はユーザー担当。





<!-- CCIE TABLE CURRENT -->
## CCIE Security 現在の状態（2026-10-13）

- 原本HTML・MDのアーカイブ完了・バイト一致・全テストとlint/型検査成功。ルート `/docs/ccie-security`。
- CCIEアーカイブ完了時点: **291 pass / 0 fail、46ファイル、12,618 expect**。npm test（内部Bun）。
- ビルド未実行（禁止）。目視確認はユーザー担当。移行台帳: `docs/migration-inventory/ccie-security.json`。
- 原本: `archive/html/Ccie-security-guide.html` / `archive/md/Ccie-security-guide.md`。両SHA-256一致、比較テストはarchiveを参照。Red `d4f11e6` → Green `7782eb1`。
<!-- /CCIE TABLE CURRENT -->


<!-- CCST CURRENT -->
## CCST Cybersecurity 移行状況（2026-10-13）

- 移行完了・全395件/58ファイル/25,099expect・lint/型検査成功・原本アーカイブ済み・目視待ち。ルート `/docs/ccst-cybersecurity`、Security CertificationsのCCIE直後。
- 最新全体テスト: **395 pass / 0 fail、58ファイル、25,099 expect**。npm test（内部Bun）。
- ビルド禁止。目視はユーザー担当。台帳: `docs/migration-inventory/ccst-cybersecurity.json`。
- 配置: `security-docs/src/app/docs/ccst-cybersecurity/page.mdx`。全46節・227見出し・163表・50図・73リスト/344項目・25問/100選択肢・25チェック・60参考文献を保持。
- CCST専用テストは12ファイル・104件。全395件成功。丸点・標準番号・カウンター、表とコードの両テーマ、375/768/1440pxのCSSを検証。CSSはCCST内と条件付きルートセレクターに限定。
- HTML正本: `archive/html/Ccst-cybersecurity-guide.html`。MD保存: `archive/md/Ccst-cybersecurity-guide.md`。両SHA-256一致、情報基準日2026-10-05を保持。
- ナビ表示指摘の調査中: localhost:3000の配信HTMLではドキュメントメニュー内に17リンクとWAHHを確認。ホームは一覧カード内にWAHHを確認（上部Main navigationはLibrary/Documentationのみ）。ユーザーが指摘する画面を確認中。
- 目視確認表: `docs/migration-inventory/ccst-cybersecurity-review.md`。今回のビルド・ブラウザー目視・公開は未実施。pushはPRブランチ（dev、PR #46）へ実施済み、目視確認後の追加pushは未実施。
- 原本移動Green `779e602`、スタイルGreen `b4fae3a`、スクロールGreen `1169e10`。今後の修正もnpm経由でRed→テストコミット→Green→実装コミット→仕様書同期を維持。
- 図中央寄せ（2026-10-13）: SVGをdisplay:block・左右auto余白で中央配置。収まらない図はauto余白が0になり、左端から左右スクロール可能。図定義・自然幅を保持。375/1440pxと120/2400px幅の回帰テスト追加。Red `78997af` → Green `7c54fac`。ビルド未実行、目視はユーザー担当。
<!-- /CCST CURRENT -->


<!-- hacking-kubernetes-status -->

## Hacking Kubernetes 移行（2026-10-15）

- ページ: `/docs/hacking-kubernetes`（`security-docs/src/app/docs/hacking-kubernetes/page.mdx`）。原本アーカイブGreen・全452件成功・lint/型検査成功。
- 当該移行完了時の全体テスト実測: 452 pass / 0 fail、69ファイル、30,591 expect。`npm test`（内部Bun）で検証。
- 原本: `archive/html/Hacking-kubernetes-guide.html` / `archive/md/Hacking-kubernetes-guide.md` に移動済み（SHA-256一致）。18章・82小節・52表・24コード・12図・24チェック項目。
- 検証: npm経由のテスト・lint・型検査。Next.jsビルドは禁止。目視確認はユーザー担当・未完了。push・公開未実施。

- 専用11テストファイル・56件 + 既存layoutテスト1件追加。原本アーカイブHEAD: `25a5ea1`。目視確認表: `docs/migration-inventory/hacking-kubernetes-review.md`。

<!-- /hacking-kubernetes-status -->


<!-- web-application-hackers-handbook-status -->

## WAHH 移行（2026-10-15）

- 移行完了: `/docs/web-application-hackers-handbook`（`security-docs/src/app/docs/web-application-hackers-handbook/page.mdx`）。ホームのSecurity Guidesとグローバルナビに同名リンクを登録済み。ナビ・静的検索は17ページ、原本の127見出しを検索可能。
- 現在の全体テスト実測: 538 pass / 0 fail、85ファイル、59,406 expect。専用14ファイル・74件、ホーム3件・既存layoutのWAHH現在位置1件。`npm test`、`npm run lint`、`npm run types:check` 成功。
- 保持: 13主要節・14ステップ節・53表（138見出しセル/892本文セル）・7コード（Python6/JavaScript1）・16図（フロー14/シーケンス2）・30チェック項目・28参考文献・55ID。原本情報基準日は2026年10月11日のまま。
- 表示: 丸点とチェック番号、表のホバー/区切り線、見出し・コードの余白/背景/枠線を原本比較。注意本文は7:1以上、補助文字・コードコメント・チェック済み番号は4.5:1以上。図は狭幅で中央、広幅で自然幅を保持して左右へスクロール可能。
- 原本: `archive/html/Web-application-hackers-handbook-guide.html` / `archive/md/Web-application-hackers-handbook-guide.md` へバイト不変でアーカイブ済み（SHA-256固定、移動コミット `56faff0`）。表示修正HEAD: `81c6dc1`。
- 目視確認表: `docs/migration-inventory/web-application-hackers-handbook-review.md`。ユーザー目視は未完了。npm使用、Next.jsビルド禁止・未実行、push・公開未実施。

<!-- /web-application-hackers-handbook-status -->


<!-- shared-guide-navigation-status -->

## 共通ガイドナビゲーション（2026-10-15）

- 表示問題の原因: ホーム上部はLibrary/Documentationだけの別ナビで、WAHHは一覧カードにのみ表示されていた。ホームとドキュメントヘッダーで `src/components/docs/DocsHeaderNav.tsx` を共有する構成へ修正（HEAD `81c6dc1`）。
- 入口: デスクトップは「ガイド一覧」、スマートフォンは「ガイド」。現在17ページをカテゴリ別に表示し、ガイド名・カテゴリ・URLで絞り込める。絞り込み欄は固定し、増えた項目はメニュー内で縦スクロールする。
- 拡張: `src/config/docs.ts` の `sidebarNav` がホーム一覧・共通メニュー・件数の共通設定。ページ追加時はMDX作成と設定登録を行い、検索インデックスを更新する。ナビコンポーネントにページごとの追記は不要。80ページ/新カテゴリを追加した97ページのテストと、設定に追従する件数・既存順序・重複検出テストで検証。
- 操作: 開いたら絞り込み欄へフォーカス、Escapeで閉じて入口へ戻る。リンク選択・外側クリックで閉じる。表示名と読み上げ名を一致させ、320px/375pxではヘッダー検索をコンパクトにする。
- 検証: 共通ナビ8件・ホーム3件・docs layout12件。全538件/85ファイル/59,406 expect成功、`npm run lint`・`npm run types:check` 成功。localhost:3000が返すホームとdocsのHTMLで共通入口・絞り込み欄・17リンク・WAHHを確認。ユーザー目視は未完了。
- npm使用・Next.jsビルド未実行（禁止）・push/公開未実施。目視確認表: `docs/migration-inventory/web-application-hackers-handbook-review.md`。

<!-- /shared-guide-navigation-status -->
