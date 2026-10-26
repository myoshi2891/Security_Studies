# Technical Specification: Security Studies Documentation (Next.js + Tailwind v4 + MDX)

Updated 2026-10-26

## 1. Project Overview

This project aims to build a high-performance, secure, and modern documentation site using the latest Next.js features, replacing the Fumadocs framework with a custom, lightweight MDX implementation.

### Tech Stack

- **Framework:** Next.js 16.4.2 (App Router)
- **Styling:** Tailwind CSS v4 (Alpha/Stable) with CSS Variables
- **Content:** MDX via `@next/mdx` and `next-mdx-remote` (or standard MDX components)
- **Language:** TypeScript (Strict Mode)
- **Icons/UI:** Lucide React, Shadcn UI (Custom components for v4 compatibility)

---

## 2. Implementation Phases (TDD & Commit-driven)

### Phase 1: Core Foundation & Infrastructure

**Goal:** Initialize a clean Next.js environment and configure Tailwind CSS v4.
1. Initialize/Refactor `security-docs` to remove all Fumadocs dependencies.
2. Install `@next/mdx`, `@mdx-js/loader`, and `@mdx-js/react`.
3. Configure `next.config.mjs` to support `.mdx`.
4. Set up Tailwind CSS v4 using the new CSS-first configuration.
5. **TDD:** Ensure `next dev` starts and a basic `.mdx` page renders at `/docs/test`.
6. **Commit:** `chore: initialize next.js 15 + tailwind v4 foundation`

### Phase 2: Design System & Layout Components

**Goal:** Create a responsive, accessible documentation layout.
1. Implement `app/docs/layout.tsx`:
    - Sidebar (Recursive directory tree or static config).
    - Sticky Header with Search (Simple client-side filter).
    - Table of Contents (Extracted from MDX headings).
2. Define `mdx-components.tsx`:
    - Map standard HTML tags (h1, h2, pre, code) to Tailwind v4 styled components.
    - Integrate `rehype-pretty-code` for syntax highlighting.
3. **TDD:** Verify layout responsiveness and typography consistency.
4. **Commit:** `feat: implement documentation layout and custom mdx components`

### Phase 3: Content Migration (MDX Conversion)

**Goal:** Port existing content from `md/` and `html/` to `app/docs/`.
1. **Step 3.1: Core MDX Migration**
    - [x] Convert `md/security_architecture_2026.md` -> `app/docs/architecture/page.mdx`.
    - [x] Convert `md/security_approach_2026.md` -> `app/docs/approach/page.mdx`.
2. **Step 3.2: HTML to MDX Conversion**
    - [x] Extract clean Markdown from `html/ai-coding-safety-2026-guide.html`.
    - [x] Extract clean Markdown from `html/llm-ai-security-2026-guide.html`.
    - [x] Extract clean Markdown from `html/secdev-guide.html`. (Completed with 100% fidelity)
    - [x] Extract clean Markdown from `html/software-supply-chain-security-2026-guide.html`.
    - [x] Extract clean Markdown from `html/post-quantum-cryptography-2026-guide.html`.
    - [x] Extract clean Markdown from `html/owasp-top-10-2025-guide.html`.
    - [x] Extract clean Markdown from `html/threat-landscape-2026.html`. (Completed with 100% fidelity)
3. **TDD:** Run `bun run build` to ensure no broken links or missing frontmatter.
4. **Commit:** `docs: migrate core security documents and initial ai guides to mdx`

### Phase 4: Advanced Features (Search & Diagrams)

**Goal:** Enhance UX with search and interactive elements.
1. Implement a simple JSON-based search index generated at build time.
2. Integrate `mermaid.js` for architectural diagrams within MDX.
3. Add "Edit this page" links and breadcrumbs.
4. **TDD:** Test search accuracy and Mermaid rendering.
5. **Commit:** `feat: add search functionality and mermaid diagram support`

### Phase 5: Final Polish & Production Readiness

**Goal:** Optimize performance and accessibility.
1. Enable metadata generation for SEO (`generateMetadata`).
2. Optimize image loading using `next/image`.
3. Run accessibility audits (Lighthouse).
4. **TDD:** Full type check `tsc --noEmit` and build verification.
5. **Commit:** `chore: finalize documentation and optimize for production`

---

## 3. Migration Instructions for LLM

### How to process HTML files

- Use a regex or DOM parser to extract the `<body>` content.
- Convert class names to Tailwind v4 utilities (e.g., `text-blue-600` stays, but custom CSS in `<style>` blocks should be moved to global CSS or converted to Tailwind).
- Ensure all technical terms are preserved and correctly formatted in code blocks.

### How to handle the Sidebar

- Create a `config/docs.ts` file that maps slugs to titles.
- Example structure:

  ```typescript
  export const docsConfig = {
    sidebarNav: [
      {
        title: "Getting Started",
        items: [{ title: "Approach", href: "/docs/approach" }],
      },
      // ...
    ],
  }
  ```

---

## 4. Verification Checklist

