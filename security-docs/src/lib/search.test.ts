import { describe, expect, mock, test } from 'bun:test';
import fs from 'node:fs';
import path from 'node:path';
import { getSearchIndex, type SearchResult } from './search';

const REQUIRED_KEYS = ['content', 'description', 'href', 'title'] as const;
const DOCS_DIR = path.join(process.cwd(), 'src/app/docs');
const HREF_PATTERN = /^\/docs\/(.+)$/;

describe('getSearchIndex', () => {
    test('returns a non-empty SearchResult array', async () => {
        const results = await getSearchIndex();

        expect(Array.isArray(results)).toBe(true);
        expect(results.length).toBeGreaterThan(0);
    });

    test('each result has exactly title/description/href/content keys', async () => {
        const results = await getSearchIndex();

        for (const item of results) {
            const keys = Object.keys(item).sort();
            expect(keys).toEqual([...REQUIRED_KEYS]);
        }
    });

    test('each title is a non-empty string', async () => {
        const results = await getSearchIndex();

        for (const item of results) {
            expect(typeof item.title).toBe('string');
            expect(item.title.length).toBeGreaterThan(0);
        }
    });

    test('each description is a string (may be empty when frontmatter omits it)', async () => {
        const results = await getSearchIndex();

        for (const item of results) {
            expect(typeof item.description).toBe('string');
        }
    });

    test('each href matches /docs/<slug> and slug exists on disk', async () => {
        const results = await getSearchIndex();

        for (const item of results) {
            const match = item.href.match(HREF_PATTERN);
            expect(match).not.toBeNull();
            const slug = match?.[1] ?? '';
            const mdxPath = path.join(DOCS_DIR, slug, 'page.mdx');
            expect(fs.existsSync(mdxPath)).toBe(true);
        }
    });

    test('each content is at most 500 characters', async () => {
        const results = await getSearchIndex();

        for (const item of results) {
            expect(typeof item.content).toBe('string');
            expect(item.content.length).toBeLessThanOrEqual(500);
        }
    });

    test('includes every directory that has a page.mdx and only those', async () => {
        const results = await getSearchIndex();

        const fsSlugs = new Set(listDocDirsWithMdx());
        const indexSlugs = new Set(
            results.map((item) => item.href.replace(/^\/docs\//, '')),
        );

        expect(indexSlugs).toEqual(fsSlugs);
    });

    test('contains approach page with updated title and keywords', async () => {
        const results = await getSearchIndex();
        const approach = results.find(item => item.href === '/docs/approach');
        expect(approach).toBeDefined();
        expect(approach?.title).toBe('2026年 サプライチェーンセキュリティ＆SCS評価制度 対策アプローチ');
        expect(approach?.content).toContain('SCS評価制度');
    });
});

// DOCS_DIR 配下のすべてのディレクトリを再帰的に走査し、page.mdx を含むものを列挙する。
// getSearchIndex の走査条件と等価なので、両者の集合一致は検索インデックス
// の漏れ (page.mdx あるが結果に無い) と誤包含 (page.mdx 無いが結果に有る)
// を同時に検出する。
function listDocDirsWithMdx(dir: string = DOCS_DIR): string[] {
    const results: string[] = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            const subResults = listDocDirsWithMdx(fullPath);
            results.push(...subResults);
        } else if (entry.isFile() && entry.name === 'page.mdx') {
            const relativePath = path.relative(DOCS_DIR, dir).replace(/\\/g, '/');
            results.push(relativePath);
        }
    }
    return results;
}

// 型エクスポートが破壊されないことを保証する型レベルチェック。
// SearchResult の型シェイプを意図せず変更すると、ここで TS エラーになる。
const _typeContract: SearchResult = {
    title: 'x',
    description: 'y',
    href: '/docs/x',
    content: 'z',
};
void _typeContract;

// ---------------------------------------------------------------------------
// エラーパスのカバレッジ補完
// ---------------------------------------------------------------------------
describe('getSearchIndex error paths', () => {
    test('returns [] and warns when docsDirectory does not exist (line 62-63)', async () => {
        // fs.promises.access を失敗させてディレクトリ不在をシミュレート
        const originalAccess = fs.promises.access;
        const warnSpy: string[] = [];
        const originalWarn = console.warn;
        console.warn = (...args: unknown[]) => { warnSpy.push(String(args[0])); };

        fs.promises.access = mock(async () => { throw new Error('ENOENT'); });
        try {
            const results = await getSearchIndex();
            expect(results).toEqual([]);
            expect(warnSpy.some((m) => m.includes('Docs directory not found'))).toBe(true);
        } finally {
            fs.promises.access = originalAccess;
            console.warn = originalWarn;
        }
    });

    test('skips entry and logs error when readFile fails for page.mdx (line 41)', async () => {
        // readFile だけを失敗させ、readdir・access は実装そのままにする
        const originalReadFile = fs.promises.readFile;
        const errorSpy: string[] = [];
        const originalError = console.error;
        console.error = (...args: unknown[]) => { errorSpy.push(String(args[0])); };

        fs.promises.readFile = mock(async () => { throw new Error('Permission denied'); }) as typeof fs.promises.readFile;
        try {
            const results = await getSearchIndex();
            // readFile が全て失敗するので結果は空配列になる
            expect(Array.isArray(results)).toBe(true);
            expect(errorSpy.some((m) => m.includes('Error reading search index'))).toBe(true);
        } finally {
            fs.promises.readFile = originalReadFile;
            console.error = originalError;
        }
    });

    test('returns [] and logs error on unexpected scanDirectory failure (line 68-70)', async () => {
        // readdir を失敗させて scanDirectory 全体をクラッシュさせる
        const originalReaddir = fs.promises.readdir;
        const errorSpy: string[] = [];
        const originalError = console.error;
        console.error = (...args: unknown[]) => { errorSpy.push(String(args[0])); };

        fs.promises.readdir = mock(async () => { throw new Error('Unexpected readdir error'); }) as typeof fs.promises.readdir;
        try {
            const results = await getSearchIndex();
            expect(results).toEqual([]);
            expect(errorSpy.some((m) => m.includes('Error generating search index'))).toBe(true);
        } finally {
            fs.promises.readdir = originalReaddir;
            console.error = originalError;
        }
    });
});
