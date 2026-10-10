import { afterEach, beforeEach, describe, expect, mock, test } from 'bun:test';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';

// usePathname / useRouter を切替可能にする。
// mock.module は import より前に評価されるため、layout 内で render される
// SearchModal (useRouter) と DocsSidebar (usePathname) は常にモック版を解決する。
let currentPath = '/docs/owasp';
const pushMock = mock(() => {});
mock.module('next/navigation', () => ({
    usePathname: () => currentPath,
    useRouter: () => ({ push: pushMock }),
}));

import DocsLayout from './layout';
import { docsConfig } from '@/config/docs';

const allItems = docsConfig.sidebarNav.flatMap((section) => section.items);

// SearchModal の mount-time fetch を解決させてから assertion する。
const renderLayout = async (): Promise<ReturnType<typeof render>> => {
    let result: ReturnType<typeof render> | undefined = undefined;
    await act(async () => {
        result = render(<DocsLayout>content</DocsLayout>);
        await Promise.resolve();
        await Promise.resolve();
    });
    const menu = screen.queryByRole('button', { name: 'ドキュメントメニュー' });
    if (menu) fireEvent.click(menu);
    return result!;
};

describe('DocsLayout', () => {
    beforeEach(() => {
        // SearchModal が mount 時に /search-index.json を fetch する。
        // 失敗ログを抑えるために空配列を返すスタブを与える。
        globalThis.fetch = mock(
            async () =>
                ({
                    ok: true,
                    json: async () => [],
                }) as unknown as Response,
        ) as unknown as typeof fetch;
    });

    afterEach(() => {
        cleanup();
    });

    describe('header navigation', () => {
        test('グローバルナビはヘッダー内にあり、本文の左サイドバーと幅制限を廃止する', async () => {
            const { container } = await renderLayout();
            const nav = screen.getByRole('navigation');
            expect(nav.closest('header')).not.toBeNull();
            expect(container.querySelector('aside')).toBeNull();
            expect(container.querySelector('main')?.parentElement?.classList.contains('container')).toBe(false);
            expect(container.querySelector('article')).toHaveClass('docs-article');
        });
        test('sidebarNav に定義された全エントリ (12 件) がリンクとして描画される', async () => {
            currentPath = '/docs/archive/approach';
            await renderLayout();

            for (const item of allItems) {
                const link = screen.getByRole('link', { name: item.title });
                expect(link).toBeInTheDocument();
                expect(link).toHaveAttribute('href', item.href);
            }
            // docsConfig 変更時に追従漏れを検知するための件数アサーション
            expect(allItems.length).toBe(12);
        });

        test('セクション見出し (6 件) が描画される', async () => {
            currentPath = '/docs/archive/approach';
            await renderLayout();

            for (const section of docsConfig.sidebarNav) {
                expect(screen.getByText(section.title)).toBeInTheDocument();
            }
            expect(docsConfig.sidebarNav.length).toBe(6);
        });

        test('グローバルナビが名前付き nav 要素として描画される', async () => {
            currentPath = '/docs/archive/approach';
            await renderLayout();

            // layout には他に nav 要素を持たないので getByRole で一意に取得できる
            const nav = screen.getByRole('navigation', { name: 'グローバルナビゲーション' });
            expect(nav).toBeInTheDocument();
        });
    });

    describe('active link', () => {
        test('CCIE Security の新カテゴリーに現在ページ表示を付与する', async () => {
            currentPath = '/docs/ccie-security';
            await renderLayout();
            expect(screen.getByText('Security Certifications')).toBeInTheDocument();
            expect(screen.getByRole('link', { name: 'CCIE Security' })).toHaveAttribute('aria-current', 'page');
        });
        test('現在のパスに対応するリンクが aria-current="page" になる', async () => {
            currentPath = '/docs/owasp';
            await renderLayout();

            const activeLink = screen.getByRole('link', {
                name: 'OWASP Top 10 (2025/2026)',
            });
            expect(activeLink).toHaveAttribute('aria-current', 'page');
        });

        test('現在のパス以外のサイドバーリンクは aria-current を持たない', async () => {
            currentPath = '/docs/owasp';
            await renderLayout();

            const inactiveItems = allItems.filter((item) => item.href !== '/docs/owasp');
            for (const item of inactiveItems) {
                const link = screen.getByRole('link', { name: item.title });
                expect(link).not.toHaveAttribute('aria-current');
            }
        });

        test('docs 配下でないパス ("/") では全リンクが非アクティブ', async () => {
            currentPath = '/';
            await renderLayout();

            for (const item of allItems) {
                const link = screen.getByRole('link', { name: item.title });
                expect(link).not.toHaveAttribute('aria-current');
            }
        });

        test('アクティブリンクには視覚スタイル用のクラスが付与される', async () => {
            currentPath = '/docs/pqc';
            await renderLayout();

            const activeLink = screen.getByRole('link', {
                name: 'Post-Quantum Cryptography',
            });
            // DocsSidebar の activeLinkClass に含まれる識別子
            expect(activeLink.className).toContain('font-medium');
        });
    });

    describe('mobile responsive', () => {
        test('ヘッダーのメニューを開閉でき、Escapeで閉じてボタンにフォーカスを戻す', async () => {
            currentPath = '/docs/archive/approach';
            await renderLayout();
            const button = screen.getByRole('button', { name: 'ドキュメントメニュー' });
            expect(button).toHaveAttribute('aria-expanded', 'true');
            fireEvent.keyDown(document, { key: 'Escape' });
            expect(button).toHaveAttribute('aria-expanded', 'false');
            expect(button).toHaveFocus();
            expect(screen.queryByRole('navigation', { name: 'グローバルナビゲーション' })).toBeNull();
            fireEvent.click(button);
            expect(screen.getByRole('navigation', { name: 'グローバルナビゲーション' })).toBeInTheDocument();
        });
    });
});
