import { afterEach, beforeEach, describe, expect, mock, test } from 'bun:test';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';

// next/navigation の useRouter を差し替える。
// mock.module は import より前に評価されるため、SearchModal は常にモック版を解決する。
const pushMock = mock(() => {});
mock.module('next/navigation', () => ({
    useRouter: () => ({ push: pushMock }),
}));

import { SearchModal } from './search-modal';

const MAC_UA =
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15';
const WIN_UA =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

const setUserAgent = (ua: string): void => {
    Object.defineProperty(window.navigator, 'userAgent', {
        value: ua,
        configurable: true,
    });
};

const mockFetchOnce = (data: unknown, ok = true): void => {
    globalThis.fetch = mock(
        async () =>
            ({
                ok,
                json: async () => data,
            }) as unknown as Response,
    ) as unknown as typeof fetch;
};

// 初期 render 内で発火する useEffect の fetch promise を解決させる。
const flushEffects = async (): Promise<void> => {
    await act(async () => {
        await Promise.resolve();
        await Promise.resolve();
    });
};

describe('SearchModal', () => {
    beforeEach(() => {
        mockFetchOnce([]);
        pushMock.mockClear();
    });

    afterEach(() => {
        cleanup();
    });

    describe('initial render', () => {
        test('閉じた状態では "Search..." トリガーボタンを表示しダイアログは存在しない', async () => {
            setUserAgent(WIN_UA);
            render(<SearchModal />);
            await flushEffects();

            expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
            expect(screen.queryByRole('dialog')).toBeNull();
        });

        test('macOS UA では ⌘K ショートカットラベルを表示する', async () => {
            setUserAgent(MAC_UA);
            render(<SearchModal />);
            await flushEffects();

            // ⌘ と K が分離した要素として描画される (search-modal.tsx 行 106-109)
            expect(screen.getByText('⌘')).toBeInTheDocument();
        });

        test('Windows UA では Ctrl+K ショートカットラベルを表示する', async () => {
            setUserAgent(WIN_UA);
            render(<SearchModal />);
            await flushEffects();

            expect(screen.getByText('Ctrl+K')).toBeInTheDocument();
        });
    });

    describe('keyboard shortcut', () => {
        test('Cmd+K でモーダルが開く', async () => {
            setUserAgent(MAC_UA);
            render(<SearchModal />);
            await flushEffects();

            await act(async () => {
                fireEvent.keyDown(document, { key: 'k', metaKey: true });
            });

            expect(screen.getByRole('dialog')).toBeInTheDocument();
        });

        test('Ctrl+K でモーダルが開く', async () => {
            setUserAgent(WIN_UA);
            render(<SearchModal />);
            await flushEffects();

            await act(async () => {
                fireEvent.keyDown(document, { key: 'k', ctrlKey: true });
            });

            expect(screen.getByRole('dialog')).toBeInTheDocument();
        });

        test('モーダル展開中に Escape を押すと閉じる', async () => {
            setUserAgent(MAC_UA);
            render(<SearchModal />);
            await flushEffects();

            await act(async () => {
                fireEvent.keyDown(document, { key: 'k', metaKey: true });
            });
            expect(screen.getByRole('dialog')).toBeInTheDocument();

            await act(async () => {
                fireEvent.keyDown(document, { key: 'Escape' });
            });
            expect(screen.queryByRole('dialog')).toBeNull();
        });
    });

    describe('search query and results', () => {
        const openModal = async (): Promise<void> => {
            await act(async () => {
                fireEvent.keyDown(document, { key: 'k', ctrlKey: true });
            });
        };

        const typeQuery = async (value: string): Promise<HTMLInputElement> => {
            const input = screen.getByRole('textbox', {
                name: 'Search documentation',
            }) as HTMLInputElement;
            await act(async () => {
                fireEvent.change(input, { target: { value } });
            });
            return input;
        };

        test('モーダル開いた直後はガイダンス文を表示する', async () => {
            setUserAgent(WIN_UA);
            render(<SearchModal />);
            await flushEffects();
            await openModal();

            expect(screen.getByText('Type to start searching...')).toBeInTheDocument();
        });

        test('マッチしないクエリでは "No results for ..." を表示する', async () => {
            setUserAgent(WIN_UA);
            mockFetchOnce([
                {
                    title: 'XSS',
                    description: 'XSS attacks',
                    href: '/docs/xss',
                    content: 'cross-site scripting',
                },
            ]);
            render(<SearchModal />);
            await flushEffects();
            await openModal();
            await typeQuery('zzz_no_match_zzz');

            expect(screen.getByText('No results for "zzz_no_match_zzz"')).toBeInTheDocument();
        });

        test('マッチするクエリで結果ボタンを描画する', async () => {
            setUserAgent(WIN_UA);
            mockFetchOnce([
                {
                    title: 'XSS',
                    description: 'XSS attacks',
                    href: '/docs/xss',
                    content: 'cross-site scripting',
                },
                {
                    title: 'CSRF',
                    description: 'CSRF intro',
                    href: '/docs/csrf',
                    content: 'cross-site request forgery',
                },
            ]);
            render(<SearchModal />);
            await flushEffects();
            await openModal();
            await typeQuery('XSS');

            // findByRole は fuse 初期化の追加 tick 待ちを兼ねる
            expect(await screen.findByRole('button', { name: 'Open XSS' })).toBeInTheDocument();
        });

        test('結果クリックで router.push を呼びモーダルを閉じる', async () => {
            setUserAgent(WIN_UA);
            mockFetchOnce([
                {
                    title: 'XSS',
                    description: 'XSS attacks',
                    href: '/docs/xss',
                    content: 'cross-site scripting',
                },
            ]);
            render(<SearchModal />);
            await flushEffects();
            await openModal();
            await typeQuery('XSS');

            const resultButton = await screen.findByRole('button', { name: 'Open XSS' });
            await act(async () => {
                fireEvent.click(resultButton);
            });

            expect(pushMock).toHaveBeenCalledWith('/docs/xss');
            expect(screen.queryByRole('dialog')).toBeNull();
        });

        test('オーバーレイ (バックドロップ) クリックでモーダルを閉じる', async () => {
            setUserAgent(WIN_UA);
            render(<SearchModal />);
            await flushEffects();
            await openModal();

            const dialog = screen.getByRole('dialog');
            const overlay = dialog.parentElement;
            if (!overlay) {
                throw new Error('backdrop element should exist as the dialog parent');
            }

            await act(async () => {
                fireEvent.click(overlay);
            });

            expect(screen.queryByRole('dialog')).toBeNull();
        });

        test('input への入力が DOM 値として反映される (aria-label 経由でアクセス可能)', async () => {
            setUserAgent(WIN_UA);
            render(<SearchModal />);
            await flushEffects();
            await openModal();

            const input = await typeQuery('hello');
            expect(input.value).toBe('hello');
        });
    });
});
