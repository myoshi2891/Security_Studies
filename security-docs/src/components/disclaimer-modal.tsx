'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'security-docs:disclaimer-acknowledged';

export function DisclaimerModal() {
    // null = 未判定 (SSR / マウント直後)。判定確定後に boolean をセットする
    const [isOpen, setIsOpen] = useState<boolean | null>(null);

    useEffect(() => {
        try {
            const acknowledged = localStorage.getItem(STORAGE_KEY) === '1';
            setIsOpen(!acknowledged);
        } catch {
            // localStorage が読めない場合は安全側に倒してモーダルを表示する
            setIsOpen(true);
        }
    }, []);

    const handleAgree = () => {
        try {
            localStorage.setItem(STORAGE_KEY, '1');
        } catch {
            // localStorage が無効化されている環境ではモーダルを閉じる動作のみ行う
        }
        setIsOpen(false);
    };

    if (isOpen !== true) return null;

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
