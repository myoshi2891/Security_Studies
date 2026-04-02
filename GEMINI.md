# Security Studies

## Project Overview

This is a Next.js-based documentation application focused on security studies, leveraging the Fumadocs framework and MDX for content authoring. It covers important security topics, including SDLC (Software Development Life Cycle), OWASP, AI Security, AI Coding, Supply Chain Security, and PQC (Post-Quantum Cryptography).

### Key Technologies

- **Framework:** Next.js (App Router)
- **UI Library:** React
- **Language:** TypeScript
- **Styling:** Tailwind CSS (v4) with PostCSS
- **Documentation Engine:** Fumadocs (Core, MDX, and UI)
- **Package Manager:** Bun

### Architecture

- `security-docs/src/app/docs/`: Contains the documentation content in Next.js App Router MDX format.
- `security-docs/src/app/api/search/`: Contains the search handler.
- `security-docs/src/lib/search.ts`: Logic for generating the search index.

## Building and Running

Commands should be executed within the `security-docs` directory.

- **Install dependencies:** `bun install`
- **Start development server:** `bun run dev`
- **Create production build:** `bun run build`
- **Start production server:** `bun run start`
- **Testing:** `bun test`
- **Type checking:** `bun run types:check`

## Development Conventions

- **Content Authoring:** All new documentation content should be authored in MDX and placed within the `security-docs/src/app/docs/` directory. Each page is a `page.mdx` file within its own subdirectory. Use custom UI components from `src/components/docs/`.
- **Styling:** The project uses Tailwind CSS v4. Utilize utility classes for styling.
- **Type Safety:** Ensure type safety across the project.
