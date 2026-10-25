<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->


## Mermaid diagram layout for guide migrations

- Center diagrams that fit the available width, and keep oversized diagrams scrollable from their left edge in both directions.
- Use a block scroll container with `overflow-x: auto` and SVGs with `display: block` and automatic left/right margins. Preserve each SVG's intrinsic width.
- Avoid centering oversized content with `justify-content: center` on the scroll container or negative offsets/translations: the left edge can become unreachable.
- Verify both narrow and oversized SVGs at phone and desktop widths before completing a migration. Browser visual review remains a separate check.
