import Link from "next/link";
import { docsConfig } from "@/config/docs";
import { SearchModal } from "@/components/search-modal";

interface DocsLayoutProps {
  children: React.ReactNode;
}

export default function DocsLayout({ children }: DocsLayoutProps) {
  return (
    <div className="min-h-screen flex-col flex">
      <header className="sticky top-0 z-40 w-full">
        <div className="container flex items-center justify-between">
          <div className="flex">
            <Link href="/" className="font-bold text-xl" style={{ textDecoration: 'none', color: 'inherit' }}>
              Security Studies 2026
            </Link>
          </div>
          <div className="flex items-center">
            <SearchModal />
          </div>
        </div>
      </header>
      
      <div className="container flex items-start" style={{ marginTop: '2rem', gap: '3rem' }}>
        <aside style={{ width: '280px', flexShrink: 0, position: 'sticky', top: '5rem', height: 'calc(100vh - 6rem)', overflowY: 'auto' }}>
          <nav>
            {docsConfig.sidebarNav.map((section) => (
              <div key={section.title} style={{ marginBottom: '2rem' }}>
                <h4 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--zinc-500)', letterSpacing: '0.1em', marginBottom: '0.75rem', paddingLeft: '1rem' }}>
                  {section.title}
                </h4>
                <div style={{ display: 'grid', gap: '0.25rem' }}>
                  {section.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                    >
                      {item.title}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </aside>
        
        <main style={{ flex: 1, minWidth: 0, paddingBottom: '8rem' }}>
          <article className="prose">
            {children}
          </article>
        </main>
      </div>
    </div>
  );
}
