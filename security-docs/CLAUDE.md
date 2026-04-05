# Includes / Directives

The following directive is used to include agent-specific rules and context. This syntax is handled by specific agent-compatible editors/tools.

@AGENTS.md

---

## Technical Standards

- **Next.js**: 16.2.2, App Router, TypeScript (strict).
- **Content**: MDX via `@next/mdx`. All pages live in `src/app/docs/<slug>/page.mdx`. Register new slugs in `src/config/docs.ts`.
- **Components**: Custom docs components in `src/components/docs/` (e.g. `HeroSection`, `ThreatCard`, `DataTable`).
- **Styling**: Tailwind CSS v4 — `@import 'tailwindcss';` in `globals.css`. Utility classes only.
- **Testing**: Bun test with React Testing Library.
