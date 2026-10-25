export interface DocsSection {
  id: string;
  title: string;
  label: string;
  description: string;
  tone: "cyan" | "green" | "violet" | "amber" | "slate";
  items: { title: string; href: string }[];
}

// One registry drives the header, home, sidebar, and search index.
// Stable IDs keep category links and presentation independent of display order.
export const docsConfig: { sidebarNav: DocsSection[] } = {
  sidebarNav: [
    {
      id: "foundation",
      title: "Getting Started",
      label: "基礎・設計",
      description: "セキュリティの全体像と、システム設計の考え方から。",
      tone: "cyan",
      items: [
        { title: "Security Approach 2026", href: "/docs/approach" },
        { title: "Security Architecture", href: "/docs/architecture" },
      ],
    },
    {
      id: "engineering",
      title: "Security Guides",
      label: "開発実践",
      description: "設計・実装・検証をつなぐ、開発者のための実践ガイド。",
      tone: "green",
      items: [
        { title: "Secure SDLC Guide", href: "/docs/secdev-guide" },
        { title: "Secure by Design 入門ガイド", href: "/docs/secure-by-design" },
        { title: "Ghost in the Wires", href: "/docs/ghost-in-the-wires-guide" },
        { title: "Secrets and Lies", href: "/docs/secrets-and-lies-guide" },
        { title: "Zero Trust Networks, 2nd Edition", href: "/docs/zero-trust-networks-2nd-edition-guide" },
        { title: "Threat Modeling 入門ガイド", href: "/docs/threat-modeling-guide" },
        { title: "脅威モデリング入門ガイド (Shostack)", href: "/docs/threat-modeling-shostack-guide" },
        { title: "Web Application Hacker's Handbook", href: "/docs/web-application-hackers-handbook" },
      ],
    },
    {
      id: "ai",
      title: "AI Security",
      label: "AIセキュリティ",
      description: "AIを使う開発から、LLMと機械学習システムの防御まで。",
      tone: "violet",
      items: [
        { title: "AI Coding Safety", href: "/docs/ai-coding-safety" },
        { title: "LLM & AI Security", href: "/docs/llm-ai-security" },
        { title: "MITRE ATLAS", href: "/docs/mitre-atlas" },
      ],
    },
    {
      id: "platform",
      title: "Cloud & Cryptography",
      label: "クラウド・暗号",
      description: "クラウド基盤、ソフトウェア供給網、現在と次世代の暗号技術。",
      tone: "cyan",
      items: [
        { title: "Hacking Kubernetes", href: "/docs/hacking-kubernetes" },
        { title: "Software Supply Chain", href: "/docs/supply-chain" },
        { title: "Bulletproof TLS and PKI", href: "/docs/bulletproof-tls-pki-guide" },
        { title: "Applied Cryptography", href: "/docs/applied-cryptography-guide" },
        { title: "Post-Quantum Cryptography", href: "/docs/pqc" },
      ],
    },
    {
      id: "threats",
      title: "Threats & Defense",
      label: "脅威・防御",
      description: "脅威動向と代表的な脆弱性を理解し、防御の優先順位を決める。",
      tone: "green",
      items: [
        { title: "Threat Landscape 2026", href: "/docs/threat-landscape" },
        { title: "OWASP Top 10 (2025/2026)", href: "/docs/owasp" },
      ],
    },
    {
      id: "iso",
      title: "ISO Standards",
      label: "ISO規格",
      description: "ISMS・クラウド管理策・製品評価。目的に合わせて国際規格を学ぶ。",
      tone: "amber",
      items: [
        { title: "ISO/IEC 27000:2026 入門ガイド", href: "/docs/iso-iec-27000-2026-guide" },
        { title: "ISO/IEC 27001:2022 初学者向けガイド", href: "/docs/iso-iec-27001-2022-guide" },
        { title: "ISO/IEC 27017:2026 初学者向けガイド", href: "/docs/iso-iec-27017-2026-guide" },
        { title: "ISO/IEC 15408-1:2026 初学者向けガイド", href: "/docs/iso-iec-15408-1-2026-guide" },
        { title: "ISO/IEC 18045:2026 初学者向け解説ガイド", href: "/docs/iso-iec-18045-2026-guide" },
      ],
    },
    {
      id: "learning",
      title: "Security Certifications",
      label: "資格・学習",
      description: "資格のロードマップと体系的な学習で、次のステップへ。",
      tone: "violet",
      items: [
        { title: "CCIE Security", href: "/docs/ccie-security" },
        { title: "CCST Cybersecurity", href: "/docs/ccst-cybersecurity" },
        { title: "ISC2 CC (Certified in Cybersecurity)", href: "/docs/cc-certified-in-cybersecurity-guide" },
        { title: "CCSP (Certified Cloud Security Professional)", href: "/docs/ccsp-study-guide" },
        { title: "CISSP (Certified Information Systems Security Professional)", href: "/docs/cissp-guide" },
        { title: "CSSLP (Certified Secure Software Lifecycle Professional)", href: "/docs/csslp-guide" },
        { title: "CyberOps Associate (200-201 CBROPS)", href: "/docs/cyberops-associate-guide" },
        { title: "CyberOps Professional (350-201 CBRCOR / 300-215 CBRFIR)", href: "/docs/cyberops-professional-guide" },
        { title: "AppSec Certifications", href: "/docs/certifications" },
      ],
    },
    {
      id: "archive",
      title: "Archive",
      label: "アーカイブ",
      description: "過去の版を参照し、考え方や対策の変化をたどる。",
      tone: "slate",
      items: [
        { title: "Security Approach (March 2026)", href: "/docs/archive/approach" },
      ],
    },
  ],
};

export type DocsConfig = typeof docsConfig;
