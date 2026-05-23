import { afterEach, beforeEach, describe, expect, test } from 'bun:test'
import type { NextRequest } from 'next/server'
import { proxy } from './proxy'

/**
 * CSP ヘッダー文字列をディレクティブ名 → 値配列の Map に分解する。
 * 例: "default-src 'self'; script-src 'self' 'unsafe-inline'"
 *   → { 'default-src': ["'self'"], 'script-src': ["'self'", "'unsafe-inline'"] }
 */
function parseCsp(header: string): Record<string, string[]> {
  return Object.fromEntries(
    header
      .split(';')
      .map((d) => d.trim())
      .filter(Boolean)
      .map((d) => {
        const [name, ...values] = d.split(/\s+/)
        return [name, values] as const
      })
  )
}

function callProxy(): Record<string, string[]> {
  // _request は本実装で参照されないため空オブジェクトで十分
  const response = proxy({} as NextRequest)
  const header = response.headers.get('Content-Security-Policy')
  expect(header).not.toBeNull()
  return parseCsp(header as string)
}

// process.env.NODE_ENV は Next.js の型定義で readonly のため、
// テスト用の動的書き換えはミュータブルな Record として扱う。
const mutableEnv = process.env as Record<string, string | undefined>

describe('proxy CSP header', () => {
  let originalNodeEnv: string | undefined

  beforeEach(() => {
    originalNodeEnv = mutableEnv.NODE_ENV
  })

  afterEach(() => {
    // 他テストへの汚染防止: NODE_ENV を元の値に戻す
    if (originalNodeEnv === undefined) {
      delete mutableEnv.NODE_ENV
    } else {
      mutableEnv.NODE_ENV = originalNodeEnv
    }
  })

  test('production: script-src は self/unsafe-inline を含み unsafe-eval を含まない', () => {
    mutableEnv.NODE_ENV = 'production'

    const directives = callProxy()

    expect(directives['script-src']).toEqual(["'self'", "'unsafe-inline'"])
    expect(directives['script-src']).not.toContain("'unsafe-eval'")
  })

  test('development: script-src は self/unsafe-inline/unsafe-eval を含む', () => {
    mutableEnv.NODE_ENV = 'development'

    const directives = callProxy()

    expect(directives['script-src']).toEqual([
      "'self'",
      "'unsafe-inline'",
      "'unsafe-eval'",
    ])
  })

  test("frame-ancestors は 'none'", () => {
    mutableEnv.NODE_ENV = 'production'

    const directives = callProxy()

    expect(directives['frame-ancestors']).toEqual(["'none'"])
  })

  test("base-uri は 'self'", () => {
    mutableEnv.NODE_ENV = 'production'

    const directives = callProxy()

    expect(directives['base-uri']).toEqual(["'self'"])
  })

  test("form-action は 'self'", () => {
    mutableEnv.NODE_ENV = 'production'

    const directives = callProxy()

    expect(directives['form-action']).toEqual(["'self'"])
  })

  test("default-src は 'self'", () => {
    mutableEnv.NODE_ENV = 'production'

    const directives = callProxy()

    expect(directives['default-src']).toEqual(["'self'"])
  })
})