- [x] No `fumadocs-*` packages in `package.json`.
- [x] Tailwind CSS v4 is initialized in `globals.css` using `@import "tailwindcss";`.
- [x] All `.mdx` files have valid TypeScript types.
- [x] Sidebar reflects the actual file structure (`src/config/docs.ts` — 10 pages).
- [ ] Code blocks have "Copy" buttons and syntax highlighting. (未実装 — Phase 4 タスク)

## CSSLP migration — 2026-10-24

CSSLP: `/docs/csslp-guide` へ全16章・130見出し・97表1566セル・16図・3コード・16参考ソースを移行し、HTML/Markdown原本を `archive/security-certifications/` へ両SHA-256一致でアーカイブ済み。専用87件/11ファイル成功。原本なし隔離環境53成功/34skip/0失敗（全16章とブランド/ヒーロー/目次の19構造ハッシュは原本なしでも検証）。全CSS宣言/media、5幅×明暗のCSS、丸点・番号・参考番号、全97表のホバー、目次/図操作、全表とページのhydrationを検証。全体1490成功/0skip/0失敗（229ファイル、510,667 expect）。資格ナビ・ホーム・静的/動的検索は31ページ・CSSLPの130見出しを収録。npm経由テスト・lint・型チェック成功。Next.js開発サーバーのHTTP 200で全15件数項目と19構造ハッシュの一致も確認。ビルド禁止・未実行、目視はユーザー担当・未確認。移行Green `d53c0ed`、アーカイブGreen `db89d6e`、ホバー修正Green `4565411`。

Inventory: `docs/migration-inventory/csslp-guide.json`. User review: `docs/migration-inventory/csslp-guide-review.md`.

## CSSLP practice and diagrams — 2026-10-24

CSSLPデザイン改善: 第13章の全10問を番号・設問・40選択肢に分けたカードへ整理。スマートフォンは1列、768px以上は2列の選択肢。解答欄はネイティブdetailsの開閉を保持し、正解バッジと内部フォーカスリングを整備。全16図へ図番号・内容別タイトル・種類表示を追加し、描画面・角丸ノード・曲線の矢印・サンセリフ体・配色を統一。小さい補助文字のコントラスト比4.5以上を検証。図の自然幅・中央寄せ・左端からの横スクロール・遅延描画・再試行・テキスト説明を保持。原文・正解・図定義・両原本のSHA-256は不変。第13章の装飾spanのみ透過した全19構造ハッシュ、問題文10件の固定ハッシュ、全40選択肢、3幅のデザインを検証。他章は5幅×明暗の原本CSS比較を継続。専用96件/12ファイル成功、原本なし隔離環境62成功/34skip/0失敗。全体1499成功/0skip/0失敗（230ファイル、511,065 expect）。npm test・lint・型チェック成功。HTTP 200の配信HTMLで40選択肢・16図見出しと全件数・19構造ハッシュの一致を確認。Red `047a0b7` → Green `173382a`、文字コントラストRed `395d578` → Green `6c2ef93`。ビルド禁止・未実行、目視はユーザー担当・未確認。

## ISO/IEC 29100:2024 (2026-10-26)

`/docs/iso-iec-29100-2024-guide`: 16節・96見出し・41表937セル・12図・4コード・10問・26出典を移行。専用92件/9ファイル。原本HTML/Markdownは `archive/standards/` へ両SHA-256一致で保存。原本なし環境58成功/34skip/0失敗。ナビ・ホーム・静的/動的検索37ページ。全体2295成功/0skip/0失敗（290ファイル）。npm test・lint・型チェック成功。npm使用、ビルド禁止・未実行、目視はユーザー担当。確認表: `docs/migration-inventory/iso-iec-29100-2024-guide-review.md`。

## ISSAP (2026-10-26)

`/docs/issap-guide`: 全13章・107見出し・53表854セル・22図・188リスト項目・12問/解答・30出典・41注意欄を移行。専用84件/9ファイル。HTML/Markdown原本を `archive/security-certifications/` へ両SHA-256一致で保存。資格ナビ・ホーム・静的/動的検索は38ページ。全体2379成功/0skip/0失敗（299ファイル）、原本なし53成功/31skip/0失敗。npm test・lint・型チェック成功。npm使用、ビルド禁止・未実行、目視はユーザー担当・未確認。確認表: `docs/migration-inventory/issap-guide-review.md`。

## CGRC migration — 2026-10-26

`/docs/cgrc-guide`: 導入＋第0〜9章・60小節・118見出し・92表1534セル・17図・346リスト項目・44出典・10問/40選択肢・60チェック項目を移行。両原本は `archive/security-certifications/` にSHA-256一致で保存済み。CSS10条件差分0、HTTP200の2幅で件数/15構造SHA/17図描画/目次/採点/チェックを自動検証。原本なし隔離環境54成功/29skip/0失敗。全体2465成功/0skip/0失敗（309ファイル）、専用83件/10ファイル。npm test・lint・型チェック成功。npm使用、ビルド禁止・未実行、目視はユーザー担当・未確認。台帳: `docs/migration-inventory/cgrc-guide.json`。目視確認表: `docs/migration-inventory/cgrc-guide-review.md`。
