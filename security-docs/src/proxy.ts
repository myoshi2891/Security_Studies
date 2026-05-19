import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Proxies the incoming request while attaching a static Content-Security-Policy header.
 *
 * nonce / 'strict-dynamic' は使用しない。Netlify Next.js Runtime が独自の nonce を
 * 生成して全 <script> タグに上書き付与してしまい、proxy.ts が発行する nonce と
 * 不一致になる事象（Issue #32）が解消できないため、ヘッダーは hash 非依存の
 * 静的構成とする。Next.js が出力するページ固有の Flight data inline script は
 * 事前ハッシュ化できないため 'unsafe-inline' で許可する。
 *
 * @param _request - 受信した Next.js リクエスト（参照しないがシグネチャ維持のため受領）
 * @returns CSP ヘッダーを付与したレスポンス
 */
export function proxy(_request: NextRequest) {
  const isDev = process.env.NODE_ENV === 'development'

  // dev のみ React dev runtime / Turbopack の eval ベース実装のため 'unsafe-eval' を追加。
  const scriptSrc = isDev
    ? `'self' 'unsafe-inline' 'unsafe-eval'`
    : `'self' 'unsafe-inline'`
  const styleSrc = `'self' 'unsafe-inline'`
  const connectSrc = isDev
    ? `'self' ws://localhost:* ws://127.0.0.1:*`
    : `'self'`

  const cspHeader = `
    default-src 'self';
    script-src ${scriptSrc};
    style-src ${styleSrc};
    img-src 'self' data:;
    font-src 'self';
    connect-src ${connectSrc};
    frame-ancestors 'none';
    base-uri 'self';
    form-action 'self';
  `

  const contentSecurityPolicyHeaderValue = cspHeader
    .replace(/\s{2,}/g, ' ')
    .trim()

  const response = NextResponse.next()
  response.headers.set(
    'Content-Security-Policy',
    contentSecurityPolicyHeaderValue
  )

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
}
