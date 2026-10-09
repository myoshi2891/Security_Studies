# Security Studies 2026

最終更新日: 2026-10-09

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

CCIE Security migration (2026-10-09): ヘッダーナビ・左端の元サイドバー・全幅本文・table hydration修正Green. Bun tests: 176 pass / 0 fail (30 files). npm / Next.js build not run; visual verification by user.

### CCIE Security migration details

- Route: `/docs/ccie-security` (`security-docs/src/app/docs/ccie-security/page.mdx`). Global header navigation: **Security Certifications**, immediately before Resources; AppSec remains in Resources.
- Full original content retained with page-scoped faithful CSS and intrinsic JSX elements; this page is an exception to the utility-only styling convention. Other MDX pages keep the shared design system.
- Mermaid 11.12.0 and Source Serif 4 Variable 5.3.0 are local dependencies. Python examples use server-side highlight.js. No legacy CDN scripts are loaded.
- 52 CCIE fidelity/lifecycle tests plus 10 layout tests; all project tests: 176 across 30 files (176 pass / 0 fail). Baseline 22 tracked logic files plus MermaidFigure/PythonCode/GuideSidebar/DocsHeaderNav are tracked separately from MDX test files (26/26).
- Shared navigation is in `DocsHeaderNav` in the header. CCIE uses its original 288px sidebar at the viewport left below the header and fills the remaining width. Mobile TOC preserves chapter expansion, scroll tracking, Escape/backdrop dismissal and focus wrapping.
- All 85 tables are checked before HTML parsing for invalid whitespace text nodes; table rendering emits no hydration/nesting warnings. Table cell and code whitespace remain intact.
- Review checklist: `docs/migration-inventory/ccie-security-review.md`. Build not run; browser visual review pending with user.
