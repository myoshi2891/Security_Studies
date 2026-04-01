import Link from "next/link";
import { docsConfig } from "@/config/docs";
import { SearchModal } from "@/components/search-modal";

interface DocsLayoutProps {
  children: React.ReactNode;
}

export default function DocsLayout({ children }: DocsLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 w-full border-b bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between px-8 mx-auto">
          <div className="flex gap-6 md:gap-10">
            <Link href="/" className="flex items-center space-x-2">
              <span className="inline-block font-bold text-xl tracking-tighter text-zinc-900 dark:text-zinc-50">
                Security Studies 2026
              </span>
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <SearchModal />
          </div>
        </div>
      </header>
      <div className="container flex-1 items-start md:grid md:grid-cols-[240px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-10 px-8 mx-auto">
        <aside className="fixed top-16 z-30 -ml-2 hidden h-[calc(100vh-4rem)] w-full shrink-0 overflow-y-auto border-r md:sticky md:block pr-4 pt-8">
          <div className="w-full space-y-6">
            {docsConfig.sidebarNav.map((section) => (
              <div key={section.title} className="pb-4">
                <h4 className="mb-2 px-2 py-1 text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  {section.title}
                </h4>
                <div className="grid grid-flow-row auto-rows-max text-sm gap-1">
                  {section.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="group flex w-full items-center rounded-md border border-transparent px-2 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors text-zinc-600 dark:text-zinc-400"
                    >
                      {item.title}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </aside>
        <main className="relative py-6 lg:gap-10 lg:py-8 xl:grid xl:grid-cols-[1fr_200px]">
          <div className="mx-auto w-full min-w-0 max-w-4xl px-4 md:px-8">
            <article className="prose prose-zinc dark:prose-invert max-w-none">
              {children}
            </article>
          </div>
          <aside className="hidden text-sm xl:block">
            {/* Table of Contents can be added here */}
          </aside>
        </main>
      </div>
    </div>
  );
}
