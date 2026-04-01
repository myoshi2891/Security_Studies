import Link from "next/link";
import { docsConfig } from "@/config/docs";

export default function HomePage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'between', height: '4rem' }}>
          <div style={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.02em' }}>
            Security Studies 2026
          </div>
          <nav style={{ display: 'flex', gap: '1.5rem' }}>
            <Link href="/docs/approach" style={{ fontSize: '0.875rem', fontWeight: 500, color: 'inherit', textDecoration: 'none' }}>
              Documentation
            </Link>
          </nav>
        </div>
      </header>

      <main style={{ flex: 1 }}>
        <section style={{ padding: '8rem 0', textAlign: 'center' }}>
          <div className="container">
            <h1 style={{ fontSize: '4.5rem', fontWeight: 900, letterSpacing: '-0.05em', marginBottom: '1.5rem', lineHeight: 1 }}>
              Master Software Security <br /> for 2026.
            </h1>
            <p style={{ fontSize: '1.25rem', color: 'var(--zinc-500)', maxWidth: '42rem', margin: '0 auto 2.5rem', lineHeight: 1.6 }}>
              高度に産業化されたサイバー脅威、AIの兵器化、耐量子計算機暗号。
              現代のエンジニアが知るべき、セキュア開発のすべてを体系化した完全版ガイドブック。
            </p>
            <Link
              href="/docs/approach"
              style={{
                display: 'inline-flex',
                height: '3.5rem',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '9999px',
                backgroundColor: 'var(--fg)',
                color: 'var(--bg)',
                padding: '0 2.5rem',
                fontSize: '1rem',
                fontWeight: 600,
                textDecoration: 'none',
                transition: 'opacity 0.2s'
              }}
            >
              Get Started
            </Link>
          </div>
        </section>

        <section style={{ padding: '6rem 0', backgroundColor: 'var(--zinc-50)' }}>
          <div className="container">
            <h2 style={{ fontSize: '2rem', fontWeight: 800, textAlign: 'center', marginBottom: '4rem' }}>
              Documentation Categories
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
              {docsConfig.sidebarNav.map((section) => (
                <div key={section.title} style={{ padding: '2.5rem', backgroundColor: 'var(--bg)', borderRadius: '1rem', border: '1px solid var(--border)', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>{section.title}</h3>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.75rem' }}>
                    {section.items.map((item) => (
                      <li key={item.href}>
                        <Link href={item.href} style={{ color: 'var(--zinc-500)', textDecoration: 'none', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'var(--zinc-300)' }} />
                          {item.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer style={{ padding: '4rem 0', borderTop: '1px solid var(--border)', textAlign: 'center', color: 'var(--zinc-500)', fontSize: '0.875rem' }}>
        <p>© 2026 Security Studies Project. Advanced Security Guidance.</p>
      </footer>
    </div>
  );
}
