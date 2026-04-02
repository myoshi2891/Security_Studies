import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface TagProps {
  color?: 'blue' | 'yellow' | 'red' | 'green' | 'cyan';
  children: React.ReactNode;
  className?: string;
}

export const Tag: React.FC<TagProps> = ({ color = 'blue', children, className }) => {
  const colorClasses = {
    blue: "bg-blue-400/10 text-blue-400 border-blue-400/25",
    yellow: "bg-yellow-400/10 text-yellow-400 border-yellow-400/30",
    red: "bg-red-400/10 text-red-400 border-red-400/30",
    green: "bg-emerald-400/10 text-emerald-400 border-emerald-400/30",
    cyan: "bg-cyan-400/10 text-cyan-400 border-cyan-400/30",
  };

  return (
    <span className={twMerge(clsx(
      "inline-block font-mono text-[0.63rem] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider border",
      colorClasses[color],
      className
    ))}>
      {children}
    </span>
  );
};
