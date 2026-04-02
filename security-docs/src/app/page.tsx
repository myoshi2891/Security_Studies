import Link from "next/link";
import { docsConfig } from "@/config/docs";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-zinc-950">
      <header className="border-b dark:border-zinc-800">
        <div className="container flex items-center justify-between h-16">
          <div className="font-black text-xl tracking-tight text-zinc-900 dark:text-zinc-50">
            Security Studies 2026
          </div>
          <nav className="flex gap-6">
            <Link href="/docs/approach" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 transition-colors no-underline">
              Documentation
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-32 text-center bg-zinc-50 dark:bg-zinc-900/50">
          <div className="container max-w-5xl">
            <h1 className="text-6xl md:text-7xl font-black tracking-tighter mb-6 leading-[1.1] text-zinc-900 dark:text-zinc-50">
              Master Software Security <br /> for 2026.
            </h1>
            <p className="text-xl text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              高度に産業化されたサイバー脅威、AIの兵器化、耐量子計算機暗号。
              現代のエンジニアが知るべき、セキュア開発のすべてを体系化した完全版ガイドブック。
            </p>
            <Link
              href="/docs/approach"
              className="inline-flex h-14 items-center justify-center rounded-full bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 px-10 text-base font-bold transition-transform hover:scale-105 no-underline"
            >
              Get Started
            </Link>
          </div>
        </section>

        <section className="py-24">
          <div className="container">
            <h2 className="text-3xl font-black text-center mb-16 tracking-tight text-zinc-900 dark:text-zinc-50">
              Documentation Categories
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {docsConfig.sidebarNav.map((section) => (
                <div key={section.title} className="p-8 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="text-lg font-bold mb-6 text-zinc-900 dark:text-zinc-50">{section.title}</h3>
                  <ul className="grid gap-3 list-none p-0">
                    {section.items.map((item) => (
                      <li key={item.href}>
                        <Link href={item.href} className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors no-underline text-sm flex items-center gap-3 group">
                          <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700 group-hover:bg-zinc-900 dark:group-hover:bg-zinc-50 transition-colors" />
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

      <footer className="py-16 border-t border-zinc-200 dark:border-zinc-800 text-center text-zinc-500 dark:text-zinc-400 text-sm bg-zinc-50 dark:bg-zinc-900/50">
        <p>© 2026 Security Studies Project. Advanced Security Guidance.</p>
      </footer>
    </div>
  );
}
