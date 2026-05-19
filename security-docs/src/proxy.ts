import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Proxies the incoming request while injecting a per-request nonce and a Content-Security-Policy header.
 *
 * Builds a CSP value (varying between development and production) that includes a generated `nonce` and sets
 * the `Content-Security-Policy` and `x-nonce` headers on both the forwarded request and the returned response.
 *
 * @param request - The incoming Next.js request to forward
 * @returns A NextResponse that forwards the request with the CSP and `x-nonce` headers applied
 */
export function proxy(request: NextRequest) {
  const nonce = btoa(crypto.randomUUID())
  const isDev = process.env.NODE_ENV === 'development'

  // dev: 'unsafe-eval' で React dev runtime と Turbopack の eval ベースコードを許可。
  //      'unsafe-inline' は script/style ともに付与しない（nonce で代替）。
  //      connect-src には HMR の ws を追加。'strict-dynamic' は Next.js dynamic import に必要。
  // prod: nonce + strict-dynamic で厳格に。
  const scriptSrc = isDev
    ? `'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-eval'`
    : `'self' 'nonce-${nonce}' 'strict-dynamic'`
  const styleSrc = `'self' 'nonce-${nonce}'`
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

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)
  requestHeaders.set(
    'Content-Security-Policy',
    contentSecurityPolicyHeaderValue
  )

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

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
