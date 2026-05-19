import { describe, expect, test } from 'bun:test';
import { getSearchIndex, type SearchResult } from './search';

const REQUIRED_KEYS = ['content', 'description', 'href', 'title'] as const;

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
