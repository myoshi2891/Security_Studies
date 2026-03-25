import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex-1 bg-[var(--bg)] flex flex-col">
      <header className="relative overflow-hidden flex-1 flex flex-col justify-center min-h-[80vh]">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--surface)] via-[#0d2b1f] to-[var(--bg)]"></div>
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 0%, var(--primary-glow), transparent)' }}></div>
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--primary-glow)] bg-[var(--primary-dim)] px-4 py-1.5 mb-6">
            <span className="w-2 h-2 rounded-full bg-[var(--primary)] animate-pulse"></span>
            <span className="font-mono text-xs text-[var(--primary)] tracking-wider uppercase">Security Engineering | 2026 Edition</span>
          </div>
          
          <h1 className="font-display text-5xl md:text-6xl font-extrabold text-white leading-[1.15] mb-6">
            ソフトウェア開発<br/>
            <span style={{ color: 'var(--primary)' }}>セキュリティ完全ガイド</span>
          </h1>
          
          <p className="text-lg md:text-xl text-[var(--text-muted)] max-w-2xl mb-10 leading-relaxed">
            2026年3月時点の最新脅威ランドスケープと実践的対策を、初学者にもわかりやすくステップバイステップで解説します。
          </p>
          
          <div className="flex flex-wrap gap-3 mb-10">
            <span className="chip">🔒 v2026.03</span>
            <span className="chip">👤 初学者〜中級者</span>
            <span className="chip">📅 2026-03-25</span>
            <span className="chip">⏱️ 読了 約30分</span>
          </div>

          <Link href="/docs" className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-[#07090f] bg-[var(--primary)] rounded-full hover:opacity-90 transition-opacity">
            ドキュメントを読む →
          </Link>
        </div>
      </header>
    </main>
  );
}