# Security Studies 2026

最終更新日: 2026-05-27

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
