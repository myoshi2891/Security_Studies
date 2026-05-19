import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import hljs from 'highlight.js/lib/core';
import bash from 'highlight.js/lib/languages/bash';
import typescript from 'highlight.js/lib/languages/typescript';
import yaml from 'highlight.js/lib/languages/yaml';
import json from 'highlight.js/lib/languages/json';
import markdown from 'highlight.js/lib/languages/markdown';
import 'highlight.js/styles/github-dark.css';

// 静的 import で必要な言語のみ登録（Turbopack の動的チャンク生成を完全に回避）
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('yaml', yaml);
hljs.registerLanguage('json', json);
hljs.registerLanguage('markdown', markdown);

export interface TerminalProps {
  title?: string;
  children?: string;
  className?: string;
  code?: string;
}

export const Terminal = ({ title, children, className, code }: TerminalProps) => {
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

  let htmlContent: string;
  try {
    htmlContent = hljs.highlight(contentString, { language: lang, ignoreIllegals: true }).value;
  } catch {
    htmlContent = contentString
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
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
      <pre className="p-5 m-0 font-mono text-[0.82rem] leading-[1.78] overflow-x-auto bg-transparent">
        <code
          className={`hljs language-${lang}`}
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </pre>
    </div>
  );
};
