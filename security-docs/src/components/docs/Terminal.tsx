import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface TerminalProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const Terminal: React.FC<TerminalProps> = ({ title, children, className }) => {
  return (
    <div className={twMerge(clsx("bg-[#0a0e14] border border-[#374860] rounded-lg overflow-hidden my-5", className))}>
      {title && (
        <div className="flex items-center justify-between px-4 py-2 bg-[#222d40] border-b border-[#2a3548]">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50" />
          </div>
          <span className="font-mono text-[0.7rem] text-[#5a7090] truncate px-4">
            {title}
          </span>
          <div className="w-10" /> {/* Spacer to center title somewhat */}
        </div>
      )}
      <div className="p-5 font-mono text-[0.82rem] leading-[1.78] overflow-x-auto whitespace-pre">
        <code className="text-[#a8d8a8] bg-transparent border-none p-0">
          {children}
        </code>
      </div>
    </div>
  );
};
