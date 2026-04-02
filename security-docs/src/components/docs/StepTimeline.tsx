import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface Step {
  id?: string;
  title: React.ReactNode;
  content: React.ReactNode;
}

export interface StepTimelineProps {
  steps: Step[];
  className?: string;
}

export const StepTimeline: React.FC<StepTimelineProps> = ({ steps, className }) => {
  return (
    <div className={twMerge(clsx("relative my-5", className))}>
      {/* Vertical Line */}
      {steps.length > 0 && (
        <div 
          className="absolute left-[1.35rem] top-[2.75rem] bottom-0 w-[1px] bg-gradient-to-b from-blue-500 to-transparent" 
        />
      )}
      
      <div className="flex flex-col">
        {steps.map((step, index) => (
          <div key={step.id || index} className="flex gap-5 py-5 border-b border-[#2a3548] last:border-b-0">
            <div className="w-11 h-11 min-w-[2.75rem] rounded-full border-[1.5px] border-blue-500 bg-[#0d1117] flex items-center justify-center font-mono font-bold text-[0.8rem] text-blue-400 z-10">
              {(index + 1).toString().padStart(2, '0')}
            </div>
            <div className="flex-1 pt-1">
              <h4 className="font-sans font-bold text-[1rem] text-slate-50 mb-2">
                {step.title}
              </h4>
              <div className="text-[0.875rem] text-slate-400 leading-[1.82]">
                {step.content}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
