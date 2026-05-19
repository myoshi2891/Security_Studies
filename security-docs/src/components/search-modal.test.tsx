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
});
