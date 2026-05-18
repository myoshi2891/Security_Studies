'use client';

import { useState } from 'react';

export function DisclaimerModal() {
    const [isOpen, setIsOpen] = useState(true);

    if (!isOpen) return null;

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
                        onClick={() => setIsOpen(false)}
                        className="inline-flex items-center justify-center rounded-md bg-yellow-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-yellow-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-500 transition-colors"
                    >
                        同意して閲覧する
                    </button>
                </div>
            </div>
        </div>
    );
}
