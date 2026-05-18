import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { DisclaimerModal } from "@/components/disclaimer-modal";

export const metadata: Metadata = {
  title: "Security Studies 2026",
  description: "Advanced Security Documentation for 2026",
};

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
