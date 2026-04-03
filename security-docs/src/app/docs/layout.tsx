import Link from "next/link";
import { docsConfig } from "@/config/docs";
import { SearchModal } from "@/components/search-modal";

interface DocsLayoutProps {
  children: React.ReactNode;
}

/**
 * Layout component that wraps documentation pages with a sticky header, a left sidebar navigation (desktop only), and a main article area.
 *
 * @param children - Content to render inside the main article area
 * @returns The root JSX element containing the header, responsive sidebar navigation, and main content region
 */
export default function DocsLayout({ children }: DocsLayoutProps) {
  return (
    <div className="min-h-screen flex-col flex">
      <header className="sticky top-0 z-40 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-zinc-950/95 dark:supports-[backdrop-filter]:bg-zinc-950/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex">
            <Link href="/" className="font-bold text-xl no-underline text-inherit">
              Security Studies 2026
            </Link>
          </div>
          <div className="flex items-center">
            <SearchModal />
          </div>
        </div>
      </header>
      
      <div className="container flex items-start mt-8 gap-12">
        <aside className="w-72 shrink-0 sticky top-24 h-[calc(100vh-6rem)] overflow-y-auto hidden lg:block">
          <nav>
            {docsConfig.sidebarNav.map((section) => (
              <div key={section.title} className="mb-8">
                <h4 className="text-[0.7rem] font-bold uppercase text-zinc-500 tracking-[0.1em] mb-3 px-4">
                  {section.title}
                </h4>
                <div className="grid gap-1">
                  {section.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block px-4 py-2 text-sm text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-50 dark:hover:bg-zinc-800 rounded-md transition-colors"
                    >
                      {item.title}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </aside>
        
        <main className="flex-1 min-w-0 pb-32">
          <article className="prose dark:prose-invert max-w-none">
            {children}
          </article>
        </main>
      </div>
    </div>
  );
}
