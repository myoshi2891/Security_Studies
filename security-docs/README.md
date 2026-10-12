# Security Studies 2026

最終更新日: 2026-10-13

Next.js-based documentation application focused on security studies, leveraging MDX for high-fidelity content authoring.

## Getting Started

First, install dependencies:

```bash
bun install
```

Then, run the development server:

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Documentation Layout

- **Pages**: `src/app/docs/<slug>/page.mdx`
- **Components**: `src/components/docs/`
- **Search API**: `src/app/api/search/route.ts`
- **Sidebar config**: `src/config/docs.ts`

## Authoring Guidelines

All documentation content is authored in MDX. You can use custom UI components like `<HeroSection>`, `<SectionCard>`, and `<DataTable>` directly in your MDX files without imports (`mdx-components.tsx` registers them globally).

To add a new page:
1. Create `src/app/docs/<slug>/page.mdx` with `title` / `description` frontmatter
2. Add `{ title, href: "/docs/<slug>" }` to `sidebarNav` in `src/config/docs.ts`

## Testing

Run tests using Bun:

```bash
bun test
```

## Build

Create a production build:

```bash
bun run build
```

### CCIE Security migration status

CCIE Security migration (2026-10-10・当時の検証記録): ヘッダーナビ・左端の元サイドバー・全幅本文・table hydration修正・レビュー対応Green. Bun tests: 186 pass / 0 fail (30 files, 6,304 expects). `bun run build` succeeded; browser visual review pending with user.

### CCIE Security migration details

- Route: `/docs/ccie-security` (`security-docs/src/app/docs/ccie-security/page.mdx`). Global header navigation: **Security Certifications**, immediately before Resources; AppSec remains in Resources.
- Full original content retained with page-scoped faithful CSS and intrinsic JSX elements; CCIE Security, Secure by Design and MITRE ATLAS are the page-scoped CSS exceptions to the utility-only styling convention. All other MDX pages keep the shared design system.
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

- 表示基盤Red・未実装による7件の失敗を確認。予定ルート `/docs/ccst-cybersecurity`、Security CertificationsのCCIE直後。
- 最新全体テスト: **291 pass / 7 fail、47ファイル、12,618 expect**。npm test（内部Bun）。
- ビルド禁止。目視はユーザー担当。台帳: `docs/migration-inventory/ccst-cybersecurity.json`。
<!-- /CCST CURRENT -->
