import Link from "next/link";
import {
  Archive,
  ArrowRight,
  BookOpen,
  Boxes,
  BrainCircuit,
  ChevronRight,
  LockKeyhole,
  Radar,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { docsConfig } from "@/config/docs";

const sectionMeta = [
  { icon: BookOpen, label: "Foundation", tone: "cyan" },
  { icon: BrainCircuit, label: "Applied security", tone: "violet" },
  { icon: Boxes, label: "Deep dives", tone: "amber" },
  { icon: Radar, label: "Field resources", tone: "green" },
  { icon: Archive, label: "Previous editions", tone: "slate" },
] as const;

export default function HomePage() {
  const articleCount = docsConfig.sidebarNav.reduce(
    (total, section) => total + section.items.length,
    0,
  );
  const domainCount = docsConfig.sidebarNav.length;

  return (
    <div className="landing-shell">
      <header className="landing-header">
        <div className="landing-container landing-nav">
          <Link href="/" className="brand" aria-label="Security Studies 2026 home">
            <span className="brand-mark" aria-hidden="true">
              <ShieldCheck size={18} strokeWidth={2.2} />
            </span>
            <span>Security Studies</span>
            <span className="brand-year">/ 2026</span>
          </Link>

          <nav className="landing-nav-links" aria-label="Main navigation">
            <a href="#library">Library</a>
            <Link href="/docs/approach" className="nav-cta">
              Documentation <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="hero-section">
          <div className="hero-grid" aria-hidden="true" />
          <div className="hero-glow hero-glow-one" aria-hidden="true" />
          <div className="hero-glow hero-glow-two" aria-hidden="true" />

          <div className="landing-container hero-layout">
            <div className="hero-copy">
              <div className="eyebrow">
                <span className="live-dot" />
                2026 SECURITY FIELD GUIDE
                <span className="eyebrow-separator" />
                <Sparkles size={13} aria-hidden="true" />
                UPDATED
              </div>

              <h1>
                Build software that is
                <span className="hero-accent"> ready for what&apos;s next.</span>
              </h1>

              <p className="hero-description">
                産業化するサイバー脅威、AIの兵器化、耐量子計算機暗号。
                変化の先を読み、実装に落とし込むためのセキュリティ・ナレッジベース。
              </p>

              <div className="hero-actions">
                <Link href="/docs/approach" className="primary-button">
                  ガイドをはじめる
                  <ArrowRight size={17} aria-hidden="true" />
                </Link>
                <a href="#library" className="secondary-button">
                  収録内容を見る
                </a>
              </div>

              <div className="hero-metrics" role="group" aria-label="Guide statistics">
                <div>
                  <strong>{String(articleCount).padStart(2, "0")}</strong>
                  <span>FIELD GUIDES</span>
                </div>
                <div>
                  <strong>{String(domainCount).padStart(2, "0")}</strong>
                  <span>DOMAINS</span>
                </div>
                <div>
                  <strong>2026</strong>
                  <span>THREAT READY</span>
                </div>
              </div>
            </div>

            <div className="security-visual" aria-hidden="true">
              <div className="visual-status visual-status-top">
                <span>POSTURE</span>
                <strong>HARDENED</strong>
              </div>
              <div className="visual-status visual-status-bottom">
                <span>THREAT INTEL</span>
                <strong>ACTIVE</strong>
              </div>

              <div className="orbit orbit-outer">
                <span className="orbit-node" />
              </div>
              <div className="orbit orbit-middle">
                <span className="orbit-node" />
              </div>
              <div className="orbit orbit-inner" />

              <div className="core-wrap">
                <div className="core-halo" />
                <div className="security-core">
                  <div className="core-grid" />
                  <LockKeyhole size={54} strokeWidth={1.35} />
                  <span>ZERO TRUST</span>
                </div>
              </div>

              <div className="scan-line" />
              <span className="coordinate coordinate-one">35.6762° N</span>
              <span className="coordinate coordinate-two">139.6503° E</span>
            </div>
          </div>

          <div className="hero-marquee" aria-hidden="true">
            <div>
              <span>SECURE BY DESIGN</span><i />
              <span>AI SECURITY</span><i />
              <span>POST-QUANTUM</span><i />
              <span>SUPPLY CHAIN</span><i />
              <span>ZERO TRUST</span><i />
              <span>SECURE BY DESIGN</span><i />
              <span>AI SECURITY</span><i />
              <span>POST-QUANTUM</span><i />
              <span>SUPPLY CHAIN</span><i />
              <span>ZERO TRUST</span><i />
            </div>
          </div>
        </section>

        <section id="library" className="library-section">
          <div className="landing-container">
            <div className="section-heading">
              <div>
                <span className="section-kicker">KNOWLEDGE LIBRARY</span>
                <h2>Navigate the threat landscape.</h2>
              </div>
              <p>
                基礎設計からAIセキュリティ、サプライチェーン、PQCまで。
                必要な知識へすぐにアクセスできます。
              </p>
            </div>

            <div className="category-grid">
              {docsConfig.sidebarNav.map((section, index) => {
                const meta = sectionMeta[index] ?? sectionMeta[0];
                const Icon = meta.icon;

                return (
                  <article
                    key={section.title}
                    className={`category-card category-${meta.tone}`}
                  >
                    <div className="card-topline">
                      <span className="card-number">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="card-icon"><Icon size={21} /></span>
                    </div>
                    <span className="card-label">{meta.label}</span>
                    <h3>{section.title}</h3>
                    <ul>
                      {section.items.map((item) => (
                        <li key={item.href}>
                          <Link href={item.href}>
                            <span>{item.title}</span>
                            <ChevronRight size={15} aria-hidden="true" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <div className="card-noise" aria-hidden="true" />
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="landing-container footer-inner">
          <div className="brand footer-brand">
            <span className="brand-mark"><ShieldCheck size={16} /></span>
            <span>Security Studies</span>
          </div>
          <p>Advanced security guidance for engineers building the future.</p>
          <span>© 2026</span>
        </div>
      </footer>
    </div>
  );
}
