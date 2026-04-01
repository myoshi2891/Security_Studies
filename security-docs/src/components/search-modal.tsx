"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, X, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import Fuse from "fuse.js";
import { SearchResult } from "@/lib/search";

export function SearchModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [fuse, setFuse] = useState<Fuse<SearchResult> | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/search")
      .then((res) => res.json())
      .then((data) => {
        setFuse(new Fuse(data, {
          keys: ["title", "description", "content"],
          threshold: 0.4,
        }));
      });
  }, []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  useEffect(() => {
    if (fuse && query) {
      const searchResults = fuse.search(query).map(r => r.item);
      setResults(searchResults);
    } else {
      setResults([]);
    }
  }, [query, fuse]);

  const onSelect = useCallback((href: string) => {
    setIsOpen(false);
    setQuery("");
    router.push(href);
  }, [router]);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-zinc-500 border rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
      >
        <Search className="w-4 h-4" />
        <span>Search...</span>
        <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-zinc-50 px-1.5 font-mono text-[10px] font-medium text-zinc-500 opacity-100 dark:bg-zinc-900">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-zinc-950/50 backdrop-blur-sm">
      <div className="w-full max-w-xl bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center gap-3 p-4 border-b dark:border-zinc-800">
          <Search className="w-5 h-5 text-zinc-400" />
          <input
            autoFocus
            placeholder="Search documentation..."
            className="flex-1 bg-transparent outline-none text-zinc-900 dark:text-zinc-50"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded">
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>
        <div className="max-h-[400px] overflow-y-auto p-2">
          {results.length > 0 ? (
            results.map((result) => (
              <button
                key={result.href}
                onClick={() => onSelect(result.href)}
                className="w-full flex flex-col items-start gap-1 p-3 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left transition-colors"
              >
                <div className="flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-zinc-50">
                  <FileText className="w-4 h-4 text-zinc-400" />
                  {result.title}
                </div>
                <div className="text-xs text-zinc-500 line-clamp-1">{result.description}</div>
              </button>
            ))
          ) : query ? (
            <div className="p-8 text-center text-zinc-500 text-sm">No results found for &quot;{query}&quot;</div>
          ) : (
            <div className="p-8 text-center text-zinc-500 text-sm">Type to start searching...</div>
          )}
        </div>
      </div>
    </div>
  );
}
