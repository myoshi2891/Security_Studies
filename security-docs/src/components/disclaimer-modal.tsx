'use client';

import { useState, useSyncExternalStore } from 'react';

export const STORAGE_KEY = 'security-docs:disclaimer-acknowledged';
const SERVER_SNAPSHOT = 'server';
const UNSET = 'unset';

type ConsentSnapshot = typeof SERVER_SNAPSHOT | typeof UNSET | '1';

function subscribe(callback: () => void): () => void {
    window.addEventListener('storage', callback);
    return () => window.removeEventListener('storage', callback);
}

function getStoredConsent(): ConsentSnapshot {
    try {
        const value = localStorage.getItem(STORAGE_KEY);
        return value === '1' ? '1' : UNSET;
    } catch {
        return UNSET;
    }
}

function getServerStoredConsent(): ConsentSnapshot {
    return SERVER_SNAPSHOT;
}

export function DisclaimerModal() {
    const stored = useSyncExternalStore(
        subscribe,
        getStoredConsent,
        getServerStoredConsent,
    );
    const [dismissed, setDismissed] = useState(false);

    const handleAgree = () => {
        try {
            localStorage.setItem(STORAGE_KEY, '1');
        } catch {
            // localStorage が無効化されている環境ではモーダルを閉じる動作のみ行う
        }
        setDismissed(true);
    };

    if (stored !== UNSET || dismissed) return null;

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
