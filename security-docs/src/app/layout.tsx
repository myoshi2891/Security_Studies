import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Security Studies",
  description: "Advanced Security Documentation for 2026",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
