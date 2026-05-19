import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { DisclaimerModal } from "@/components/disclaimer-modal";

export const metadata: Metadata = {
  title: "Security Studies 2026",
  description: "Advanced Security Documentation for 2026",
};

/**
 * Root layout component that renders the application's top-level HTML and body structure and includes the disclaimer modal.
 *
 * This component invokes `headers()` to enable dynamic rendering so Next.js can attach CSP nonces to internal script tags when required.
 *
 * @param children - The page content to render inside the document body.
 * @returns The root HTML element containing the document body with `children` and the `DisclaimerModal`.
 */
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // headers() を呼ぶことで dynamic rendering を有効化し、
  // Next.js が proxy.ts の x-nonce を内部 script tag に自動付与できるようにする。
  // これを呼ばないと Static Generation 時に nonce が埋め込まれず CSP strict-dynamic で全 script が block される。
  await headers();

  return (
    <html lang="ja" className="scroll-smooth motion-reduce:scroll-auto">
      <body className="antialiased font-sans bg-white dark:bg-zinc-950">
        {children}
        <DisclaimerModal />
      </body>
    </html>
  );
}
