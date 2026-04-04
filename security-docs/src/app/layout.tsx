import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Security Studies 2026",
  description: "Advanced Security Documentation for 2026",
};

/**
 * Root layout component that renders the top-level HTML and body wrappers for the app.
 *
 * @param children - Content to be rendered inside the document body
 * @returns The top-level `<html lang="ja">` element with a styled `<body>` that contains `children`
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" data-scroll-behavior="smooth">
      <body className="antialiased font-sans bg-white dark:bg-zinc-950">
        {children}
      </body>
    </html>
  );
}
