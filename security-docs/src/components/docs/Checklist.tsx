"use client";

import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Check } from 'lucide-react';

export interface ChecklistItem {
  text: string;
  tag?: string;
}

export interface ChecklistProps {
  items: ChecklistItem[];
  className?: string;
}

export const Checklist: React.FC<ChecklistProps> = ({ items, className }) => {
  const [checkedItems, setCheckedItems] = React.useState<boolean[]>(new Array(items.length).fill(false));

  const toggleItem = (index: number) => {
    const newChecked = [...checkedItems];
    newChecked[index] = !newChecked[index];
    setCheckedItems(newChecked);
  };

  const completedCount = checkedItems.filter(Boolean).length;
  const progressPercent = (completedCount / items.length) * 100;

  return (
    <div className={twMerge(clsx("my-5 space-y-4", className))}>
      {/* Progress Bar */}
      <div className="bg-[#1c2333] border border-[#2a3548] rounded-md p-3.5 flex items-center gap-4">
        <div className="flex-1 h-1.5 bg-[#2a3548] rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <span className="font-mono text-[0.8rem] text-blue-400 min-w-[3rem] text-right">
          {Math.round(progressPercent)}%
        </span>
      </div>

      <div className="space-y-1.5">
        {items.map((item, index) => (
          <div 
            key={index}
            onClick={() => toggleItem(index)}
            className={clsx(
              "flex items-start gap-3 px-3.5 py-2.5 rounded-md border cursor-pointer transition-all duration-150 select-none",
              checkedItems[index] 
                ? "bg-emerald-500/5 border-emerald-500/30 text-[#e2e8f4]" 
                : "bg-[#0d1117] border-[#2a3548] text-[#94a3b8] hover:border-[#374860]"
            )}
          >
            <div className={clsx(
              "w-5 h-5 min-w-[1.25rem] rounded border-[1.5px] flex items-center justify-center transition-all duration-150 mt-0.5",
              checkedItems[index] 
                ? "bg-emerald-500 border-emerald-500 text-[#0d1117]" 
                : "bg-[#1c2333] border-[#4a6080]"
            )}>
              {checkedItems[index] && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
            </div>
            <span className="text-[0.84rem] leading-[1.6]">
              {item.text}
            </span>
            {item.tag && (
              <span className="font-mono text-[0.6rem] font-bold px-1.5 py-0.5 rounded bg-[#1c2333] text-[#5a7090] uppercase tracking-wider ml-auto shrink-0">
                {item.tag}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
