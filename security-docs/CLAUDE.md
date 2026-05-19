# Includes / Directives

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
- **Security / CSP**: `src/proxy.ts` implements Next.js Proxy (Next.js 16 renamed the convention from `middleware.ts` to `proxy.ts`). It generates a per-request UUID nonce (`crypto.randomUUID()` → base64) and sets the `Content-Security-Policy` response header. Key directives: `script-src 'self' 'nonce-<value>' 'strict-dynamic'` (plus `'unsafe-eval'` in dev; plus Netlify inline-script hash `'sha256-OBTN3...'` when `IS_NETLIFY` is set). `style-src`: prod uses `'self' 'nonce-<value>'`; dev uses `'self' 'unsafe-inline'` without nonce (CSP Level 3 ignores `'unsafe-inline'` when a nonce is present). The nonce is forwarded to page components via the `x-nonce` request header, exposed to Edge Runtime via `next.config.ts` `env.IS_NETLIFY`. Do not remove `'strict-dynamic'` — it is required for Next.js dynamic imports to load without CSP violations.
