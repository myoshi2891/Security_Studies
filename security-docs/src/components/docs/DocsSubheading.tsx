import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface DocsSubheadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  color?: 'blue' | 'emerald' | 'red' | 'yellow';
}

export const DocsSubheading = ({ className, color = 'blue', children, ...props }: DocsSubheadingProps) => {
  let colorClasses = '';
  
  switch (color) {
    case 'emerald':
      colorClasses = "text-[#f0f6ff] before:bg-emerald-500 text-[1.1rem]";
      break;
    case 'red':
      colorClasses = "text-red-400 border-l-2 border-red-400 pl-3 uppercase tracking-[0.1em] text-[0.68rem] before:hidden";
      break;
    case 'yellow':
      colorClasses = "text-yellow-500 border-l-2 border-yellow-500 pl-3 uppercase tracking-[0.1em] text-[0.68rem] before:hidden";
      break;
    case 'blue':
    default:
      colorClasses = "text-[#f0f6ff] before:bg-blue-500 text-[1.1rem]";
      break;
  }
  
  return (
    <div 
      className={twMerge(
        clsx(
          "flex items-center gap-2.5 font-sans font-bold my-6",
          color !== 'red' && color !== 'yellow' ? "before:content-[''] before:w-5 before:h-[2px] before:shrink-0" : "",
          colorClasses,
          className
        )
      )}
      {...(props as any)}
    >
      {children}
    </div>
  );
};
