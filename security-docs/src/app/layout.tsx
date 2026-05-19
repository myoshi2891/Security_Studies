import type { Metadata } from "next";
import "./globals.css";
import { DisclaimerModal } from "@/components/disclaimer-modal";

export const metadata: Metadata = {
  title: "Security Studies 2026",
  description: "Advanced Security Documentation for 2026",
};

/**
 * Root layout that wraps page content with the application HTML/body structure and disclaimer modal.
 *
 * CSP は proxy.ts が静的構成（'self' 'unsafe-inline'）で発行するため、nonce の
 * リクエストヘッダ読み取りは不要（Issue #32 対応で nonce 機構を撤廃）。
 *
 * @param children - レイアウト内に描画するページコンテンツ
 * @returns html / body と DisclaimerModal を含むルート構造
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="scroll-smooth motion-reduce:scroll-auto">
      <body className="antialiased font-sans bg-white dark:bg-zinc-950">
        {children}
        <DisclaimerModal />
      </body>
    </html>
  );
}
