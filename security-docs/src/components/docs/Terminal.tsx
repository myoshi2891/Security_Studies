import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { codeToHtml } from 'shiki';

export interface TerminalProps {
  title?: string;
  children?: string;
  className?: string;
  code?: string;
}

export const Terminal = async ({ title, children, className, code }: TerminalProps) => {
  const content = code ?? children ?? '';
  const contentString = typeof content === 'string' ? content : String(content);
  let lang = 'typescript';
  
  if (title) {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.endsWith('.sh')) lang = 'bash';
    else if (lowerTitle.endsWith('.yml') || lowerTitle.endsWith('.yaml')) lang = 'yaml';
    else if (lowerTitle.endsWith('.json')) lang = 'json';
    else if (lowerTitle.endsWith('.md')) lang = 'markdown';
  }

  let htmlContent = '';
  try {
    htmlContent = await codeToHtml(contentString, {
      lang,
      theme: 'github-dark',
    });
  } catch (e) {
    const escapedContent = contentString
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
    htmlContent = `<pre><code>${escapedContent}</code></pre>`;
  }

  return (
    <div className={twMerge(clsx("bg-[#0d1117] border border-[#374860] rounded-lg overflow-hidden my-5", className))}>
      {title && (
        <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-[#30363d]">
          <div className="flex gap-1.5">
            <div aria-hidden="true" className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
            <div aria-hidden="true" className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
            <div aria-hidden="true" className="w-2.5 h-2.5 rounded-full bg-emerald-500/50" />
          </div>
          <span className="font-mono text-[0.7rem] text-[#8b949e] truncate px-4">
            {title}
          </span>
          <div className="w-10" /> {/* Spacer to center title somewhat */}
        </div>
      )}
      <div 
        className="p-5 font-mono text-[0.82rem] leading-[1.78] overflow-x-auto [&>pre]:!bg-transparent [&>pre]:!m-0 [&>pre]:!p-0"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </div>
  );
};
