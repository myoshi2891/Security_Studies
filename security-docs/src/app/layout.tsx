import { RootProvider } from 'fumadocs-ui/provider/next';
import './global.css';
import { Space_Grotesk, Noto_Sans_JP, JetBrains_Mono } from 'next/font/google';
import type { ReactNode } from 'react';

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-display' });
const notoSansJP = Noto_Sans_JP({ subsets: ['latin'], variable: '--font-body', weight: ['300', '400', '500', '700'] });
const jetBrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja" className={`${spaceGrotesk.variable} ${notoSansJP.variable} ${jetBrainsMono.variable} dark`} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen font-body antialiased bg-[var(--bg)] text-[var(--text)]">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}