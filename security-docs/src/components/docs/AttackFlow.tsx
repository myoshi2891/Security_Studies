import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface AttackFlowProps {
  label?: string;
  children: React.ReactNode;
  className?: string;
}

export const AttackFlow: React.FC<AttackFlowProps> = ({ label = 'ATTACK FLOW', children, className }) => {
  return (
    <div className={twMerge(clsx("bg-red-500/10 border border-red-400/20 border-l-4 border-l-red-400 rounded-r-md py-5 px-6 my-5", className))}>
      <span className="font-mono text-[0.65rem] font-bold tracking-[0.1em] uppercase text-red-400 mb-2.5 block">
        {label}
      </span>
      <div className="text-[0.875rem] text-[#94a3b8] leading-[1.82]">
        {children}
      </div>
    </div>
  );
};
