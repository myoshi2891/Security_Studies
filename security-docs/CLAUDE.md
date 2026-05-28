# Includes / Directives

Updated 2026-05-27

The following directive is used to include agent-specific rules and context. This syntax is handled by specific agent-compatible editors/tools.

@AGENTS.md

---

## Deployment Note

`next.config.ts` の `output` は `process.env.NETLIFY` で分岐する。
- **Netlify ビルド時** (`NETLIFY=true`): standalone 無効 → Netlify Next.js Runtime が処理
- **Docker / ローカル** (未設定): `output: 'standalone'` 有効 → `node .next/standalone/server.js` で起動

詳細は親ディレクトリの `CLAUDE.md` の「Netlify デプロイ」セクションを参照。

## Technical Standards

- **Next.js**: 16.2.6, App Router, TypeScript (strict).
- **Content**: MDX via `@next/mdx`. All pages live in `src/app/docs/<slug>/page.mdx`. Register new slugs in `src/config/docs.ts`.
- **Components**: Custom docs components in `src/components/docs/` (e.g. `HeroSection`, `ThreatCard`, `DataTable`).
- **Styling**: Tailwind CSS v4 — `@import 'tailwindcss';` in `globals.css`. Utility classes only.
- **Testing**: Bun test with React Testing Library.
- **Syntax Highlighting**: `highlight.js` (v11) — tree-shaken via `highlight.js/lib/core` + per-language static imports. Supported languages: `bash`, `typescript`, `yaml`, `json`, `markdown`. Theme applied via `highlight.js/styles/github-dark.css`. `<Terminal>` is a **synchronous** component; language is auto-detected from the `title` prop file extension (`.sh`→bash / `.yaml`/`.yml`→yaml / `.json`→json / `.md`→markdown; unrecognised extensions fall back to `typescript`).
- **Security / CSP**: `src/proxy.ts` implements Next.js Proxy (Next.js 16 renamed the convention from `middleware.ts` to `proxy.ts`). It sets a **static** `Content-Security-Policy` response header without nonces or `'strict-dynamic'`.
  - **Background**: Netlify Next.js Runtime (`@netlify/plugin-nextjs`) generates an independent nonce and overwrites all `<script nonce>` attributes, causing every script to be blocked when our header carried a different nonce (Issue [#32](https://github.com/myoshi2891/Security_Studies/issues/32)). Since Next.js Flight data inline scripts have per-page content and cannot be pre-hashed, the directives fall back to `'unsafe-inline'`.
  - **Directives**: `script-src 'self' 'unsafe-inline'` (prod) / `'self' 'unsafe-inline' 'unsafe-eval'` (dev for React dev runtime / Turbopack); `style-src 'self' 'unsafe-inline'`; `connect-src 'self' ws://localhost:* ws://127.0.0.1:*` (dev HMR) / `'self'` (prod).
  - **Hardening preserved**: `default-src 'self'`, `frame-ancestors 'none'`, `base-uri 'self'`, `form-action 'self'`, `img-src 'self' data:`, `font-src 'self'`.
