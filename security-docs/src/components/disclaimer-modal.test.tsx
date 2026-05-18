import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { describe, test, expect, afterEach } from 'bun:test';
import { DisclaimerModal } from './disclaimer-modal';

const STORAGE_KEY = 'security-docs:disclaimer-acknowledged';

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
});
