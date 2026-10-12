# Includes / Directives

Updated 2026-10-12

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
- **Styling**: Tailwind CSS v4 — `@import 'tailwindcss';` in `globals.css`. Utility classes by default; the CCIE migration uses page-scoped CSS to preserve the original styling.
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
- Full original content retained with page-scoped faithful CSS and intrinsic JSX elements; this page is an exception to the utility-only styling convention. Other MDX pages keep the shared design system.
- Mermaid 11.12.0 and Source Serif 4 Variable 5.3.0 are local dependencies. Python examples use server-side highlight.js. No legacy CDN scripts are loaded.
- 56 CCIE fidelity/lifecycle tests plus 10 layout tests; latest project tests: 244 across 38 files (240 pass / 4 fail, 9,359 expects). Baseline 22 tracked logic files plus CCIE部品3 / DocsHeaderNav1 / Secure by Design部品3 are tracked separately from MDX test files (29/29).
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









<!-- ATLAS CURRENT -->
## MITRE ATLAS 現在の状態（2026-10-12）

- 復旧開始・本文前半4件失敗の状態へ記録訂正。ルート `/docs/mitre-atlas`。
- プロジェクト全体: **240 pass / 4 fail、38ファイル、9,359 expect**。npm test（内部Bun）。
- ビルド未実行（禁止）。目視確認はユーザー担当。移行台帳: `docs/migration-inventory/mitre-atlas.json`。
<!-- /ATLAS CURRENT -->
