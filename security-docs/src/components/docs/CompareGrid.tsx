import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CompareGridProps {
  bad: React.ReactNode[];
  good: React.ReactNode[];
  className?: string;
}

export const CompareGrid: React.FC<CompareGridProps> = ({ bad, good, className }) => {
  const commonUlClass = "list-none flex flex-col gap-2 [&>li]:flex [&>li]:gap-2.5 [&>li]:text-[0.83rem] [&>li]:text-[#94a3b8] [&>li]:leading-[1.65] [&>li::before]:shrink-0";

  return (
    <div className={twMerge(clsx("grid grid-cols-1 sm:grid-cols-2 gap-4 my-5", className))}>
      <div className="bg-red-500/10 border border-red-400/20 rounded-md p-5">
        <span className="font-mono text-[0.65rem] font-bold tracking-[0.08em] uppercase text-red-400 mb-3.5 block">
          BAD PRACTICE
        </span>
        <ul className={clsx(commonUlClass, "[&>li::before]:content-['✗'] [&>li::before]:text-red-500")}>
          {bad.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>
      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-md p-5">
        <span className="font-mono text-[0.65rem] font-bold tracking-[0.08em] uppercase text-emerald-400 mb-3.5 block">
          GOOD PRACTICE
        </span>
        <ul className={clsx(commonUlClass, "[&>li::before]:content-['✓'] [&>li::before]:text-emerald-500")}>
          {good.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};
