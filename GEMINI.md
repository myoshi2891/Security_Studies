# Security Studies

## Project Overview

This is a Next.js-based documentation application focused on security studies. It uses a custom MDX implementation (via `@next/mdx`) with hand-crafted React components — Fumadocs has been fully removed. It covers important security topics, including SDLC (Software Development Life Cycle), OWASP, AI Security, AI Coding, Supply Chain Security, and PQC (Post-Quantum Cryptography).

### Key Technologies

- **Framework:** Next.js 16.2.2 (App Router)
- **UI Library:** React 19
- **Language:** TypeScript (strict)
- **Styling:** Tailwind CSS v4 with PostCSS
- **Content Engine:** `@next/mdx` + custom components in `src/components/docs/`
- **Package Manager:** Bun

### Architecture

- `security-docs/src/app/docs/`: Contains all MDX documentation pages (`page.mdx` per topic). This is the **authoritative** content directory.
- `security-docs/src/components/docs/`: Custom React components used in MDX (e.g. `HeroSection`, `ThreatCard`, `DataTable`).
- `security-docs/src/config/docs.ts`: Sidebar navigation configuration.
- `security-docs/src/app/api/search/`: Search API handler.
- `security-docs/src/lib/search.ts`: Logic for generating the search index.

## Building and Running

Commands should be executed within the `security-docs` directory.

- **Install dependencies:** `bun install`
- **Start development server:** `bun run dev`
- **Create production build:** `bun run build`
- **Testing:** `bun test`
- **Type checking:** `bun run types:check`

> **Note on `output` mode:** `next.config.ts` sets `output: 'standalone'` only when the `NETLIFY` environment variable is absent. Under Docker, the production server is started via `node .next/standalone/server.js` (not `next start`). Under Netlify, the runtime manages serving automatically.

## Deployment

- **Netlify (primary hosting):** GitHub `main` branch push triggers automatic build and deploy via `@netlify/plugin-nextjs`. Configuration: `security-docs/netlify.toml`.
- **Docker (local / self-hosted):** Use `make build && make up` from the project root. See `Makefile` for all targets.

## Development Conventions

- **Content Authoring:** All new documentation content should be authored in MDX and placed within `security-docs/src/app/docs/<slug>/page.mdx`. Use custom UI components from `src/components/docs/` (e.g. `<HeroSection>`, `<ThreatCard>`, `<DataTable>`). Register any new slug in `src/config/docs.ts`.
- **Styling:** The project uses Tailwind CSS v4. Utility classes only — no custom CSS unless adding to `globals.css`.
- **Type Safety:** Run `bun run types:check` before committing. `any` is prohibited; use `unknown` + type guards.
