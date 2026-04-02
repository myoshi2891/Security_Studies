import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface RiskBadgeProps {
  level: 'critical' | 'high' | 'medium' | 'info';
  children: React.ReactNode;
  className?: string;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, children, className }) => {
  const baseClasses = "font-mono text-[0.63rem] font-bold px-2.5 py-0.5 rounded uppercase tracking-[0.05em] border inline-flex items-center";
  
  const levelClasses = {
    critical: "bg-red-400/10 text-red-400 border-red-400/30",
    high: "bg-yellow-400/10 text-yellow-400 border-yellow-400/30",
    medium: "bg-blue-400/10 text-blue-400 border-blue-400/25",
    info: "bg-cyan-400/10 text-cyan-400 border-cyan-400/30",
  };

  return (
    <span className={twMerge(clsx(baseClasses, levelClasses[level], className))}>
      {children}
    </span>
  );
};
