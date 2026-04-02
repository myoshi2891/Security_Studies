# Security Studies 2026

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

- **Pages**: `security-docs/content/docs/**/*.mdx`
- **Components**: `src/components/docs/`
- **Search API**: `src/app/api/search/route.ts`

## Authoring Guidelines

All documentation content is authored in MDX. You can use custom UI components like `<HeroSection>`, `<SectionCard>`, and `<DataTable>` directly in your MDX files.

To add a new page, create a new directory under `security-docs/content/docs/` and add a `page.mdx` file.

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
