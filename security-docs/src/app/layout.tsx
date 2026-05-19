import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { DisclaimerModal } from "@/components/disclaimer-modal";

export const metadata: Metadata = {
  title: "Security Studies 2026",
  description: "Advanced Security Documentation for 2026",
};

/**
 * Root layout component that wraps page content with the application HTML/body structure and disclaimer modal.
 *
 * This component reads the `x-nonce` header so Next.js registers a nonce for framework-generated `<script>` tags,
 * ensuring those scripts receive a `nonce` attribute. It renders the document `<html>` and `<body>` with the
 * provided `children` and a `DisclaimerModal`.
 *
 * @param children - Page content to render inside the layout
 * @returns The root HTML structure containing `children` and the `DisclaimerModal`
 */
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // proxy.ts が設定した x-nonce を明示的に読み取る。
  // Next.js App Router は .get('x-nonce') の呼び出し自体をトリガーとして
  // レンダリングコンテキストに nonce を登録し、フレームワークが生成する全
  // <script>（RSC インライン・静的チャンク等）に nonce 属性を自動付与する。
  // await headers() だけでは値が登録されない点に注意。
  const nonce = (await headers()).get('x-nonce') ?? undefined;

  return (
    <html lang="ja" className="scroll-smooth motion-reduce:scroll-auto">
      <body className="antialiased font-sans bg-white dark:bg-zinc-950">
        {children}
        <DisclaimerModal />
      </body>
    </html>
  );
}
