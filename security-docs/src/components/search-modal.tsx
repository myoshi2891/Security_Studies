"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, X, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import Fuse from "fuse.js";
import type { SearchResult } from "@/lib/search";

export function SearchModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [fuse, setFuse] = useState<Fuse<SearchResult> | null>(null);
  const [isError, setIsError] = useState(false);
  const [shortcutLabel, setShortcutLabel] = useState("Ctrl+K");
  const router = useRouter();

  useEffect(() => {
    fetch("/api/search")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch search index");
        return res.json();
      })
      .then((data) => {
        setFuse(new Fuse(data, {
          keys: ["title", "description", "content"],
          threshold: 0.4,
        }));
      })
      .catch((err) => {
        console.error("Search index fetch error:", err);
        setIsError(true);
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
    const handleEscape = (e: KeyboardEvent) => {
      if (isOpen && e.key === "Escape") {
        setIsOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  useEffect(() => {
    // Detect Mac platform for accurate shortcut rendering client-side
    const isMac = typeof window !== "undefined" && /Macintosh|MacIntel|MacPPC|Mac68K/.test(navigator.userAgent);
    if (isMac) {
      setShortcutLabel("⌘K");
    }
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
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-3 px-4 py-2 text-sm text-zinc-500 bg-transparent border border-zinc-200 dark:border-zinc-800 rounded-md cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors w-full md:w-64"
      >
        <Search size={16} />
        <span className="flex-1 text-left">Search...</span>
        <kbd className="hidden md:inline-flex h-5 select-none items-center gap-1 rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800 px-1.5 font-mono text-[10px] font-medium text-zinc-500 opacity-100">
          {shortcutLabel === "⌘K" ? (
            <><span className="text-xs">⌘</span>K</>
          ) : (
            <>{shortcutLabel}</>
          )}
        </kbd>
      </button>
    );
  }

  return (
    <div className="search-modal-backdrop" onClick={() => setIsOpen(false)}>
      <div 
        className="search-modal" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Search"
      >
        <div className="flex items-center p-4 border-b border-zinc-200 dark:border-zinc-800 gap-4">
          <Search size={20} className="text-zinc-400" />
          <input
            autoFocus
            aria-label="Search documentation"
            placeholder="Search documentation..."
            className="flex-1 bg-transparent border-none outline-none text-base text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button 
            type="button"
            aria-label="Close"
            onClick={() => setIsOpen(false)} 
            className="bg-transparent border-none cursor-pointer text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-2 overflow-y-auto max-h-[400px]">
          {isError ? (
            <div className="p-8 text-center text-red-500 text-sm">
              Failed to load search index. Please try again later.
            </div>
          ) : results.length > 0 ? (
            results.map((result) => (
              <button
                type="button"
                aria-label={`Open ${result.title}`}
                key={result.href}
                onClick={() => onSelect(result.href)}
                className="w-full text-left bg-transparent p-4 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors border-b border-zinc-50 dark:border-zinc-900 last:border-0 block"
              >
                <div className="font-bold text-sm mb-1 flex items-center gap-2 text-zinc-900 dark:text-zinc-50">
                  <FileText size={14} className="text-zinc-400" />
                  {result.title}
                </div>
                <div className="text-xs text-zinc-500 line-clamp-1">{result.description}</div>
              </button>
            ))
          ) : (
            <div className="p-8 text-center text-zinc-500 text-sm">
              {query ? `No results for "${query}"` : "Type to start searching..."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
