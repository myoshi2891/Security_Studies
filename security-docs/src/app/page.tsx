import Link from "next/link";
import { DocsHeaderNav } from "@/components/docs/DocsHeaderNav";
import { ArrowRight, BookOpen, ChevronRight, FileCheck2, ShieldCheck } from "lucide-react";
import { docsConfig } from "@/config/docs";

export default function HomePage() {
  const articleCount = docsConfig.sidebarNav.reduce((total, section) => total + section.items.length, 0);
  const iso = docsConfig.sidebarNav.find(section => section.id === "iso")!;

  return (
    <div className="landing-shell knowledge-home">
      <header className="landing-header">
        <div className="landing-container landing-nav">
          <Link href="/" className="brand" aria-label="Security Studies 2026 home">
            <span className="brand-mark" aria-hidden="true"><ShieldCheck size={18} /></span>
            <span>Security Studies</span><span className="brand-year">/ 2026</span>
          </Link>
          <DocsHeaderNav />
        </div>
      </header>

      <main>
        <section className="hero-section">
          <div className="hero-grid" aria-hidden="true" />
          <div className="landing-container knowledge-hero">
            <div className="hero-copy">
              <div className="eyebrow"><span className="live-dot" />SECURITY KNOWLEDGE / 2026</div>
              <h1>知識をつなぎ、<br /><span className="hero-accent">確かな防御へ。</span></h1>
              <p className="hero-description">設計と開発、AI、クラウド、そして国際規格。<br />セキュリティを理解し、実践するためのガイドを、<br className="desktop-break" />学びたい領域から探せます。</p>
              <div className="hero-actions">
                <a href="#library" className="primary-button">領域から探す<ArrowRight size={17} aria-hidden="true" /></a>
                <Link href="/docs/approach" className="secondary-button">基礎からはじめる</Link>
              </div>
              <div className="hero-metrics" role="group" aria-label="Guide statistics">
                <div><strong>{String(articleCount).padStart(2, "0")}</strong><span>GUIDES</span></div>
                <div><strong>{String(docsConfig.sidebarNav.length).padStart(2, "0")}</strong><span>DOMAINS</span></div>
                <div><strong>{String(iso.items.length).padStart(2, "0")}</strong><span>ISO STANDARDS</span></div>
              </div>
            </div>
            <nav className="knowledge-map" aria-label="学習領域へのショートカット">
              <div className="knowledge-map-heading"><span>EXPLORE THE LIBRARY</span><BookOpen size={18} aria-hidden="true" /></div>
              {docsConfig.sidebarNav.map((section, index) => (
                <a key={section.id} href={`#domain-${section.id}`} className={`knowledge-map-link category-${section.tone}`}>
                  <span className="map-number">{String(index + 1).padStart(2, "0")}</span>
                  <span>{section.label}<small>{section.title}</small></span>
                  <span className="map-count">{section.items.length}</span><ChevronRight size={15} aria-hidden="true" />
                </a>
              ))}
            </nav>
          </div>
        </section>

        <section className="iso-spotlight" aria-labelledby="iso-spotlight-title">
          <div className="landing-container iso-spotlight-inner">
            <span className="iso-spotlight-icon"><FileCheck2 size={28} aria-hidden="true" /></span>
            <div><span className="section-kicker">INTERNATIONAL STANDARDS</span><h2 id="iso-spotlight-title">国際規格を、実務の指針に。</h2><p>ISMSの基礎からクラウド管理策、セキュリティ製品の評価まで。</p></div>
            <a href="#domain-iso" className="secondary-button">ISO規格を探す<ArrowRight size={17} aria-hidden="true" /></a>
          </div>
        </section>

        <section id="library" className="library-section">
          <div className="landing-container">
            <div className="section-heading">
              <div><span className="section-kicker">KNOWLEDGE LIBRARY</span><h2>学びたい領域から。</h2></div>
              <p>全{articleCount}ガイドを、{docsConfig.sidebarNav.length}つの領域に。<br />必要な知識から読み進めてください。</p>
            </div>
            <div className="category-grid">
              {docsConfig.sidebarNav.map((section, index) => (
                <article id={`domain-${section.id}`} key={section.id} className={`category-card category-${section.tone}`}>
                  <div className="card-topline"><span className="card-number">{String(index + 1).padStart(2, "0")} / {section.title}</span><span className="category-count">{section.items.length} GUIDES</span></div>
                  <h3>{section.label}</h3><p className="category-description">{section.description}</p>
                  <ul>{section.items.map(item => (
                    <li key={item.href}><Link href={item.href}><span>{item.title}</span><ChevronRight size={15} aria-hidden="true" /></Link></li>
                  ))}</ul>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <footer className="landing-footer">
        <div className="landing-container footer-inner">
          <div className="brand footer-brand"><span className="brand-mark"><ShieldCheck size={16} aria-hidden="true" /></span><span>Security Studies</span></div>
          <p>理解から実践へ。セキュリティの知識を、次の一歩に。</p><span>© 2026</span>
        </div>
      </footer>
    </div>
  );
}
