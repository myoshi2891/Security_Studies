import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface DocsSubheadingProps extends React.HTMLAttributes<HTMLDivElement> {
  color?: 'blue' | 'emerald' | 'red' | 'yellow';
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}

export const DocsSubheading = ({ className, color = 'blue', level, children, ...props }: DocsSubheadingProps) => {
  const bgColorClass = {
    emerald: 'before:bg-emerald-500',
    blue: 'before:bg-blue-500',
    red: 'before:bg-red-500',
    yellow: 'before:bg-yellow-500',
  }[color];
  
  return (
    <div 
      role="heading"
      aria-level={level ?? 3}
      className={twMerge(
        clsx(
          "flex items-center gap-2.5 font-sans font-bold text-[1.1rem] text-[#f0f6ff] my-6",
          "before:content-[''] before:w-5 before:h-[2px] before:shrink-0",
          bgColorClass,
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};
