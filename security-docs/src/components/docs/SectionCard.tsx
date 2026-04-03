import React from 'react';

export interface SectionCardProps {
  eyebrow?: string;
  title: React.ReactNode;
  sub?: React.ReactNode;
  children: React.ReactNode;
  id?: string;
}

export const SectionCard: React.FC<SectionCardProps> = ({ eyebrow, title, sub, children, id }) => {
  return (
    <div id={id} className="relative bg-[#161b27] border border-[#2a3548] rounded-[0.625rem] mb-7 overflow-hidden">
      {/* Top Gradient Bar */}
      <div 
        className="absolute top-0 left-0 right-0 h-[2px] section-card-top-gradient" 
      />
      {/* Left Accent Bar */}
      <div 
        className="absolute top-0 bottom-0 left-0 w-[3px] section-card-left-accent" 
      />
      
      <div className="p-5 md:pt-6 md:px-8 md:pb-5 border-b border-[#2a3548] relative text-left">
        {eyebrow && (
          <div className="font-mono text-[0.65rem] font-semibold tracking-[0.1em] uppercase text-blue-400 flex items-center gap-2 mb-2.5">
            {eyebrow}
          </div>
        )}
        <h2 className="font-sans font-extrabold text-[1.5rem] text-[#f0f6ff] leading-[1.15] tracking-[-0.02em] mb-2.5 border-none m-0 p-0">
          {title}
        </h2>
        {sub && (
          <div data-testid="section-card-subtitle" className="text-[0.9rem] text-[#94a3b8] leading-[1.82] mt-2">
            {sub}
          </div>
        )}
      </div>

      <div className="p-5 md:pt-7 md:px-8 md:pb-7 text-left">
        {children}
      </div>
    </div>
  );
};
