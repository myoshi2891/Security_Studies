export const docsConfig = {
  sidebarNav: [
    {
      title: "Getting Started",
      items: [
        { title: "Security Approach 2026", href: "/docs/approach" },
        { title: "Security Architecture", href: "/docs/architecture" },
      ],
    },
    {
      title: "Security Guides",
      items: [
        { title: "AI Coding Safety", href: "/docs/ai-coding-safety" },
        { title: "LLM & AI Security", href: "/docs/llm-ai-security" },
        { title: "Secure SDLC Guide", href: "/docs/secdev-guide" },
      ],
    },
    {
      title: "Advanced Topics",
      items: [
        { title: "Software Supply Chain", href: "/docs/supply-chain" },
        { title: "Post-Quantum Cryptography", href: "/docs/pqc" },
        { title: "OWASP Top 10 (2025/2026)", href: "/docs/owasp" },
        { title: "Threat Landscape 2026", href: "/docs/threat-landscape" },
      ],
    },
    {
      title: "Resources",
      items: [
        { title: "AppSec Certifications", href: "/docs/certifications" },
      ],
    },
  ],
};

export type DocsConfig = typeof docsConfig;
