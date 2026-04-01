import Link from "next/link";
import { docsConfig } from "@/config/docs";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
      <header className="sticky top-0 z-40 w-full border-b bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between px-8 mx-auto">
          <div className="font-bold text-xl tracking-tighter">
            Security Studies 2026
          </div>
          <nav className="flex gap-6 text-sm font-medium">
            <Link href="/docs/approach" className="hover:text-zinc-500 transition-colors">
              Documentation
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-24 md:py-32">
          <div className="container px-8 mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-6 bg-gradient-to-r from-zinc-900 to-zinc-500 dark:from-zinc-50 dark:to-zinc-500 bg-clip-text text-transparent">
              Master Software Security <br /> for the 2026 Landscape.
            </h1>
            <p className="text-xl text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              高度に産業化されたサイバー脅威、AIの兵器化、耐量子計算機暗号。
              現代のエンジニアが知るべき、セキュア開発のすべてを体系化した完全ガイド。
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/docs/approach"
                className="inline-flex h-12 items-center justify-center rounded-full bg-zinc-900 dark:bg-zinc-50 px-8 text-sm font-medium text-zinc-50 dark:text-zinc-900 hover:opacity-90 transition-opacity shadow-lg"
              >
                Get Started
              </Link>
            </div>
          </div>
        </section>

        <section className="py-24 border-t bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="container px-8 mx-auto">
            <h2 className="text-3xl font-bold tracking-tight mb-12 text-center">Documentation Categories</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {docsConfig.sidebarNav.map((section) => (
                <div key={section.title} className="p-8 rounded-2xl border bg-white dark:bg-zinc-950 shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="text-xl font-bold mb-4">{section.title}</h3>
                  <ul className="space-y-3">
                    {section.items.map((item) => (
                      <li key={item.href}>
                        <Link href={item.href} className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
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

      <footer className="border-t py-12 bg-white dark:bg-zinc-950">
        <div className="container px-8 mx-auto text-center text-sm text-zinc-500">
          <p>© 2026 Security Studies Project. Advanced Security Guidance.</p>
        </div>
      </footer>
    </div>
  );
}
