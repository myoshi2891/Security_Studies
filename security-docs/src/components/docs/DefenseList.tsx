import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface DefenseListProps {
  label?: string;
  children: React.ReactNode;
  className?: string;
}

export const DefenseList: React.FC<DefenseListProps> = ({ label = 'DEFENSE MEASURES', children, className }) => {
  return (
    <div className={twMerge(clsx("bg-emerald-500/10 border border-emerald-500/20 border-l-4 border-l-emerald-500 rounded-r-md py-5 px-6 my-5", className))}>
      <span className="font-mono text-[0.65rem] font-bold tracking-[0.1em] uppercase text-emerald-400 mb-2.5 block">
        {label}
      </span>
      <ul className="list-none flex flex-col gap-2 [&>li]:flex [&>li]:gap-3 [&>li]:text-[0.875rem] [&>li]:text-slate-200 [&>li]:leading-[1.7] [&>li::before]:content-['✓'] [&>li::before]:text-emerald-500 [&>li::before]:font-bold [&>li::before]:shrink-0 [&>li::before]:mt-0.5">
        {children}
      </ul>
    </div>
  );
};
