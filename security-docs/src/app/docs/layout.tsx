import Link from "next/link";
import { SearchModal } from "@/components/search-modal";
import { DocsHeaderNav } from "@/components/docs/DocsHeaderNav";
import './docs-layout.css';

interface DocsLayoutProps {
  children: React.ReactNode;
}

/**
 * Full-width documentation layout with global navigation and search in its header.
 *
 * @param children - Content to render inside the main article area
 * @returns The header with global navigation and the full-width main content region
 */
export default function DocsLayout({ children }: DocsLayoutProps) {
  return (
    <div className="docs-shell">
      <header className="docs-header">
        <div className="docs-header-inner">
          <div className="flex">
            <Link href="/" className="font-bold text-xl no-underline text-inherit">
              Security Studies 2026
            </Link>
          </div>
          <DocsHeaderNav />
          <SearchModal />
        </div>
      </header>
      <main className="docs-main">
        <article className="prose docs-article text-zinc-700 dark:text-zinc-300 dark:prose-invert">
          {children}
        </article>
      </main>
    </div>
  );
}
