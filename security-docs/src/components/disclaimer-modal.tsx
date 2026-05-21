'use client';

import { useEffect, useState, useCallback } from 'react';

export const STORAGE_KEY = 'security-docs:disclaimer-acknowledged';

/**
 * Determines whether the user has previously acknowledged the disclaimer in browser storage.
 *
 * @returns `true` if the stored consent value for the module key is exactly `'1'`, `false` otherwise or if storage access fails.
 */
function readConsent(): boolean {
    try {
        return localStorage.getItem(STORAGE_KEY) === '1';
    } catch {
        return false;
    }
}

/**
 * Render a client-side disclaimer modal that requires the user to acknowledge terms before viewing the site.
 *
 * The component reads and persists acknowledgement via localStorage under `STORAGE_KEY`, and synchronizes acknowledgement state across tabs/windows via the `storage` event. It is intentionally hidden during server-side rendering/hydration to avoid HTML mismatches and will only reflect the actual persisted state on the client.
 *
 * @returns A React element for the modal, or `null` when the user has acknowledged (`localStorage[STORAGE_KEY] === '1'`) or has dismissed the modal in the current session.
 */
export function DisclaimerModal() {
    // SSR / hydration では常に非表示（HTML 不一致を防ぐ）。client 側で useEffect により実値を反映する。
    const [consented, setConsented] = useState(true);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        // Hydration 後にクライアント側 localStorage の実値で同期する正当パターン。
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setConsented(readConsent());
        const onStorage = (event: StorageEvent) => {
            if (event.key === null) {
                // localStorage.clear() はすべてのキーを消去するため同意と dismissed を両方リセット
                setConsented(false);
                setDismissed(false);
            } else if (event.key === STORAGE_KEY) {
                const newConsent = event.newValue === '1';
                setConsented(newConsent);
                if (!newConsent) {
                    setDismissed(false);
                }
            }
        };
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, []);

    const handleAgree = useCallback(() => {
        try {
            localStorage.setItem(STORAGE_KEY, '1');
            setConsented(true);
        } catch {
            // localStorage が無効化されている環境ではモーダルを閉じる動作のみ行う
        }
        setDismissed(true);
    }, []);

    // Escape キーでモーダルを閉じる、および Tab キーによるフォーカストラップの制御
    useEffect(() => {
        if (consented || dismissed) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                handleAgree();
            }

            if (e.key === 'Tab') {
                e.preventDefault();
                // 唯一のフォーカス可能要素である「同意して閲覧する」ボタンにフォーカスを強制
                const button = document.querySelector('button[autoFocus]');
                if (button instanceof HTMLElement) {
                    button.focus();
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [consented, dismissed, handleAgree]);

    // モーダル表示中のボディスクロール制御
    useEffect(() => {
        if (!consented && !dismissed) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [consented, dismissed]);

    if (consented || dismissed) return null;

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="disclaimer-title"
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-[4px] p-4"
        >
            <div className="w-full max-w-xl rounded-xl border border-yellow-400/40 bg-white dark:bg-zinc-950 shadow-2xl p-6 sm:p-8">
                <h2
                    id="disclaimer-title"
                    className="flex items-center gap-2 text-lg sm:text-xl font-bold text-yellow-500"
                >
                    <span aria-hidden="true">⚠️</span>
                    <span>免責事項</span>
                </h2>
                <div className="mt-4 space-y-3 text-sm sm:text-base leading-relaxed text-zinc-700 dark:text-zinc-300">
                    <p>
                        本サイトは個人学習を目的として作成したものです。掲載内容の正確性・完全性は保証されておらず、試験の合否を含むいかなる結果に対しても責任を負いません。
                    </p>
                    <p>最新の公式情報は各試験プロバイダーの公式サイトをご確認ください。</p>
                </div>
                <div className="mt-6 flex justify-end">
                    <button
                        type="button"
                        autoFocus
                        onClick={handleAgree}
                        className="inline-flex items-center justify-center rounded-md bg-yellow-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-yellow-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-500 transition-colors"
                    >
                        同意して閲覧する
                    </button>
                </div>
            </div>
        </div>
    );
}
