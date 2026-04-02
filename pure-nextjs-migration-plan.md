# Technical Specification: Security Studies Documentation (Next.js + Tailwind v4 + MDX)

## 1. Project Overview

This project aims to build a high-performance, secure, and modern documentation site using the latest Next.js features, replacing the Fumadocs framework with a custom, lightweight MDX implementation.

### Tech Stack

- **Framework:** Next.js 15+ (App Router)
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
    - [ ] Extract clean Markdown from `html/software-supply-chain-security-2026-guide.html`.
    - [ ] Extract clean Markdown from `html/post-quantum-cryptography-2026-guide.html`.
    - [ ] Extract clean Markdown from `html/owasp-top-10-2025-guide.html`.
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

- [ ] No `fumadocs-*` packages in `package.json`.
- [ ] Tailwind CSS v4 is initialized in `globals.css` using `@import "tailwindcss";`.
- [ ] All `.mdx` files have valid TypeScript types.
- [ ] Sidebar reflects the actual file structure.
- [ ] Code blocks have "Copy" buttons and syntax highlighting.
