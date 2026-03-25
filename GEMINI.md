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
- `security-docs/content/docs/`: Contains the actual documentation content written in Markdown and MDX formats.
- `security-docs/src/app/`: The Next.js App Router directory, which includes page layouts, documentation routes (`app/docs`), the landing page route (`app/(home)`), and API routes such as the search handler (`app/api/search/route.ts`).
- `security-docs/src/lib/`: Houses shared configuration and content source adapters (e.g., `source.ts` configures how Fumadocs accesses your content).
- `security-docs/source.config.ts`: Configuration file for Fumadocs MDX, allowing customization of things like the frontmatter schema.

## Building and Running

Commands should be executed within the `security-docs` directory, as that's where the `package.json` and `bun.lock` reside.

- **Install dependencies:** `bun install`
- **Start development server:** `bun run dev` (Accessible at `http://localhost:3000`)
- **Create production build:** `bun run build`
- **Start production server:** `bun run start`
- **Type checking and generation:** `bun run types:check` (Runs fumadocs-mdx typegen and tsc)

## Development Conventions

- **Content Authoring:** All new documentation content should be authored in MDX and placed within the `security-docs/content/docs/` directory. Use the existing files (like `02-sdlc.mdx`) as a structural reference.
- **Styling:** The project uses Tailwind CSS. When adding styles to custom components or MDX wrappers, utilize Tailwind's utility classes.
- **Type Safety:** Ensure type safety across the project, making use of `bun run types:check` before committing.
