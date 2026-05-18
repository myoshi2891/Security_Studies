import { render, screen, cleanup, fireEvent, act } from '@testing-library/react';
import { describe, test, expect, afterEach } from 'bun:test';
import { DisclaimerModal, STORAGE_KEY } from './disclaimer-modal';

describe('DisclaimerModal', () => {
    afterEach(() => {
        cleanup();
        localStorage.clear();
    });

    test('初回訪問時にフルスクリーンのダイアログを表示する', () => {
        render(<DisclaimerModal />);

        const dialog = screen.getByRole('dialog');
        expect(dialog).toBeInTheDocument();
        expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    test('指定された免責文言を表示する', () => {
        render(<DisclaimerModal />);

        expect(
            screen.getByText(/本サイトは個人学習を目的として作成したものです/),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/最新の公式情報は各試験プロバイダーの公式サイトをご確認ください/),
        ).toBeInTheDocument();
    });

    test('「同意して閲覧する」ボタン押下でモーダルが消え、localStorage に同意を記録する', () => {
        render(<DisclaimerModal />);

        const button = screen.getByRole('button', { name: '同意して閲覧する' });
        fireEvent.click(button);

        expect(screen.queryByRole('dialog')).toBeNull();
        expect(localStorage.getItem(STORAGE_KEY)).toBe('1');
    });

    test('localStorage に同意フラグが既にある場合はモーダルを表示しない', () => {
        localStorage.setItem(STORAGE_KEY, '1');

        render(<DisclaimerModal />);

        expect(screen.queryByRole('dialog')).toBeNull();
    });

    test('他タブ相当の storage イベントで同意状態が同期される', () => {
        render(<DisclaimerModal />);
        expect(screen.getByRole('dialog')).toBeInTheDocument();

        localStorage.setItem(STORAGE_KEY, '1');
        act(() => {
            window.dispatchEvent(
                new StorageEvent('storage', {
                    key: STORAGE_KEY,
                    newValue: '1',
                    oldValue: null,
                    storageArea: localStorage,
                }),
            );
        });

        expect(screen.queryByRole('dialog')).toBeNull();
    });
});
