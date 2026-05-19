import { describe, expect, test } from 'bun:test';
import fs from 'node:fs';
import path from 'node:path';
import { getSearchIndex, type SearchResult } from './search';

const REQUIRED_KEYS = ['content', 'description', 'href', 'title'] as const;
const DOCS_DIR = path.join(process.cwd(), 'src/app/docs');
const HREF_PATTERN = /^\/docs\/([^/]+)$/;

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
});

// 型エクスポートが破壊されないことを保証する型レベルチェック。
// SearchResult の型シェイプを意図せず変更すると、ここで TS エラーになる。
const _typeContract: SearchResult = {
    title: 'x',
    description: 'y',
    href: '/docs/x',
    content: 'z',
};
void _typeContract;
