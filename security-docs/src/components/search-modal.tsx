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
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 1rem',
          fontSize: '0.875rem',
          color: 'var(--zinc-500)',
          backgroundColor: 'transparent',
          border: '1px solid var(--border)',
          borderRadius: '0.375rem',
          cursor: 'pointer'
        }}
      >
        <Search size={16} />
        <span>Search...</span>
        <span style={{ marginLeft: '1rem', fontSize: '0.75rem', opacity: 0.6 }}>⌘K</span>
      </button>
    );
  }

  return (
    <div className="search-modal-backdrop" onClick={() => setIsOpen(false)}>
      <div className="search-modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '1rem', borderBottom: '1px solid var(--border)', gap: '1rem' }}>
          <Search size={20} color="var(--zinc-400)" />
          <input
            autoFocus
            placeholder="Search documentation..."
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: '1rem',
              color: 'var(--fg)'
            }}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--zinc-400)' }}>
            <X size={20} />
          </button>
        </div>
        <div style={{ padding: '0.5rem', overflowY: 'auto', maxHeight: '400px' }}>
          {results.length > 0 ? (
            results.map((result) => (
              <div
                key={result.href}
                onClick={() => onSelect(result.href)}
                style={{
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  borderBottom: '1px solid var(--zinc-100)'
                }}
                className="search-result-item"
              >
                <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileText size={14} />
                  {result.title}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--zinc-500)' }}>{result.description}</div>
              </div>
            ))
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--zinc-500)', fontSize: '0.875rem' }}>
              {query ? `No results for "${query}"` : "Type to start searching..."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
