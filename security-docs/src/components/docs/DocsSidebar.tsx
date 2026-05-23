"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { docsConfig } from "@/config/docs";

const baseLinkClass =
  "block px-4 py-2 text-sm rounded-md transition-colors";
const inactiveLinkClass =
  "text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-50 dark:hover:bg-zinc-800";
const activeLinkClass =
  "bg-zinc-100 text-zinc-950 font-medium dark:bg-zinc-800 dark:text-zinc-50";

export function DocsSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-72 shrink-0 sticky top-24 h-[calc(100vh-6rem)] overflow-y-auto hidden lg:block">
      <nav>
        {docsConfig.sidebarNav.map((section) => (
          <div key={section.title} className="mb-8">
            <h4 className="text-[0.7rem] font-bold uppercase text-zinc-500 tracking-[0.1em] mb-3 px-4">
              {section.title}
            </h4>
            <div className="grid gap-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={`${baseLinkClass} ${isActive ? activeLinkClass : inactiveLinkClass}`}
                  >
                    {item.title}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
