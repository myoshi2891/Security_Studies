import React from 'react';

export interface HeroSectionProps {
  section: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  chips?: string[];
}

export const HeroSection: React.FC<HeroSectionProps> = ({ section, title, description, chips }) => {
  return (
    <header className="relative overflow-hidden py-20 pb-16 border-b border-[#2a3548] bg-gradient-to-br from-[#0d1117] via-[#101825] to-[#0d1117] -mx-4 sm:-mx-6 md:-mx-8 lg:-mx-12 px-4 sm:px-6 md:px-8 lg:px-12 mb-12">
      {/* Background glows */}
      <div className="absolute w-[700px] h-[700px] rounded-full top-[-200px] right-[-100px] pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(96,165,250,.06), transparent 65%)' }} />
      <div className="absolute w-[500px] h-[500px] rounded-full bottom-[-100px] left-[-100px] pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(56,189,248,.04), transparent 65%)' }} />

      <div className="relative z-10 max-w-[1340px] mx-auto">
        <div className="inline-flex items-center gap-2.5 bg-blue-500/10 border border-blue-500/25 px-4 py-1.5 rounded-md mb-7">
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" style={{ boxShadow: '0 0 0 0 rgba(52,211,153,.4)' }}></span>
          <span className="font-mono text-[0.7rem] text-blue-400 tracking-[0.08em] uppercase">
            SecDev 2026 | Section {section} | ONLINE
          </span>
        </div>

        <h1 className="font-sans text-[clamp(2.5rem,6vw,4.75rem)] font-extrabold text-[#f0f6ff] leading-none tracking-tight mb-5">
          {title}
        </h1>

        {description && (
          <p className="text-[1.05rem] text-[#94a3b8] max-w-3xl leading-[1.85] mb-8">
            {description}
          </p>
        )}

        {chips && chips.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {chips.map((chip, index) => (
              <span key={index} className="font-mono text-[0.68rem] border border-[#374860] bg-[#1c2333] text-[#5a7090] px-3 py-1 rounded tracking-wide">
                {chip}
              </span>
            ))}
          </div>
        )}
      </div>
    </header>
  );
};
