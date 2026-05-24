import Link from "next/link";
import { SearchModal } from "@/components/search-modal";
import { DocsSidebar } from "@/components/docs/DocsSidebar";

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
        <DocsSidebar />
        
        <main className="flex-1 min-w-0 pb-32">
          <article className="prose text-zinc-700 dark:text-zinc-300 dark:prose-invert max-w-none">
            {children}
          </article>
        </main>
      </div>
    </div>
  );
}
