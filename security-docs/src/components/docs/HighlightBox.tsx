import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface HighlightBoxProps {
  color?: 'blue' | 'yellow' | 'red' | 'green' | 'cyan';
  children: React.ReactNode;
  className?: string;
}

export const HighlightBox: React.FC<HighlightBoxProps> = ({ color = 'blue', children, className }) => {
  const colorClasses = {
    blue: "bg-blue-400/10 border-blue-400/20",
    yellow: "bg-yellow-400/10 border-yellow-400/25",
    red: "bg-red-400/10 border-red-400/25",
    green: "bg-emerald-400/10 border-emerald-400/25",
    cyan: "bg-cyan-400/10 border-cyan-400/20",
  };

  return (
    <div className={twMerge(clsx(
      "bg-[#1c2333] border border-[#374860] rounded-md p-5 md:px-6 my-5 text-[0.875rem] leading-[1.8]",
      colorClasses[color],
      className
    ))}>
      {children}
    </div>
  );
};
