"use client";

import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ExternalLink, ChevronRight } from 'lucide-react';

export interface Source {
  title: string;
  url: string;
  description?: string;
}

export interface SourceReferencesProps {
  sources: Source[];
  className?: string;
}

export const SourceReferences: React.FC<SourceReferencesProps> = ({ sources, className }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const panelId = React.useId();

  return (
    <div className={twMerge(clsx("mt-7 bg-[#1c2333] border border-[#2a3548] rounded-md overflow-hidden", className))}>
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="w-full text-left bg-transparent border-none cursor-pointer flex items-center gap-2.5 px-5 py-3.5 font-mono text-[0.7rem] text-[#5a7090] transition-colors hover:bg-blue-400/10 group"
      >
        <ChevronRight className={clsx("w-3.5 h-3.5 text-blue-400 transition-transform duration-200", isOpen && "rotate-90")} />
        <span className="group-hover:text-blue-400 transition-colors uppercase tracking-wider">SOURCES & REFERENCES</span>
      </button>
      
      {isOpen && (
        <div id={panelId} className="px-5 pb-5 flex flex-col gap-3">
          {sources.map((source, index) => (
            <div key={source.url} className="flex gap-3 items-start group">
              <span className="font-mono text-[0.6rem] text-[#5a7090] pt-1 min-w-[1.25rem]">
                {(index + 1).toString().padStart(2, '0')}
              </span>
              <div className="flex flex-col gap-1">
                <a 
                  href={source.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-mono text-[0.7rem] text-blue-400 no-underline border-b border-dashed border-blue-400/25 hover:border-blue-400 transition-colors inline-flex items-center gap-1.5"
                >
                  {source.title}
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
                {source.description && (
                  <p className="text-[0.73rem] text-[#5a7090] leading-[1.4]">
                    {source.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
