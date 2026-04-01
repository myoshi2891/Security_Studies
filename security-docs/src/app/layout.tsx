import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Security Studies 2026",
  description: "Advanced Security Documentation for 2026",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased font-sans bg-white dark:bg-zinc-950">
        {children}
      </body>
    </html>
  );
}
